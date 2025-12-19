import { Request, Response } from "express";
import { Op, fn, col, literal } from "sequelize";
import { maxid, maxCode, } from "../utils";
import Categories from "../models/Categories";
interface QueryParams {
    limit?: string;
    skip?: string;
    orderBy?: string;
    order?: string;
}
// create categories
export const createCategories = async (req: Request, res: Response) => {
    try {
        const new_uuid = await maxid(Categories, "cate_uuid");
        req.body.cate_uuid = new_uuid;
        const newCode = await maxCode(Categories, "cateCode", "CAT");
        req.body.cateCode = newCode;
        const existing = await Categories.findOne({ where: { cateName: req.body.cateName } });
        if (existing) {
            res.status(409).json({ error: "Categories with this name already exists" });
            return;
        }
        const categories = await Categories.create(req.body);
        res.status(200).json({ message: "Categories created successfully", data: categories });
    } catch (error) {
        res.status(500).json({ error: "Failed to create categories" });
    }
};
// update categories
export const updateCategories = async (req: Request, res: Response) => {
    try {
        const cate_uuid = atob(req.params.id);
        req.body.updatedAt = new Date();
        const categories = await Categories.findByPk(cate_uuid);
        if (!categories) return res.status(404).json({ error: "Categories not found" });
        const updated = await Categories.update(req.body, {
            where: { cate_uuid: cate_uuid },
        });
        if (!updated) return res.status(404).json({ error: "Categories not found" });
        res.status(200).json({ message: "Categories updated successfully", data: updated });
    } catch (error) {
        res.status(500).json({ error: "Failed to update categories" });
    }
};
// delete Categories
export const deleteCategories = async (req: Request, res: Response) => {
    try {
        const cate_uuid = atob(req.params.id);
        const categories = await Categories.findByPk(cate_uuid);
        if (!categories) return res.status(404).json({ error: "Categories not found" });
        const deleted = await Categories.destroy({
            where: { cate_uuid: cate_uuid },
        });
        if (!deleted) return res.status(404).json({ error: "Categories not found" });
        res.status(200).json({ message: "Categories deleted successfully", data: deleted });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete categories" });
    }
};

// get Categories
export const getCategories =async (req: Request<{id: string}, {}, {}, QueryParams>, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
    const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
    const orderBy = req.query.orderBy || "cate_uuid";
    const order = (req.query.order || "ASC").toUpperCase() as "ASC" | "DESC";
    const shopid = req.params.id;
    const { rows, count } = await Categories.findAndCountAll({
      where: { shopid: shopid },
      limit,
      offset: skip,
      order: [[orderBy, order]],
    })
    res.status(200).json({
      data: rows,
      total: count,
      limit,
      skip
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};

// ger option
export const getCategoriesOption = async (req: Request<{id: string}>, res: Response) => {
    try {
        const shopid = req.params.id;
        const categories = await Categories.findAll({
            where: { shopid: shopid, status: 1 },
        });
        res.status(200).json({data: categories});
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch categories" });
    }
};