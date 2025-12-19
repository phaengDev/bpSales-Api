"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCustomerStatus = exports.getCustomerOption = exports.getCustomer = exports.deleteCustomer = exports.updateCustomer = exports.createCustomer = void 0;
const sequelize_1 = require("sequelize");
const utils_1 = require("../utils");
const Customer_1 = __importDefault(require("../models/Customer"));
const uploadFile_1 = require("../utils/uploadFile");
const Districts_1 = __importDefault(require("../models/Districts"));
const Provinces_1 = __importDefault(require("../models/Provinces"));
// create  Customer
const createCustomer = async (req, res) => {
    try {
        const new_uuid = await (0, utils_1.maxid)(Customer_1.default, "_uuid");
        req.body._uuid = new_uuid;
        const newCode = await (0, utils_1.maxCode)(Customer_1.default, "codes", "BPS");
        req.body.codes = newCode;
        const images = req.file?.filename;
        req.body.profiles = images || "";
        const existing = await Customer_1.default.findOne({ where: { phones: req.body.phones } });
        if (existing) {
            res.status(409).json({ error: "Customer with this name already exists" });
            return;
        }
        const customer = await Customer_1.default.create(req.body);
        res.status(200).json({ message: "Customer created successfully", data: customer });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create customer" });
    }
};
exports.createCustomer = createCustomer;
// update  Customer
const updateCustomer = async (req, res) => {
    try {
        const _uuid = atob(req.params.id);
        req.body.updatedAt = new Date();
        const customer = await Customer_1.default.findByPk(_uuid);
        if (!customer)
            return res.status(404).json({ error: "Customer not found" });
        const images = req.file?.filename;
        if (images) {
            req.body.profiles = images;
            if (customer.dataValues.profiles) {
                (0, uploadFile_1.deleteFile)("profile", customer.dataValues.profiles);
            }
        }
        else {
            delete req.body.profiles;
        }
        const updated = await Customer_1.default.update(req.body, {
            where: { _uuid: _uuid },
        });
        if (!updated)
            return res.status(404).json({ error: "Customer not found" });
        res.status(200).json({ message: "Customer updated successfully", data: updated });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update customer" });
    }
};
exports.updateCustomer = updateCustomer;
// delete Customer 
const deleteCustomer = async (req, res) => {
    try {
        const _uuid = atob(req.params.id);
        const customer = await Customer_1.default.findByPk(_uuid);
        if (!customer)
            return res.status(404).json({ error: "Customer not found" });
        if (customer.dataValues.profiles) {
            (0, uploadFile_1.deleteFile)("profile", customer.dataValues.profiles);
        }
        const deleted = await Customer_1.default.destroy({
            where: { _uuid: _uuid },
        });
        if (!deleted)
            return res.status(404).json({ error: "Customer not found" });
        res.status(200).json({ message: "Customer deleted successfully", data: deleted });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete customer" });
    }
};
exports.deleteCustomer = deleteCustomer;
// get  Customer
const getCustomer = async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 25;
        const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
        const orderBy = req.query.orderBy || "_uuid";
        const order = (req.query.order || "ASC").toUpperCase();
        const { shopid, types, provinceid, districtid } = req.body;
        const whereConditions = {
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
        const { rows, count } = await Customer_1.default.findAndCountAll({
            limit,
            offset: skip,
            order: [[orderBy, order]],
            attributes: {
                include: [
                    [(0, sequelize_1.fn)("CONCAT", (0, sequelize_1.literal)(`'${(0, utils_1.url)()}/profile/'`), (0, sequelize_1.col)("profiles")), "url"],
                ],
            },
            include: [
                {
                    model: Districts_1.default,
                    as: "district",
                    attributes: ["distName", "_uuid", "provinceid"],
                    include: [
                        {
                            model: Provinces_1.default,
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
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch customer" });
    }
};
exports.getCustomer = getCustomer;
// get option
const getCustomerOption = async (req, res) => {
    try {
        const { shopid, types } = req.body;
        const whereConditions = {
            shopid: shopid, status: 1
        };
        if (types) {
            whereConditions.types = types;
        }
        const customer = await Customer_1.default.findAll({
            where: whereConditions,
        });
        res.status(200).json({ data: customer });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch customer" });
    }
};
exports.getCustomerOption = getCustomerOption;
// === update status
const updateCustomerStatus = async (req, res) => {
    try {
        const _uuid = atob(req.params.id);
        const customer = await Customer_1.default.findByPk(_uuid);
        if (!customer)
            return res.status(404).json({ error: "Customer not found" });
        const updated = await Customer_1.default.update(req.body, {
            where: { _uuid: _uuid },
        });
        if (!updated)
            return res.status(404).json({ error: "Customer not found" });
        res.status(200).json({ message: "Customer updated successfully", data: updated });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update customer" });
    }
};
exports.updateCustomerStatus = updateCustomerStatus;
