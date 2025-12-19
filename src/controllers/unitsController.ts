import { Request, Response } from "express";
import { maxid, maxCode, } from "../utils";
import Units from "../models/Units";
interface QueryParams {
    limit?: string;
    skip?: string;
    orderBy?: string;
    order?: string;
}
// create Unit
export const createUnit = async (req: Request, res: Response) => {
       try {
           const new_uuid = await maxid(Units, "unit_uuid");
           req.body.unit_uuid = new_uuid;
           const units = await Units.create(req.body);
           res.status(200).json({ message: "Units created successfully", data: units });
       } catch (error) {
           res.status(500).json({ error: "Failed to create Units" });
       }
   };
//    update Units
export const updateUnit = async (req: Request, res: Response) => {
    try {
        const unit_uuid = atob(req.params.id);
        req.body.updatedAt = new Date();
        const units = await Units.findByPk(unit_uuid);
        if (!units) return res.status(404).json({ error: "Units not found" });
        const updated = await Units.update(req.body, {
            where: { unit_uuid: unit_uuid },
        });
        if (!updated) return res.status(404).json({ error: "Units not found" });
        res.status(200).json({ message: "Units updated successfully", data: updated });
    } catch (error) {
        res.status(500).json({ error: "Failed to update Units" });
    }
};
// delete Units
export const deleteUnit = async (req: Request, res: Response) => {
    try {
        const unit_uuid = atob(req.params.id);
        const units = await Units.findByPk(unit_uuid);
        if (!units) return res.status(404).json({ error: "Units not found" });
        const deleted = await Units.destroy({
            where: { unit_uuid: unit_uuid },
        });
        if (!deleted) return res.status(404).json({ error: "Units not found" });
        res.status(200).json({ message: "Units deleted successfully", data: deleted });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete Units" });
    }
};
// getUnits
export const getUnits = async (req: Request<{id: string}, {}, {}, QueryParams>, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
    const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
    const orderBy = req.query.orderBy || "unit_uuid";
    const order = (req.query.order || "ASC").toUpperCase() as "ASC" | "DESC";
    const shopid = req.params.id;
    const { rows, count } = await Units.findAndCountAll({
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
// get Units
export const getUnitOption = async (req: Request<{id: string}>, res: Response) => {
    try {
        const shopid = req.params.id;
        const units = await Units.findAll({
            where: { shopid: shopid, status: 1 },
        });
        if (!units) return res.status(404).json({ error: "Units not found" });
        res.status(200).json({ message: "Units fetched successfully", data: units });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch Units" });
    }
};