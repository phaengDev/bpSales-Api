"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrometionbypsid = exports.getPrometionhasMany = exports.getPrometion = exports.deletePrometion = exports.updatePrometion = exports.createPrometionMt = exports.createPrometion = void 0;
const sequelize_1 = require("sequelize");
const utils_1 = require("../utils");
const Promotion_1 = __importDefault(require("../models/Promotion"));
const Products_1 = __importDefault(require("../models/Products"));
const Brands_1 = __importDefault(require("../models/Brands"));
const Sizes_1 = __importDefault(require("../models/Sizes"));
const Units_1 = __importDefault(require("../models/Units"));
const createPrometion = async (req, res) => {
    try {
        const new_uuid = await (0, utils_1.maxid)(Promotion_1.default, "_uuid");
        req.body._uuid = new_uuid;
        const promotion = await Promotion_1.default.create(req.body);
        if (!promotion)
            return res.status(404).json({ error: "Promotion not found" });
        return res.status(200).json({ message: "Promotion created successfully", data: promotion });
    }
    catch (error) {
        return res.status(500).json({ error: "Failed to create Promotion" });
    }
};
exports.createPrometion = createPrometion;
const createPrometionMt = async (req, res) => {
    try {
        const { dataPs, productid } = req.body;
        if (!Array.isArray(dataPs) || dataPs.length === 0) {
            return res.status(400).json({ error: "Request body must be a non-empty array" });
        }
        for (const item of dataPs) {
            const new_uuid = await (0, utils_1.maxid)(Promotion_1.default, "_uuid");
            const promotion = await Promotion_1.default.create({
                _uuid: new_uuid,
                productid: productid,
                qty_buy: item.qty_buy,
                qty_free: item.qty_free,
                status: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            if (!promotion) {
                return res.status(500).json({ error: "Failed to create Promotion" });
            }
        }
        return res.status(200).json({
            message: "Promotion created successfully",
            data: dataPs
        });
    }
    catch (error) {
        console.error("❌ createPromotionMt error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.createPrometionMt = createPrometionMt;
// ================ get promotion ================
const updatePrometion = async (req, res) => {
    try {
        const _uuid = atob(req.params.id);
        req.body.updatedAt = new Date();
        const promotion = await Promotion_1.default.findByPk(_uuid);
        if (!promotion)
            return res.status(404).json({ error: "Promotion not found" });
        const updated = await Promotion_1.default.update(req.body, {
            where: { _uuid: _uuid },
        });
        if (!updated)
            return res.status(404).json({ error: "Promotion not found" });
        res.status(200).json({ message: "Promotion updated successfully", data: updated });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update Promotion" });
    }
};
exports.updatePrometion = updatePrometion;
// ================ delete promotion ================
const deletePrometion = async (req, res) => {
    try {
        const _uuid = atob(req.params.id);
        const promotion = await Promotion_1.default.findByPk(_uuid);
        if (!promotion)
            return res.status(404).json({ error: "Promotion not found" });
        await Promotion_1.default.destroy({ where: { _uuid: _uuid } });
        res.status(200).json({ message: "Promotion deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete Promotion" });
    }
};
exports.deletePrometion = deletePrometion;
// ===========get promotion ================
const getPrometion = async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
        const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
        const orderBy = req.query.orderBy || "_uuid";
        const order = (req.query.order || "ASC").toUpperCase();
        const { shopid, categorieid, productid } = req.body;
        const whereConditions = {};
        if (shopid) {
            whereConditions["$product.shopid$"] = shopid;
        }
        if (categorieid) {
            whereConditions["$brand.categorieid$"] = categorieid;
        }
        if (productid) {
            whereConditions.productid = productid;
        }
        const { rows, count } = await Promotion_1.default.findAndCountAll({
            where: whereConditions,
            limit,
            offset: skip,
            order: [[orderBy, order]],
            include: [
                {
                    model: Products_1.default,
                    as: 'product',
                    attributes: {
                        include: [
                            [(0, sequelize_1.fn)("CONCAT", (0, sequelize_1.literal)(`'${(0, utils_1.url)()}/product/'`), (0, sequelize_1.col)("images")), "url"],
                        ],
                    },
                    include: [
                        {
                            model: Brands_1.default,
                            as: 'brand',
                        },
                        {
                            model: Sizes_1.default,
                            as: 'size',
                        },
                        {
                            model: Units_1.default,
                            as: 'unit',
                        }
                    ],
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
        res.status(500).json({ error: "Failed to fetch Promotion" });
    }
};
exports.getPrometion = getPrometion;
const getPrometionhasMany = async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
        const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
        const orderBy = req.query.orderBy || "_uuid";
        const order = (req.query.order || "ASC").toUpperCase();
        const { shopid, cartgoryid, brandid, sizeid } = req.body;
        const whereConditions = {};
        if (shopid)
            whereConditions.shopid = shopid;
        if (cartgoryid)
            whereConditions["$brand.categorieid$"] = cartgoryid;
        if (brandid)
            whereConditions.brandid = brandid;
        if (sizeid)
            whereConditions.sizeid = sizeid;
        const { rows, count } = await Products_1.default.findAndCountAll({
            where: whereConditions,
            limit,
            offset: skip,
            order: [[orderBy, order]],
            include: [
                {
                    model: Promotion_1.default,
                    as: "promotion",
                    required: true, // ✅ INNER JOIN only when promotion exists
                    where: { status: 1 }, // ✅ optional – only active promotions
                },
                {
                    model: Brands_1.default,
                    as: "brand",
                },
                {
                    model: Sizes_1.default,
                    as: "size",
                },
                {
                    model: Units_1.default,
                    as: "unit",
                },
            ],
        });
        res.status(200).json({
            data: rows,
            total: count,
            limit,
            skip,
        });
    }
    catch (error) {
        console.error("❌ Error fetching Promotion:", error);
        res.status(500).json({ error: "Failed to fetch Promotion" });
    }
};
exports.getPrometionhasMany = getPrometionhasMany;
const getPrometionbypsid = async (req, res) => {
    try {
        const productid = atob(req.params.id);
        const promotion = await Promotion_1.default.findAll({
            where: { productid: productid }
        });
        if (!promotion)
            return res.status(404).json({ error: "Promotion not found" });
        res.status(200).json({ data: promotion });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch Promotion" });
    }
};
exports.getPrometionbypsid = getPrometionbypsid;
