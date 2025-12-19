"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSizeOption = exports.getSize = exports.deleteSize = exports.updateSize = exports.createSize = void 0;
const utils_1 = require("../utils");
const Sizes_1 = __importDefault(require("../models/Sizes"));
// created size
const createSize = async (req, res) => {
    try {
        const new_uuid = await (0, utils_1.maxid)(Sizes_1.default, "size_uuid");
        req.body.size_uuid = new_uuid;
        const sizes = await Sizes_1.default.create(req.body);
        res.status(200).json({ message: "Sizes created successfully", data: sizes });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create Sizes" });
    }
};
exports.createSize = createSize;
//    update size
const updateSize = async (req, res) => {
    try {
        const size_uuid = atob(req.params.id);
        req.body.updatedAt = new Date();
        const sizes = await Sizes_1.default.findByPk(size_uuid);
        if (!sizes)
            return res.status(404).json({ error: "Sizes not found" });
        const updated = await Sizes_1.default.update(req.body, {
            where: { size_uuid: size_uuid },
        });
        if (!updated)
            return res.status(404).json({ error: "Sizes not found" });
        res.status(200).json({ message: "Sizes updated successfully", data: updated });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update Sizes" });
    }
};
exports.updateSize = updateSize;
// delete size
const deleteSize = async (req, res) => {
    try {
        const size_uuid = atob(req.params.id);
        const sizes = await Sizes_1.default.findByPk(size_uuid);
        if (!sizes)
            return res.status(404).json({ error: "Sizes not found" });
        const deleted = await Sizes_1.default.destroy({
            where: { size_uuid: size_uuid },
        });
        if (!deleted)
            return res.status(404).json({ error: "Sizes not found" });
        res.status(200).json({ message: "Sizes deleted successfully", data: deleted });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete Sizes" });
    }
};
exports.deleteSize = deleteSize;
// get size 
const getSize = async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
        const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
        const orderBy = req.query.orderBy || "size_uuid";
        const order = (req.query.order || "ASC").toUpperCase();
        const shopid = req.params.id;
        const { rows, count } = await Sizes_1.default.findAndCountAll({
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
exports.getSize = getSize;
// get Size
const getSizeOption = async (req, res) => {
    try {
        const shopid = req.params.id;
        const size = await Sizes_1.default.findAll({
            where: { shopid: shopid, status: 1 },
        });
        if (!size)
            return res.status(404).json({ error: "Size not found" });
        res.status(200).json({ message: "Size fetched successfully", data: size });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch Size" });
    }
};
exports.getSizeOption = getSizeOption;
