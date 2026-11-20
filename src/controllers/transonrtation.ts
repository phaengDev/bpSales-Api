import { Request, Response } from "express";
import { Op, fn, col, literal, Sequelize, where } from "sequelize";
import { maxid, maxCode, codeNo } from "../utils";
import Transportation from "../models/Transportation";
import Company from "../models/Company";
import Provinces from "../models/Provinces";
import moment from "moment";
import Billsales from "../models/Billsales";
interface QueryParams {
    limit?: string;
    skip?: string;
    orderBy?: string;
    order?: string;
}

const toPlainObject = (value: any) => {
    if (!value) return value;
    return typeof value.toJSON === "function" ? value.toJSON() : value;
};

const formatTransportationDetails = (transport: any) => {
    const item = toPlainObject(transport);
    if (!item) return item;

    const destinationBranchName = [
        item.province?.name_la,
        item.branch_name,
    ].filter(Boolean).join(" - ");

    return {
        ...item,
        transport_company: item.company || null,
        transport_company_name: item.company?.names || null,
        destination_branch: {
            province: item.province || null,
            branch_name: item.branch_name || null,
        },
        destination_branch_name: destinationBranchName || null,
    };
};

/**
 * ອັບເດດສະຖານະປຣິນ: 1 = ຍັງບໍ່ທັນປຣິນ, 2 = ປຣິນແລ້ວ
 * body: { ids: (string|number)[], print?: 1 | 2 }
 */
export const updatePrintStatus = async (req: Request, res: Response) => {
    try {
        const { ids, print } = req.body as any;
        const list = Array.isArray(ids) ? ids.filter((id: any) => id !== null && id !== undefined && id !== "") : [];
        if (list.length === 0) {
            return res.status(400).json({ error: "ids is required" });
        }

        const printStatus = Number(print) === 1 ? 1 : 2;
        const [updated] = await Transportation.update(
            { print: printStatus, updatedAt: new Date() },
            { where: { _uuid: { [Op.in]: list } } }
        );

        return res.status(200).json({
            message: "Print status updated successfully",
            updated,
            ids: list,
            print: printStatus,
        });
    } catch (error) {
        console.error("Failed to update print status:", error);
        return res.status(500).json({
            error: error instanceof Error ? error.message : "Failed to update print status",
        });
    }
};

/**
 * ອັບເດດສະຖານະແຈ້ງລູກຄ້າ
 * 1 = ຍັງບໍ່ໄດ້ແຈ້ງລູກຄ້າ, 2 = ແຈ້ງ ແລະ ສົ່ງບິນໃຫ້ລູກຄ້າແລ້ວ, 3 = ລູກຄ້າຮັບເຄື່ອງແລ້ວ
 * body: { ids: (string|number)[], notified: 1 | 2 | 3 }
 */
export const updateNotifiedStatus = async (req: Request, res: Response) => {
    try {
        const { ids, notified } = req.body as any;
        const list = Array.isArray(ids) ? ids.filter((id: any) => id !== null && id !== undefined && id !== "") : [];
        if (list.length === 0) {
            return res.status(400).json({ error: "ids is required" });
        }

        const notifiedStatus = Number(notified);
        if (![1, 2, 3].includes(notifiedStatus)) {
            return res.status(400).json({ error: "notified must be 1, 2 or 3" });
        }

        const [updated] = await Transportation.update(
            { notified: notifiedStatus, updatedAt: new Date() },
            { where: { _uuid: { [Op.in]: list } } }
        );

        return res.status(200).json({
            message: "Notified status updated successfully",
            updated,
            ids: list,
            notified: notifiedStatus,
        });
    } catch (error) {
        console.error("Failed to update notified status:", error);
        return res.status(500).json({
            error: error instanceof Error ? error.message : "Failed to update notified status",
        });
    }
};

/**
 * ອັບເດດສະຖານະຮັບເງິນ COD — ສະເພາະບິນທີ່ cod = 2 (ຈ່າຍປາຍທາງ) ເທົ່ານັ້ນ
 * 1 = ຍັງບໍ່ໄດ້ຮັບເງິນ COD, 2 = ໄດ້ຮັບເງິນ COD ແລ້ວ
 * body: { ids: (string|number)[], get_cod?: 1 | 2 }
 */
