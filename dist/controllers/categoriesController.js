"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategoriesOption = exports.getCategories = exports.deleteCategories = exports.updateCategories = exports.createCategories = void 0;
const utils_1 = require("../utils");
const Categories_1 = __importDefault(require("../models/Categories"));
// create categories
const createCategories = async (req, res) => {
    try {
        const new_uuid = await (0, utils_1.maxid)(Categories_1.default, "cate_uuid");
        req.body.cate_uuid = new_uuid;
        const newCode = await (0, utils_1.maxCode)(Categories_1.default, "cateCode", "CAT");
        req.body.cateCode = newCode;
        const existing = await Categories_1.default.findOne({ where: { cateName: req.body.cateName } });
        if (existing) {
            res.status(409).json({ error: "Categories with this name already exists" });
            return;
        }
        const categories = await Categories_1.default.create(req.body);
        res.status(200).json({ message: "Categories created successfully", data: categories });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create categories" });
    }
};
exports.createCategories = createCategories;
// update categories
const updateCategories = async (req, res) => {
    try {
        const cate_uuid = atob(req.params.id);
        req.body.updatedAt = new Date();
        const categories = await Categories_1.default.findByPk(cate_uuid);
        if (!categories)
            return res.status(404).json({ error: "Categories not found" });
        const updated = await Categories_1.default.update(req.body, {
            where: { cate_uuid: cate_uuid },
        });
        if (!updated)
            return res.status(404).json({ error: "Categories not found" });
        res.status(200).json({ message: "Categories updated successfully", data: updated });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update categories" });
    }
};
exports.updateCategories = updateCategories;
// delete Categories
const deleteCategories = async (req, res) => {
    try {
        const cate_uuid = atob(req.params.id);
        const categories = await Categories_1.default.findByPk(cate_uuid);
        if (!categories)
            return res.status(404).json({ error: "Categories not found" });
        const deleted = await Categories_1.default.destroy({
            where: { cate_uuid: cate_uuid },
        });
        if (!deleted)
            return res.status(404).json({ error: "Categories not found" });
        res.status(200).json({ message: "Categories deleted successfully", data: deleted });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete categories" });
    }
};
exports.deleteCategories = deleteCategories;
// get Categories
const getCategories = async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
        const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
        const orderBy = req.query.orderBy || "cate_uuid";
        const order = (req.query.order || "ASC").toUpperCase();
        const shopid = req.params.id;
        const { rows, count } = await Categories_1.default.findAndCountAll({
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
exports.getCategories = getCategories;
// ger option
const getCategoriesOption = async (req, res) => {
    try {
        const shopid = req.params.id;
        const categories = await Categories_1.default.findAll({
            where: { shopid: shopid, status: 1 },
        });
        res.status(200).json({ data: categories });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch categories" });
    }
};
exports.getCategoriesOption = getCategoriesOption;
