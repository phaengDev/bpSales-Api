import { Request, Response } from "express";
import { Op, fn, col, literal } from "sequelize";
import { maxid, url } from "../utils";
import Suppliers from "../models/Suppliers";
import { deleteFile } from "../utils/uploadFile";
import Country from "../models/Country";
interface QueryParams {
    limit?: string;
    skip?: string;
    orderBy?: string;
    order?: string;
}
export const createSupplier = async (req: Request, res: Response) => {
    try {
        const new_uuid = await maxid(Suppliers, "_uuid");
        req.body._uuid = new_uuid;
        const images = req.file?.filename;
        req.body.logos = images || "";
        const existingSupplier = await Suppliers.findOne({ where: { phone: req.body.phone } });
        if (existingSupplier) {
            res.status(409).json({ error: "Supplier with this name already exists" });
            return;
        }
        const supplier = await Suppliers.create(req.body);
        res.status(200).json({ message: "Supplier created successfully", data: supplier });
    } catch (error) {
        res.status(500).json({ error: "Failed to create supplier" });
    }
};

// ==========update Supplier==========
export const updateSupplier = async (req: Request, res: Response) => {
    try {
        const _uuid = atob(req.params.id);
        req.body.updatedAt = new Date();
        const supplier = await Suppliers.findByPk(_uuid);
        if (!supplier) return res.status(404).json({ error: "Supplier not found" });
        const images = req.file?.filename;
        if (images) {
            req.body.logos = images;
            if (supplier.dataValues.logos) {
                deleteFile("logo", supplier.dataValues.logos);
            }
        } else {
            delete req.body.logos;
        }
        const updated = await Suppliers.update(req.body, {
            where: { _uuid: _uuid },
        });
        if (!updated) return res.status(404).json({ error: "Supplier not found" });
        res.status(200).json({ message: "Supplier updated successfully", data: updated });
    } catch (error) {
        res.status(500).json({ error: "Failed to update supplier" });
    }
};

// ====== delete Supplier ======
export const deleteSupplier = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const _uuid = atob(req.params.id);
        const supplier = await Suppliers.findByPk(_uuid);
        if (!supplier) return res.status(404).json({ error: "Supplier not found" });

        if (supplier.dataValues.logos) {
            deleteFile("logo", supplier.dataValues.logos);
        }

        const deleted = await Suppliers.destroy({
            where: { _uuid: _uuid },
        });
        if (!deleted) return res.status(404).json({ error: "Supplier not found" });
        res.status(200).json({ message: "Supplier deleted successfully", data: deleted });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete supplier" });
    }
};

// ======== get Supplier =======
export const getSupplier = async (req: Request<{ id: string }, {}, {}, QueryParams>, res: Response) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 25;
        const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
        const orderBy = req.query.orderBy || "_uuid";
        const order = (req.query.order || "ASC").toUpperCase() as "ASC" | "DESC";
        const shopid = req.params.id;
        const { rows, count } = await Suppliers.findAndCountAll({
            where: { shopid: shopid },
            limit,
            offset: skip,
            order: [[orderBy, order]],
            attributes: {
                include: [
                    [fn("CONCAT", literal(`'${url()}/logo/'`), col("logos")), "url"],
                ],
            },
            include: [
                {
                    model: Country,
                    as: "country",
                    attributes: ["names", "abbr", "icons"],
                },
            ],

        });

        res.status(200).json({
            data: rows,
            total: count,
            limit,
            skip
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch supplier" });
    }
};
// ====== get option 
export const getSupplierOption = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const shopid = req.params.id;
        const supplier = await Suppliers.findAll({
            where: { shopid: shopid, status: 1 },
            include: [
                {
                    model: Country,
                    as: "country",
                    attributes: ["names", "abbr", "icons"],
                },
            ],
        });
        res.status(200).json({data:supplier});
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch supplier" });
    }
};