export const updateGetCodStatus = async (req: Request, res: Response) => {
    try {
        const { ids, get_cod } = req.body as any;
        const list = Array.isArray(ids) ? ids.filter((id: any) => id !== null && id !== undefined && id !== "") : [];
        if (list.length === 0) {
            return res.status(400).json({ error: "ids is required" });
        }

        const getCodStatus = Number(get_cod) === 1 ? 1 : 2;
        const [updated] = await Transportation.update(
            { get_cod: getCodStatus, updatedAt: new Date() },
            { where: { _uuid: { [Op.in]: list }, cod: 2 } }
        );

        return res.status(200).json({
            message: "COD receive status updated successfully",
            updated,
            ids: list,
            get_cod: getCodStatus,
        });
    } catch (error) {
        console.error("Failed to update COD receive status:", error);
        return res.status(500).json({
            error: error instanceof Error ? error.message : "Failed to update COD receive status",
        });
    }
};

export const getTransportation = async (
    req: Request<{}, {}, {}, QueryParams>,
    res: Response
) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
        const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
        const orderBy = req.query.orderBy || "_uuid";
        const order = (req.query.order || "ASC").toUpperCase() as "ASC" | "DESC";
        const { startDate, endDate, shopid, status_pay, cod } = req.body as any;
        // ✅ Fix date range properly
        const start_date = moment(startDate).format("YYYY-MM-DD");
        const end_date = moment(endDate).format("YYYY-MM-DD");

        // ✅ Base conditions
        const whereConditions: any = {
            status: 1,
            shopid: shopid,
            [Op.and]: [
                where(fn('DATE', col('Transportation.createdAt')), {
                    [Op.between]: [start_date, end_date],
                }),
            ],
        };
        if (status_pay) {
            whereConditions.status_pay = status_pay;
        }
        if (cod) {
            whereConditions.cod = cod;
        }

        const { rows, count } = await Transportation.findAndCountAll({
            where: whereConditions,
            limit,
            offset: skip,
            order: [[orderBy, order]],
            include: [
                {
                    model: Billsales,
                    as: "billsale",
                    required: true,
                },
                {
                    model: Company,
                    as: "company",
                },
                {
                    model: Provinces,
                    as: "province",
                },
            ],
        });

        // ສະຫຼຸບຍອດ: ຈຳນວນອໍເດີ + ຍອດເງິນ (ຍອດຂາຍເອົາຈາກບິນ, COD ເອົາຈາກ balance)
        const sums = await Transportation.findOne({
            where: whereConditions,
            raw: true,
            include: [
                {
                    model: Billsales,
                    as: "billsale",
                    attributes: [],
                    required: true,
                },
            ],
            attributes: [
                [Sequelize.fn("COUNT", Sequelize.col("Transportation._uuid")), "total_items"],
                [
                    Sequelize.literal("SUM(CASE WHEN `Transportation`.`status_pay` = 1 THEN 1 ELSE 0 END)"),
                    "item_start"
                ],
                [
                    Sequelize.literal("SUM(CASE WHEN `Transportation`.`status_pay` = 2 THEN 1 ELSE 0 END)"),
                    "item_end"
                ],
                // ຍອດຂາຍ (ກີບ)
                [
                    Sequelize.literal("COALESCE(SUM(`billsale`.`balanceSale`), 0)"),
                    "total_sale"
                ],
                [
                    Sequelize.literal("COALESCE(SUM(CASE WHEN `Transportation`.`status_pay` = 1 THEN `billsale`.`balanceSale` ELSE 0 END), 0)"),
                    "sale_start"
                ],
                [
                    Sequelize.literal("COALESCE(SUM(CASE WHEN `Transportation`.`status_pay` = 2 THEN `billsale`.`balanceSale` ELSE 0 END), 0)"),
                    "sale_end"
                ],
                // ຍອດ COD — ນັບສະເພາະບິນ cod = 2
                [
                    Sequelize.literal("COALESCE(SUM(CASE WHEN `Transportation`.`cod` = 2 THEN `Transportation`.`balance` ELSE 0 END), 0)"),
                    "total_cod"
                ],
                [
                    Sequelize.literal("COALESCE(SUM(CASE WHEN `Transportation`.`cod` = 2 AND COALESCE(`Transportation`.`get_cod`, 1) <> 2 THEN `Transportation`.`balance` ELSE 0 END), 0)"),
                    "cod_unpaid"
                ],
            ],
        });



        const data = rows.map(formatTransportationDetails);

        res.status(200).json({
            data,
            total: count,
            sums: sums || {},
            limit,
            skip
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch categories" });
    }
};
