import { Request, Response } from "express";
import { Op, fn, col, literal } from "sequelize";
import moment from "moment";
import { maxid } from "../utils";
import OffSales from "../models/OffSales.Model";
import OffsaleList from "../models/OffSaleList.Model";
import Billsales from "../models/Billsales";
import BillsaleList from "../models/BillsaleList";
import Users from "../models/Users.Model";
import Products from "../models/Products";
import Units from "../models/Units.Model";
interface QueryParams {
    limit?: string;
    skip?: string;
    orderBy?: string;
    order?: string;
}

const toNumber = (value: unknown) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
};

/** ເງື່ອນໄຂບິນທີ່ຈະຖືກປິດຍອດ: ບິນປົກກະຕິ (status 1) ທີ່ຍັງບໍ່ໄດ້ປິດຍອດ (statusoff 1) */
const openBillWhere = (shopid: number, startDate: Date, endDate: Date) => ({
    shopid,
    status: 1,
    statusoff: 1,
    createdAt: { [Op.between]: [startDate, endDate] },
});

/**
 * ປິດຍອດ — ເກັບຂໍ້ມູນສະຫຼຸບໄວ້ໃນ tbl_offsales ແລ້ວລັອກບິນ (statusoff = 2)
 * body: { shopid, start_date, end_date, createby?, description? }
 */
export const createOffSale = async (req: Request, res: Response) => {
    const { shopid, start_date, end_date, createby, description } = req.body as any;
    if (!shopid) return res.status(400).json({ error: "shopid is required" });

    const startDate = moment(start_date).startOf("day").toDate();
    const endDate = moment(end_date || start_date).endOf("day").toDate();
    const whereConditions = openBillWhere(shopid, startDate, endDate);

    // ສະຫຼຸບ + ບັນທຶກ + ລັອກບິນ ຕ້ອງສຳເລັດພ້ອມກັນ ຫຼື ບໍ່ເຮັດຫຍັງເລີຍ
    const t = await OffSales.sequelize?.transaction();
    try {
        const waiting = await Billsales.count({ where: whereConditions, transaction: t });
        if (!waiting) {
            await t?.rollback();
            return res.status(409).json({ error: "ບໍ່ມີບິນທີ່ຍັງບໍ່ໄດ້ປິດຍອດໃນຊ່ວງວັນທີນີ້" });
        }

        const totals = await Billsales.findOne({
            where: whereConditions,
            raw: true,
            transaction: t,
            attributes: [
                [fn("COUNT", col("bill_uuid")), "quantity"],
                [literal("COALESCE(SUM(`balanceTotal`), 0)"), "balanceTotal"],
                [literal("COALESCE(SUM(`getCash`), 0)"), "getCash"],
                [literal("COALESCE(SUM(`getTransfer`), 0)"), "getTransfer"],
                // ຂາຍໜ້າຮ້ານ = typesale 1, ຂາຍອອນໄລນ໌ = typesale 2
                [literal("COALESCE(SUM(CASE WHEN `typesale` = 2 THEN `balanceTotal` ELSE 0 END), 0)"), "balance_online"],
                [literal("COALESCE(SUM(CASE WHEN `typesale` <> 2 THEN `balanceTotal` ELSE 0 END), 0)"), "balance_shop"],
            ],
        }) as unknown as Record<string, unknown> | null;

        const new_uuid = await maxid(OffSales, "_uuid", { transaction: t });
        const offsale = await OffSales.create(
            {
                _uuid: new_uuid,
                shopid,
                start_date: startDate,
                end_date: endDate,
                quantity: toNumber(totals?.quantity),
                balanceTotal: toNumber(totals?.balanceTotal),
                getCash: toNumber(totals?.getCash),
                getTransfer: toNumber(totals?.getTransfer),
                balance_shop: toNumber(totals?.balance_shop),
                balance_online: toNumber(totals?.balance_online),
                description: description ?? null,
                createby: createby ?? null,
                status: 1,
            },
            { transaction: t }
        );

        // ລວມຍອດຈາກລາຍລະອຽດບິນ (ແຍກຕາມສິນຄ້າ) ໄປເກັບໄວ້ໃນ tbl_offsale_list
        const lines = await BillsaleList.findAll({
            attributes: [
                "productid",
                [fn("COALESCE", fn("SUM", col("BillsaleList.quantity")), 0), "quantity"],
                [
                    fn("COALESCE", fn("SUM", literal("`BillsaleList`.`price_sales` * `BillsaleList`.`quantity` - COALESCE(`BillsaleList`.`discount`, 0)")), 0),
                    "balance_sales",
                ],
                [
                    fn("COALESCE", fn("SUM", literal("(`BillsaleList`.`price_sales` - `BillsaleList`.`price_buy`) * `BillsaleList`.`quantity` - COALESCE(`BillsaleList`.`discount`, 0)")), 0),
                    "net_profit",
                ],
                [fn("COALESCE", fn("MAX", col("product.quantity")), 0), "remaining"],
            ],
            include: [
                {
                    model: Billsales,
                    as: "bill",
                    attributes: [],
                    required: true,
                    where: whereConditions,
                },
                {
                    model: Products,
                    as: "product",
                    attributes: [],
                    required: false,
                },
            ],
            where: { status: 1 },
            group: ["BillsaleList.productid"],
            raw: true,
            transaction: t,
        }) as unknown as Array<Record<string, unknown>>;

        if (lines.length > 0) {
            const firstListId = await maxid(OffsaleList, "_uuid", { transaction: t });
            await OffsaleList.bulkCreate(
                lines.map((line, index) => ({
                    _uuid: firstListId + index,
                    offsaleid: new_uuid,
                    productid: toNumber(line.productid),
                    quantity: toNumber(line.quantity),          // ຈຳນວນທີ່ຂາຍອອກ
                    remaining: toNumber(line.remaining),        // ຈຳນວນຄົງເຫຼືອຕອນປິດຍອດ
                    balance_sales: toNumber(line.balance_sales),// ຍອດເງິນຂາຍ
                    net_profit: toNumber(line.net_profit),      // ກຳໄລ (ຂາຍ - ຕົ້ນທຶນ - ສ່ວນຫຼຸດ)
                    status: 1,
                })),
                { transaction: t }
            );
        }

        // ຕິດລະຫັດການປິດຍອດໄວ້ນຳບິນ ເພື່ອໃຫ້ຮູ້ວ່າບິນນີ້ຖືກປິດຍອດຄັ້ງໃດ
        await Billsales.update(
            { statusoff: 2, offsaleid: new_uuid, updatedAt: new Date() },
            { where: whereConditions, transaction: t }
        );

        await t?.commit();
        return res.status(200).json({
            message: `ປິດຍອດ ${waiting} ບິນສຳເລັດ`,
            data: offsale,
            offsaleid: new_uuid,
            closed: waiting,
            products: lines.length,
        });
    } catch (error) {
        await t?.rollback();
        console.error("Failed to create OffSale:", error);
        return res.status(500).json({
            error: error instanceof Error ? error.message : "Failed to create OffSale",
        });
    }
};

