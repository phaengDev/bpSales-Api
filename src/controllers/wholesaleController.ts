import { Request, Response } from "express";
import { Op, fn, col, literal } from "sequelize";
import { maxid, url } from "../utils";
import Wholesale from "../models/Wholesale";
import Products from "../models/Products";
import Brands from "../models/Brands";
import Categories from "../models/Categories";
import Units from "../models/Units";
import Sizes from "../models/Sizes";
interface QueryParams {
    limit?: string;
    skip?: string;
    orderBy?: string;
    order?: string;
}
export const createPriceOne = async (req: Request, res: Response) => {
    try {
        const new_uuid = await maxid(Wholesale, "price_uuid");
        req.body.price_uuid = new_uuid;
        const price = await Wholesale.create(req.body);
        if (!price) {
            return res.status(500).json({ error: "Failed to create Wholesale" });
        }
        return res.status(200).json({
            message: "Wholesale created successfully",
            data: price
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}
export const createPriceMt = async (req: Request, res: Response) => {
    const t = await Wholesale.sequelize?.transaction();
    try {
        const {dataPrices,productid} = req.body;
        if (!Array.isArray(dataPrices) || dataPrices.length === 0) {
            await t?.rollback();
            return res.status(400).json({ error: "Request body must be a non-empty array" });
        }
        const results = [];
        let nextPriceUuid = await maxid(Wholesale, "price_uuid");
        for (const item of dataPrices) {
            if (item.price_uuid) {
                const existingPrice = await Wholesale.findByPk(item.price_uuid, { transaction: t });
                if (existingPrice) {
                    const updated = await existingPrice.update(
                        {
                            typeName: item.typeName,
                            prices: item.prices,
                            updatedAt: new Date(),
                        },
                        { transaction: t }
                    );
                    results.push(updated);
                    continue;
                }
            }

            const price = await Wholesale.create(
                {
                    price_uuid: nextPriceUuid,
                    productid: productid,
                    typeName: item.typeName,
                    prices: item.prices,
                    status: 1,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                { transaction: t }
            );

            results.push(price);
            nextPriceUuid += 1;
        }
        await t?.commit();
        return res.status(200).json({
            message: "Wholesale saved successfully",
            data: results
        });
    } catch (error) {
        await t?.rollback();
        console.error("❌ createPriceMt error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
// =====updatePrice 
export const updatePrice = async (req: Request, res: Response) => {
    try {
        const price_uuid = atob(req.params.id);
        req.body.updatedAt = new Date();
        const price = await Wholesale.findByPk(price_uuid);
        if (!price) return res.status(404).json({ error: "Wholesale not found" });
        const updated = await Wholesale.update(req.body, {
            where: { price_uuid: price_uuid },
        });
        if (!updated) return res.status(404).json({ error: "Wholesale not found" });
        return res.status(200).json({ message: "Wholesale updated successfully", data: updated });
    } catch (error) {
        return res.status(500).json({ error: "Failed to update Wholesale" });
    }
}

//  deletePrice
export const deletePrice = async (req: Request, res: Response) => {
    try {
        const price_uuid = atob(req.params.id);
        const deleted = await Wholesale.destroy({ where: { price_uuid: price_uuid } });
        if (!deleted) return res.status(404).json({ error: "Wholesale not found" });
        return res.status(200).json({ message: "Wholesale deleted successfully" });
    } catch (error) {
        return res.status(500).json({ error: "Failed to delete Wholesale" });
    }
}
export const deletePricebyProduct = async (req: Request, res: Response) => {
    try {
        const productid = atob(req.params.id);
        const deleted = await Wholesale.destroy({ where: { productid: productid } });
        if (!deleted) return res.status(404).json({ error: "Wholesale not found" });
        return res.status(200).json({ message: "Wholesale deleted successfully", data: deleted });
    } catch (error) {
        return res.status(500).json({ error: "Failed to delete Wholesale" });
    }
}
export const getPricebyProduct = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const productId = req.params.id;
        const prices = await Wholesale.findAll({ where: { productid: productId } });
        if (!prices) return res.status(404).json({ error: "Wholesale not found" });
        return res.status(200).json({ message: "Wholesale found successfully", data: prices });
    } catch (error) {
        return res.status(500).json({ error: "Failed to get Wholesale" });
    }
}

export const getPriceAll = async (req: Request<{}, {}, {}, QueryParams>, res: Response) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
        const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
        const orderBy = req.query.orderBy || "product_uuid";
        const order = (req.query.order || "ASC").toUpperCase() as "ASC" | "DESC";
        const { shopid, cartgoryid, brandid, unitid, sizeid } = req.body as any;
        const whereconditions: any = {
            shopid: shopid,
        };
        if (cartgoryid) {
            whereconditions['$brand.categorieid$'] = cartgoryid;
        }
        if (brandid) {
            whereconditions.brandid = brandid;
        }
        if (unitid) {
            whereconditions.uniteid = unitid;
        }
        if (sizeid) {
            whereconditions.sizeid = sizeid;
        }
        const { rows, count } = await Products.findAndCountAll({
            where: whereconditions,
            limit,
            offset: skip,
            order: [[orderBy, order]],
            attributes: [
                "product_uuid",
                "productName",
                "sku",
                "images",
                "sellPrices",
                "buyPrices",
                "quantity",
                "stock",
                [fn("CONCAT", literal(`'${url()}/product/'`), col("images")), "url"],
            ],
            include: [
                {
                    model: Brands,
                    as: "brand",
                    attributes: ["brandCode","brandName"],
                    include: [
                        {
                            model: Categories,
                            as: "category",
                            attributes: ["cateName"],
                        },
                    ],
                },
                {
                    model: Units,
                    as: "unit",
                    attributes: ["unitName"],
                },
                {
                    model: Sizes,
                    as: "size",
                    attributes: ["sizeName"],
                },
                {
                    model: Wholesale,
                    as: "price",
                    required: true,
                }
            ]
        });

        return res.status(200).json({
            data: rows,
            total: count,
            limit,
            skip
        });
    } catch (error) {
        return res.status(500).json({ error: "Failed to get Wholesale" });
    }
}
