import { Request, Response } from "express";
import { Op, fn, col, literal } from "sequelize";
import { maxid, maxCode, } from "../utils";
import Brands from "../models/Brands";
import Categories from "../models/Categories";
interface QueryParams {
    limit?: string;
    skip?: string;
    orderBy?: string;
    order?: string;
}

// create brand
export const createBrand = async (req: Request, res: Response) => {
    try {
        const new_uuid = await maxid(Brands, "brand_uuid");
        req.body.brand_uuid = new_uuid;
        const newCode = await maxCode(Brands, "brandCode", "BN");
        req.body.brandCode = newCode;
        const brand = await Brands.create(req.body);
        res.status(200).json({ message: "Brand created successfully", data: brand });
    } catch (error) {
        res.status(500).json({ error: "Failed to create brand" });
    }
};

// update brand
export const updateBrand = async (req: Request, res: Response) => {
    try {
        const brand_uuid = atob(req.params.id);
        req.body.updatedAt = new Date();
        const brand = await Brands.findByPk(brand_uuid);
        if (!brand) return res.status(404).json({ error: "Brand not found" });
        const updated = await Brands.update(req.body, {
            where: { brand_uuid: brand_uuid },
        });
        if (!updated) return res.status(404).json({ error: "Brand not found" });
        res.status(200).json({ message: "Brand updated successfully", data: updated });
    } catch (error) {
        res.status(500).json({ error: "Failed to update brand" });
    }
};

// delete brand
export const deleteBrand = async (req: Request, res: Response) => {
    try {
        const brand_uuid = atob(req.params.id);
        const brand = await Brands.findByPk(brand_uuid);
        if (!brand) return res.status(404).json({ error: "Brand not found" });
        const deleted = await Brands.destroy({
            where: { brand_uuid: brand_uuid },
        });
        if (!deleted) return res.status(404).json({ error: "Brand not found" });
        res.status(200).json({ message: "Brand deleted successfully", data: deleted });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete brand" });
    }
};

// get brand
export const getBrand = async (req: Request<{}, {}, {}, QueryParams>, res: Response) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
        const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
        const orderBy = req.query.orderBy || "brand_uuid";
        const order = (req.query.order || "ASC").toUpperCase() as "ASC" | "DESC";
 
        const { categorieid,shopid } = req.body as any;
        const whereConditions: any = {}
        if (shopid) {
            whereConditions['$category.shopid$'] = shopid;
        }
        if (categorieid) {
            whereConditions.categorieid = categorieid;
        }
        const { rows, count } = await Brands.findAndCountAll({
            where: whereConditions,
            limit,
            offset: skip,
            order: [[orderBy, order]],
            include: [
                {
                    model: Categories,
                    as: "category",
                },
            ],
        })
        res.status(200).json({
            data: rows,
            total: count,
            limit,
            skip
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch brand" });
    }
};
// get option
export const getBrandbycategory = async (req: Request<{id: string}>, res: Response) => {
    try {
        const categorieid = req.params.id;
        const categories = await Brands.findAll({
            where: { categorieid: categorieid, status: 1 },
        });
        if (!categories) return res.status(404).json({ error: "Categories not found" });
        res.status(200).json({data: categories});
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch categories" });
    }
};