import { Request, Response } from "express";
import { maxid, maxCode, } from "../utils";
import Sizes from "../models/Sizes";
interface QueryParams {
    limit?: string;
    skip?: string;
    orderBy?: string;
    order?: string;
}
// created size
export const createSize = async (req: Request, res: Response) => {
       try {
           const new_uuid = await maxid(Sizes, "size_uuid");
           req.body.size_uuid = new_uuid;
           const sizes = await Sizes.create(req.body);
           res.status(200).json({ message: "Sizes created successfully", data: sizes });
       } catch (error) {
           res.status(500).json({ error: "Failed to create Sizes" });
       }
   };
//    update size
export const updateSize = async (req: Request, res: Response) => {
    try {
        const size_uuid = atob(req.params.id);
        req.body.updatedAt = new Date();
        const sizes = await Sizes.findByPk(size_uuid);
        if (!sizes) return res.status(404).json({ error: "Sizes not found" });
        const updated = await Sizes.update(req.body, {
            where: { size_uuid: size_uuid },
        });
        if (!updated) return res.status(404).json({ error: "Sizes not found" });
        res.status(200).json({ message: "Sizes updated successfully", data: updated });
    } catch (error) {
        res.status(500).json({ error: "Failed to update Sizes" });
    }
};
// delete size
export const deleteSize = async (req: Request, res: Response) => {
    try {
        const size_uuid = atob(req.params.id);
        const sizes = await Sizes.findByPk(size_uuid);
        if (!sizes) return res.status(404).json({ error: "Sizes not found" });
        const deleted = await Sizes.destroy({
            where: { size_uuid: size_uuid },
        });
        if (!deleted) return res.status(404).json({ error: "Sizes not found" });
        res.status(200).json({ message: "Sizes deleted successfully", data: deleted });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete Sizes" });
    }
};

// get size 
export const getSize = async (req: Request<{id: string}, {}, {}, QueryParams>, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
    const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
    const orderBy = req.query.orderBy || "size_uuid";
    const order = (req.query.order || "ASC").toUpperCase() as "ASC" | "DESC";
    const shopid = req.params.id;
    const { rows, count } = await Sizes.findAndCountAll({
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
// get Size
export const getSizeOption = async (req: Request<{id: string}>, res: Response) => {
    try {
        const shopid = req.params.id;
        const size = await Sizes.findAll({
            where: { shopid: shopid, status: 1 },
        });
        if (!size) return res.status(404).json({ error: "Size not found" });
        res.status(200).json({ message: "Size fetched successfully", data: size });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch Size" });
    }
};