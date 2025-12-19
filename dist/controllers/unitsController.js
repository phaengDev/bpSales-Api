"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnitOption = exports.getUnits = exports.deleteUnit = exports.updateUnit = exports.createUnit = void 0;
const utils_1 = require("../utils");
const Units_1 = __importDefault(require("../models/Units"));
// create Unit
const createUnit = async (req, res) => {
    try {
        const new_uuid = await (0, utils_1.maxid)(Units_1.default, "unit_uuid");
        req.body.unit_uuid = new_uuid;
        const units = await Units_1.default.create(req.body);
        res.status(200).json({ message: "Units created successfully", data: units });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create Units" });
    }
};
exports.createUnit = createUnit;
//    update Units
const updateUnit = async (req, res) => {
    try {
        const unit_uuid = atob(req.params.id);
        req.body.updatedAt = new Date();
        const units = await Units_1.default.findByPk(unit_uuid);
        if (!units)
            return res.status(404).json({ error: "Units not found" });
        const updated = await Units_1.default.update(req.body, {
            where: { unit_uuid: unit_uuid },
        });
        if (!updated)
            return res.status(404).json({ error: "Units not found" });
        res.status(200).json({ message: "Units updated successfully", data: updated });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update Units" });
    }
};
exports.updateUnit = updateUnit;
// delete Units
const deleteUnit = async (req, res) => {
    try {
        const unit_uuid = atob(req.params.id);
        const units = await Units_1.default.findByPk(unit_uuid);
        if (!units)
            return res.status(404).json({ error: "Units not found" });
        const deleted = await Units_1.default.destroy({
            where: { unit_uuid: unit_uuid },
        });
        if (!deleted)
            return res.status(404).json({ error: "Units not found" });
        res.status(200).json({ message: "Units deleted successfully", data: deleted });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete Units" });
    }
};
exports.deleteUnit = deleteUnit;
// getUnits
const getUnits = async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
        const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
        const orderBy = req.query.orderBy || "unit_uuid";
        const order = (req.query.order || "ASC").toUpperCase();
        const shopid = req.params.id;
        const { rows, count } = await Units_1.default.findAndCountAll({
            where: { shopid: shopid },
            limit,
            offset: skip,
            order: [[orderBy, order]],
        });
        res.status(200).json({
            data: rows,
            total: count,
            limit,
            skip
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch categories" });
    }
};
exports.getUnits = getUnits;
// get Units
const getUnitOption = async (req, res) => {
    try {
        const shopid = req.params.id;
        const units = await Units_1.default.findAll({
            where: { shopid: shopid, status: 1 },
        });
        if (!units)
            return res.status(404).json({ error: "Units not found" });
        res.status(200).json({ message: "Units fetched successfully", data: units });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch Units" });
    }
};
exports.getUnitOption = getUnitOption;
