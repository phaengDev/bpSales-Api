import { Request, Response } from "express";
import { Op, fn, col, literal } from "sequelize";
import { maxid, maxCode, url } from "../utils";
import Customer from "../models/Customer";
import { deleteFile } from "../utils/uploadFile";
import District from "../models/Districts";
import Provinces from "../models/Provinces";
interface QueryParams {
    limit?: string;
    skip?: string;
    orderBy?: string;
    order?: string;
}
// create  Customer
export const createCustomer = async (req: Request, res: Response) => {
    try {
        const new_uuid = await maxid(Customer, "_uuid");
        req.body._uuid = new_uuid;
        const newCode = await maxCode(Customer, "codes", "BPS");
        req.body.codes = newCode;
        const images = req.file?.filename;
        req.body.profiles = images || "";
        const existing = await Customer.findOne({ where: { phones: req.body.phones } });
        if (existing) {
            res.status(409).json({ error: "Customer with this name already exists" });
            return;
        }
        const customer = await Customer.create(req.body);
        res.status(200).json({ message: "Customer created successfully", data: customer });
    } catch (error) {
        res.status(500).json({ error: "Failed to create customer" });
    }
};
// update  Customer
export const updateCustomer = async (req: Request, res: Response) => {
    try {
        const _uuid = atob(req.params.id);
        req.body.updatedAt = new Date();
        const customer = await Customer.findByPk(_uuid);
        if (!customer) return res.status(404).json({ error: "Customer not found" });
        const images = req.file?.filename;
        if (images) {
            req.body.profiles = images;
            if (customer.dataValues.profiles) {
                deleteFile("profile", customer.dataValues.profiles);
            }
        } else {
            delete req.body.profiles;
        }
        const updated = await Customer.update(req.body, {
            where: { _uuid: _uuid },
        });
        if (!updated) return res.status(404).json({ error: "Customer not found" });
        res.status(200).json({ message: "Customer updated successfully", data: updated });
    } catch (error) {
        res.status(500).json({ error: "Failed to update customer" });
    }
};

// delete Customer 
export const deleteCustomer = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const _uuid = atob(req.params.id);
        const customer = await Customer.findByPk(_uuid);
        if (!customer) return res.status(404).json({ error: "Customer not found" });
        if (customer.dataValues.profiles) {
            deleteFile("profile", customer.dataValues.profiles);
        }
        const deleted = await Customer.destroy({
            where: { _uuid: _uuid },
        });
        if (!deleted) return res.status(404).json({ error: "Customer not found" });
        res.status(200).json({ message: "Customer deleted successfully", data: deleted });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete customer" });
    }
};

// get  Customer
export const getCustomer = async (req: Request<{}, {}, {}, QueryParams>, res: Response) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 25;
        const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
        const orderBy = req.query.orderBy || "_uuid";
        const order = (req.query.order || "ASC").toUpperCase() as "ASC" | "DESC";
        const { shopid, types, provinceid, districtid } = req.body as any;
        const whereConditions: any = {
            shopid: shopid,
        };
        if (types) {
            whereConditions.types = types;
        }
        if (districtid) {
            whereConditions.districtid = districtid;
        }
        if (provinceid) {
            whereConditions["$district.provinceid$"] = provinceid;
        }
        const { rows, count } = await Customer.findAndCountAll({
            limit,
            offset: skip,
            order: [[orderBy, order]],
            attributes: {
                include: [
                    [fn("CONCAT", literal(`'${url()}/profile/'`), col("profiles")), "url"],
                ],
            },
            include: [
                {
                    model: District,
                    as: "district",
                    attributes: ["distName", "_uuid","provinceid"],
                    include: [
                        {
                            model: Provinces,
                            as: "province",
                            attributes: ["provinceName", "_uuid"],
                        }
                    ]
                },
            ]
        });

        res.status(200).json({
            data: rows,
            total: count,
            limit,
            skip
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch customer" });
    }
};

// get option
export const getCustomerOption = async (req: Request<{}, {}, {}, QueryParams>, res: Response) => {
    try {
        const { shopid, types } = req.body as any;
        const whereConditions: any = {
            shopid: shopid, status: 1
        }
        if (types) {
            whereConditions.types = types;
        }
        const customer = await Customer.findAll({
            where: whereConditions,
        });
        res.status(200).json({ data: customer });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch customer" });
    }
};
// === update status
export const updateCustomerStatus = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const _uuid = atob(req.params.id);
        const customer = await Customer.findByPk(_uuid);
        if (!customer) return res.status(404).json({ error: "Customer not found" });
        const updated = await Customer.update(req.body, {
            where: { _uuid: _uuid },
        });
        if (!updated) return res.status(404).json({ error: "Customer not found" });
        res.status(200).json({ message: "Customer updated successfully", data: updated });
    } catch (error) {
        res.status(500).json({ error: "Failed to update customer" });
    }
};