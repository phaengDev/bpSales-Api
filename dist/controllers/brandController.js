"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBrandbycategory = exports.getBrand = exports.deleteBrand = exports.updateBrand = exports.createBrand = void 0;
const utils_1 = require("../utils");
const Brands_1 = __importDefault(require("../models/Brands"));
const Categories_1 = __importDefault(require("../models/Categories"));
// create brand
const createBrand = async (req, res) => {
    try {
        const new_uuid = await (0, utils_1.maxid)(Brands_1.default, "brand_uuid");
        req.body.brand_uuid = new_uuid;
        const newCode = await (0, utils_1.maxCode)(Brands_1.default, "brandCode", "BRD");
        req.body.brandCode = newCode;
        const brand = await Brands_1.default.create(req.body);
        res.status(200).json({ message: "Brand created successfully", data: brand });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create brand" });
    }
};
exports.createBrand = createBrand;
// update brand
const updateBrand = async (req, res) => {
    try {
        const brand_uuid = atob(req.params.id);
        req.body.updatedAt = new Date();
        const brand = await Brands_1.default.findByPk(brand_uuid);
        if (!brand)
            return res.status(404).json({ error: "Brand not found" });
        const updated = await Brands_1.default.update(req.body, {
            where: { brand_uuid: brand_uuid },
        });
        if (!updated)
            return res.status(404).json({ error: "Brand not found" });
        res.status(200).json({ message: "Brand updated successfully", data: updated });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update brand" });
    }
};
exports.updateBrand = updateBrand;
// delete brand
const deleteBrand = async (req, res) => {
    try {
        const brand_uuid = atob(req.params.id);
        const brand = await Brands_1.default.findByPk(brand_uuid);
        if (!brand)
            return res.status(404).json({ error: "Brand not found" });
        const deleted = await Brands_1.default.destroy({
            where: { brand_uuid: brand_uuid },
        });
        if (!deleted)
            return res.status(404).json({ error: "Brand not found" });
        res.status(200).json({ message: "Brand deleted successfully", data: deleted });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete brand" });
    }
};
exports.deleteBrand = deleteBrand;
// get brand
const getBrand = async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
        const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
        const orderBy = req.query.orderBy || "brand_uuid";
        const order = (req.query.order || "ASC").toUpperCase();
        const { categorieid, shopid } = req.body;
        const whereConditions = {};
        if (shopid) {
            whereConditions['$category.shopid$'] = shopid;
        }
        if (categorieid) {
            whereConditions.categorieid = categorieid;
        }
        const { rows, count } = await Brands_1.default.findAndCountAll({
            where: whereConditions,
            limit,
            offset: skip,
            order: [[orderBy, order]],
            include: [
                {
                    model: Categories_1.default,
                    as: "category",
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
        res.status(500).json({ error: "Failed to fetch brand" });
    }
};
exports.getBrand = getBrand;
// get option
const getBrandbycategory = async (req, res) => {
    try {
        const categorieid = req.params.id;
        const categories = await Brands_1.default.findAll({
            where: { categorieid: categorieid, status: 1 },
        });
        if (!categories)
            return res.status(404).json({ error: "Categories not found" });
        res.status(200).json({ data: categories });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch categories" });
    }
};
exports.getBrandbycategory = getBrandbycategory;