/**
 * ລາຍການປິດຍອດຍ້ອນຫຼັງ
 * body: { shopid, start_date?, end_date? }  query: ?skip=&limit=
 */
export const getOffSales = async (
    req: Request<{}, {}, {}, QueryParams>,
    res: Response
) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;
        const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
        const orderBy = req.query.orderBy || "_uuid";
        const order = (req.query.order || "DESC").toUpperCase() as "ASC" | "DESC";

        const { shopid, start_date, end_date } = req.body as any;
        if (!shopid) return res.status(400).json({ error: "shopid is required" });

        const whereConditions: any = { shopid, status: 1 };
        if (start_date) {
            whereConditions.createdAt = {
                [Op.between]: [
                    moment(start_date).startOf("day").toDate(),
                    moment(end_date || start_date).endOf("day").toDate(),
                ],
            };
        }

        const { rows, count } = await OffSales.findAndCountAll({
            where: whereConditions,
            ...(limit !== null ? { limit, offset: skip } : {}),
            order: [[orderBy, order]],
            include: [
                { model: Users, as: "user", attributes: ["userName", "phone"] },
            ],
        });

        return res.status(200).json({ data: rows, total: count, limit, skip });
    } catch (error) {
        console.error("Failed to fetch OffSales:", error);
        return res.status(500).json({ error: "Failed to fetch OffSales" });
    }
};

/** ລາຍລະອຽດການປິດຍອດ 1 ຄັ້ງ + ບິນທັງໝົດທີ່ຢູ່ໃນຮອບນັ້ນ */
export const getOffSaleById = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const offsale = await OffSales.findByPk(req.params.id, {
            include: [
                { model: Users, as: "user", attributes: ["userName", "phone"] },
            ],
        });
        if (!offsale) return res.status(404).json({ error: "OffSale not found" });

        const bills = await Billsales.findAll({
            where: { offsaleid: offsale._uuid },
            order: [["bill_uuid", "ASC"]],
            include: [{ model: Users, as: "user", attributes: ["userName", "phone"] }],
        });

        const products = await OffsaleList.findAll({
            where: { offsaleid: offsale._uuid, status: 1 },
            order: [["balance_sales", "DESC"]],
            include: [{ model: Products, as: "product",
                include: [{ model: Units, as: "unit" }]
             }],
        });

        return res.status(200).json({ data: offsale, bills, products, total: bills.length });
    } catch (error) {
        console.error("Failed to fetch OffSale:", error);
        return res.status(500).json({ error: "Failed to fetch OffSale" });
    }
};

/** ຍົກເລີກການປິດຍອດ (ປົດລັອກບິນຄືນ) */
export const cancelOffSale = async (req: Request<{ id: string }>, res: Response) => {
    const t = await OffSales.sequelize?.transaction();
    try {
        const offsale = await OffSales.findByPk(req.params.id, { transaction: t });
        if (!offsale) {
            await t?.rollback();
            return res.status(404).json({ error: "OffSale not found" });
        }

        await Billsales.update(
            { statusoff: 1, offsaleid: 0, updatedAt: new Date() },
            { where: { offsaleid: offsale._uuid }, transaction: t }
        );
        await OffsaleList.update(
            { status: 2, updatedAt: new Date() },
            { where: { offsaleid: offsale._uuid }, transaction: t }
        );
        await offsale.update({ status: 2 }, { transaction: t });

        await t?.commit();
        return res.status(200).json({ message: "ຍົກເລີກການປິດຍອດສຳເລັດ", data: offsale });
    } catch (error) {
        await t?.rollback();
        console.error("Failed to cancel OffSale:", error);
        return res.status(500).json({ error: "Failed to cancel OffSale" });
    }
};
