import { Request, Response } from "express";
import { Op, fn, col, literal } from "sequelize";
import { maxid, url } from "../utils";
import Promotion from "../models/Promotion";
import Products from "../models/Products";
import Brands from "../models/Brands";
import Categories from "../models/Categories";
import Sizes from "../models/Sizes";
import Units from "../models/Units";
interface QueryParams {
    limit?: string;
    skip?: string;
    orderBy?: string;
    order?: string;
}
export const createPrometion = async (req: Request, res: Response) => {
    try {
        const new_uuid = await maxid(Promotion, "_uuid");
        req.body._uuid = new_uuid;
        const promotion = await Promotion.create(req.body);
        if (!promotion) return res.status(404).json({ error: "Promotion not found" });
        return res.status(200).json({ message: "Promotion created successfully", data: promotion });
    } catch (error) {
        return res.status(500).json({ error: "Failed to create Promotion" });
    }
}

export const createPrometionMt = async (req: Request, res: Response) => {
    try {
        const { dataPs, productid } = req.body;
        if (!Array.isArray(dataPs) || dataPs.length === 0) {
            return res.status(400).json({ error: "Request body must be a non-empty array" });
        }
        for (const item of dataPs) {
            const new_uuid = await maxid(Promotion, "_uuid");
            const promotion = await Promotion.create({
                _uuid: new_uuid,
                productid: productid,
                qty_buy: item.qty_buy,
                qty_free: item.qty_free,
                status: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            if (!promotion) {
                return res.status(500).json({ error: "Failed to create Promotion" });
            }
        }
        return res.status(200).json({
            message: "Promotion created successfully",
            data: dataPs
        });
    } catch (error) {
        console.error("❌ createPromotionMt error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}
// ================ get promotion ================
export const updatePrometion = async (req: Request, res: Response) => {
    try {
        const _uuid = atob(req.params.id);
        req.body.updatedAt = new Date();
        const promotion = await Promotion.findByPk(_uuid);
        if (!promotion) return res.status(404).json({ error: "Promotion not found" });
        const updated = await Promotion.update(req.body, {
            where: { _uuid: _uuid },
        });
        if (!updated) return res.status(404).json({ error: "Promotion not found" });
        res.status(200).json({ message: "Promotion updated successfully", data: updated });
    } catch (error) {
        res.status(500).json({ error: "Failed to update Promotion" });
    }
}

// ================ delete promotion ================
export const deletePrometion = async (req: Request, res: Response) => {
    try {
        const _uuid = atob(req.params.id);
        const promotion = await Promotion.findByPk(_uuid);
        if (!promotion) return res.status(404).json({ error: "Promotion not found" });
        await Promotion.destroy({ where: { _uuid: _uuid } });
        res.status(200).json({ message: "Promotion deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete Promotion" });
    }
}
// ================ delete promotion by product ================
export const deletePrometionbyProduct = async (req: Request, res: Response) => {
    try {
        const _uuid = atob(req.params.id);
        await Promotion.destroy({ where: { productid: _uuid } });
        res.status(200).json({ message: "Promotion deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete Promotion" });
    }
}
// ===========get promotion ================
export const getPrometion = async (req: Request<{}, {}, {}, QueryParams>, res: Response) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
        const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
        const orderBy = req.query.orderBy || "_uuid";
        const order = (req.query.order || "ASC").toUpperCase() as "ASC" | "DESC";
        const { shopid, categorieid, productid } = req.body as any;
        const whereConditions: any = {}
        if (shopid) {
            whereConditions["$product.shopid$"] = shopid;
        }
        if (categorieid) {
            whereConditions["$brand.categorieid$"] = categorieid;
        }
        if (productid) {
            whereConditions.productid = productid;
        }
        const { rows, count } = await Promotion.findAndCountAll({
            where: whereConditions,
            limit,
            offset: skip,
            order: [[orderBy, order]],
            include: [
                {
                    model: Products,
                    as: 'product',
                    attributes: {
                        include: [
                            [fn("CONCAT", literal(`'${url()}/product/'`), col("images")), "url"],
                        ],
                    },
                    include: [
                        {
                            model: Brands,
                            as: 'brand',
                        },
                        {
                            model: Sizes,
                            as: 'size',
                        },
                        {
                            model: Units,
                            as: 'unit',
                        }
                    ],
                },
            ]
        })
        res.status(200).json({
            data: rows,
            total: count,
            limit,
            skip
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch Promotion" });
    }
}



export const getPrometionhasMany = async (
    req: Request<{}, {}, {}, QueryParams>,
    res: Response) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
        const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
        const orderBy = req.query.orderBy || "product_uuid";
        const order = (req.query.order || "ASC").toUpperCase() as "ASC" | "DESC";

        const { shopid } = req.body as any;

        // ✅ เงื่อนไขกรองสินค้า
        const whereConditions: any = {};
        if (shopid) whereConditions.shopid = shopid;

        // ✅ ดึงเฉพาะสินค้าที่มีโปรโมชั่น
        const { rows, count } = await Products.findAndCountAll({
            where: whereConditions,
            limit,
            offset: skip,
            order: [[orderBy, order]],
            attributes: {
                include: [
                    [fn("CONCAT", literal(`'${url()}/product/'`), col("images")), "url"],
                ],
            },
            include: [
                {
                    model: Promotion,
                    as: "proms",
                    required: true, // ✅ INNER JOIN — เอาเฉพาะสินค้าที่มีโปรโมชั่นจริง
                    attributes: ["_uuid", "qty_buy", "qty_free", "status", "createdAt"],
                },
                {
                    model: Brands,
                    as: "brand",
                    include: [
                        {
                            model: Categories,
                            as: "category",
                        },
                    ],
                },
                {
                    model: Units,
                    as: "unit",
                },
                {
                    model: Sizes,
                    as: "size",
                },
            ],
            distinct: true, // ป้องกัน count ซ้ำเมื่อมีหลายโปรโมชั่น
        });

        res.status(200).json({
            data: rows,
            total: count,
            limit,
            skip,
        });
    } catch (error) {
        console.error("❌ Error fetching Promotion:", error);
        res.status(500).json({ error: "Failed to fetch Promotion" });
    }
};





export const getPrometionbypsid = async (req: Request, res: Response) => {
    try {
        const productid = atob(req.params.id);
        const promotion = await Promotion.findAll({
            where: { productid: productid }
        });
        if (!promotion) return res.status(404).json({ error: "Promotion not found" });
        res.status(200).json({ data: promotion });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch Promotion" });
    }
}