"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSupplierOption = exports.getSupplier = exports.deleteSupplier = exports.updateSupplier = exports.createSupplier = void 0;
const sequelize_1 = require("sequelize");
const utils_1 = require("../utils");
const Suppliers_1 = __importDefault(require("../models/Suppliers"));
const uploadFile_1 = require("../utils/uploadFile");
const Country_1 = __importDefault(require("../models/Country"));
const createSupplier = async (req, res) => {
    try {
        const new_uuid = await (0, utils_1.maxid)(Suppliers_1.default, "_uuid");
        req.body._uuid = new_uuid;
        const images = req.file?.filename;
        req.body.logos = images || "";
        const existingSupplier = await Suppliers_1.default.findOne({ where: { phone: req.body.phone } });
        if (existingSupplier) {
            res.status(409).json({ error: "Supplier with this name already exists" });
            return;
        }
        const supplier = await Suppliers_1.default.create(req.body);
        res.status(200).json({ message: "Supplier created successfully", data: supplier });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create supplier" });
    }
};
exports.createSupplier = createSupplier;
// ==========update Supplier==========
const updateSupplier = async (req, res) => {
    try {
        const _uuid = atob(req.params.id);
        req.body.updatedAt = new Date();
        const supplier = await Suppliers_1.default.findByPk(_uuid);
        if (!supplier)
            return res.status(404).json({ error: "Supplier not found" });
        const images = req.file?.filename;
        if (images) {
            req.body.logos = images;
            if (supplier.dataValues.logos) {
                (0, uploadFile_1.deleteFile)("logo", supplier.dataValues.logos);
            }
        }
        else {
            delete req.body.logos;
        }
        const updated = await Suppliers_1.default.update(req.body, {
            where: { _uuid: _uuid },
        });
        if (!updated)
            return res.status(404).json({ error: "Supplier not found" });
        res.status(200).json({ message: "Supplier updated successfully", data: updated });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update supplier" });
    }
};
exports.updateSupplier = updateSupplier;
// ====== delete Supplier ======
const deleteSupplier = async (req, res) => {
    try {
        const _uuid = atob(req.params.id);
        const supplier = await Suppliers_1.default.findByPk(_uuid);
        if (!supplier)
            return res.status(404).json({ error: "Supplier not found" });
        if (supplier.dataValues.logos) {
            (0, uploadFile_1.deleteFile)("logo", supplier.dataValues.logos);
        }
        const deleted = await Suppliers_1.default.destroy({
            where: { _uuid: _uuid },
        });
        if (!deleted)
            return res.status(404).json({ error: "Supplier not found" });
        res.status(200).json({ message: "Supplier deleted successfully", data: deleted });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete supplier" });
    }
};
exports.deleteSupplier = deleteSupplier;
// ======== get Supplier =======
const getSupplier = async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 25;
        const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
        const orderBy = req.query.orderBy || "_uuid";
        const order = (req.query.order || "ASC").toUpperCase();
        const shopid = req.params.id;
        const { rows, count } = await Suppliers_1.default.findAndCountAll({
            where: { shopid: shopid },
            limit,
            offset: skip,
            order: [[orderBy, order]],
            attributes: {
                include: [
                    [(0, sequelize_1.fn)("CONCAT", (0, sequelize_1.literal)(`'${(0, utils_1.url)()}/logo/'`), (0, sequelize_1.col)("logos")), "url"],
                ],
            },
            include: [
                {
                    model: Country_1.default,
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
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch supplier" });
    }
};
exports.getSupplier = getSupplier;
// ====== get option 
const getSupplierOption = async (req, res) => {
    try {
        const shopid = req.params.id;
        const supplier = await Suppliers_1.default.findAll({
            where: { shopid: shopid, status: 1 },
        });
        res.status(200).json(supplier);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch supplier" });
    }
};
exports.getSupplierOption = getSupplierOption;
