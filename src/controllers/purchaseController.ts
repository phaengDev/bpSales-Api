import { Request, Response } from "express";
import { Op, fn, col, literal } from "sequelize";
import { maxid, codeNo, billno, url } from "../utils";
import moment from "moment";
import Purchase from "../models/Purchase";
import PurchaseList from "../models/PurchaseList";
import Suppliers from "../models/Suppliers";
import Products from "../models/Products";
import Units from "../models/Units";
import Sizes from "../models/Sizes";
import Brands from "../models/Brands";
import Shops from "../models/Shops";

const days = moment().format("YYMMDD").toString();
interface QueryParams {
    limit?: string;
    skip?: string;
    orderBy?: string;
    order?: string;
}
export const createPurchase = async (req: Request, res: Response) => {
    const t = await Purchase.sequelize?.transaction();
    try {
        const { itemproduct } = req.body;
        // Generate IDs
        const new_uuid = await maxid(Purchase, "_uuid");
        req.body._uuid = new_uuid;

        const newNo = await billno(Purchase, "billno", `${days}0`, "createdAt");
        req.body.billno = newNo;

        // Create purchase
        const purchase = await Purchase.create(req.body, { transaction: t });
        if (!purchase) {
            await t?.rollback();
            return res.status(400).json({ error: "Failed to create purchase" });
        }

        // Insert product list
        for (const item of itemproduct) {
            const uuid = await maxid(PurchaseList, "_uuid");
            const result = await PurchaseList.create(
                {
                    _uuid: uuid,
                    purchaseid: new_uuid,
                    productid: item.productid,
                    prices_order: item.prices_order,
                    prices_import: item.prices_order,
                    vat: 0,
                    discount: item.discount,
                    qty_order: item.qty_order,
                    qty_import: 0,
                    balance_total: item.balance_total,
                    import: 1,
                    status: 1,
                },
                { transaction: t }
            );

            if (!result) {
                await t?.rollback();
                return res.status(500).json({ error: "Failed to create PurchaseList" });
            }
        }

        // Commit
        await t?.commit();
        return res.status(200).json({
            message: "Purchase created successfully",
            data: purchase,
        });

    } catch (error) {
        await t?.rollback();
        return res.status(500).json({ error: "Failed to create purchase", details: error });
    }
};


export const getPurchase = async (
    req: Request<{}, {}, {}, QueryParams>,
    res: Response
) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
        const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
        const orderBy = req.query.orderBy || "_uuid";
        const order = (req.query.order || "ASC").toUpperCase() as "ASC" | "DESC";
        const { startDate, endDate, supplierid, imports, shopid } = req.body as any;
        const whereConditions: any = {
            shopid: shopid,
            status: 1,
            createdAt: {
                [Op.between]: [startDate, endDate]
            }
        };
        if (supplierid) {
            whereConditions.supplierid = supplierid;
        }
        if (imports) {
            whereConditions.imports = imports;
        }
        const { rows, count } = await Purchase.findAndCountAll({
            where: whereConditions,
            limit,
            offset: skip,
            order: [[orderBy, order]],
            include: [
                {
                    model: Suppliers,
                    as: "supplier",
                },
                {
                    model: Shops,
                    as: "shop",
                }
            ]
        });

        res.status(200).json({
            data: rows,
            total: count,
            limit,
            skip
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch purchase" });
    }
};

export const getPurchaseById = async (req: Request<{ id: string }, {}, {}, QueryParams>, res: Response) => {
    try {
        const uuid = req.params.id;
        const purchase = await Purchase.findByPk(uuid, {
            include: [
                {
                    model: Suppliers,
                    as: "supplier",
                },
                {
                    model: PurchaseList,
                    as: "list",
                }
            ]
        });
        if (!purchase) {
            return res.status(404).json({ error: "Purchase not found" });
        }
        res.status(200).json({ data: purchase });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch purchase" });
    }
};


export const getPurchaseBymain = async (req: Request<{ id: string }, {}, {}, QueryParams>, res: Response) => {
    try {
        const uuid = req.params.id;
        const purchase = await PurchaseList.findAll(
            {
                where: { purchaseid: uuid },
                include: [
                    {
                        model: Products,
                        as: "product",
                        include: [
                            {
                                model: Brands,
                                as: "brand"
                            },
                            {
                                model: Units,
                                as: "unit"
                            },
                            {
                                model: Sizes,
                                as: "size"
                            }
                        ]
                    },
                ]
            },
        );
        if (!purchase) {
            return res.status(404).json({ error: "Purchase not found" });
        }
        res.status(200).json({ data: purchase });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch purchase" });
    }
};

export const searchBillPurchase = async (req: Request, res: Response) => {
    try {
       const { buillNumber,shopid } = req.body as any;
        const purchase = await Purchase.findOne({
            where: { shopid: shopid,billno: buillNumber },
             include: [
                {
                    model: Suppliers,
                    as: "supplier",
                    attributes: {
                                    include: [
                                        [fn("CONCAT", literal(`'${url()}/logo/'`), col("logos")), "url"],
                                    ],
                                },
                },
                {
                    model: PurchaseList,
                    as: "list",
                    include: [
                        {
                            model: Products,
                            as: "product",
                            include: [
                                {
                                    model: Brands,
                                    as: "brand"
                                },
                                {
                                    model: Units,
                                    as: "unit"
                                },
                                {
                                    model: Sizes,
                                    as: "size"
                                }
                            ]
                        },
                    ]
                }
            ]
        });
        if (!purchase) {
            return res.status(404).json({ error: "Purchase not found" });
        }
        res.status(200).json({ data: purchase });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch purchase" });
    }
};