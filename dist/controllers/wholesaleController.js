"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPriceAll = exports.getPricebyProduct = exports.deletePricebyProduct = exports.deletePrice = exports.updatePrice = exports.createPriceMt = exports.createPriceOne = void 0;
const sequelize_1 = require("sequelize");
const utils_1 = require("../utils");
const Wholesale_1 = __importDefault(require("../models/Wholesale"));
const Products_1 = __importDefault(require("../models/Products"));
const Brands_1 = __importDefault(require("../models/Brands"));
const Categories_1 = __importDefault(require("../models/Categories"));
const Units_1 = __importDefault(require("../models/Units"));
const Sizes_1 = __importDefault(require("../models/Sizes"));
const createPriceOne = async (req, res) => {
    try {
        const new_uuid = await (0, utils_1.maxid)(Wholesale_1.default, "price_uuid");
        req.body.price_uuid = new_uuid;
        const price = await Wholesale_1.default.create(req.body);
        if (!price) {
            return res.status(500).json({ error: "Failed to create Wholesale" });
        }
        return res.status(200).json({
            message: "Wholesale created successfully",
            data: price
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.createPriceOne = createPriceOne;
const createPriceMt = async (req, res) => {
    try {
        const { dataPrices, productid } = req.body;
        if (!Array.isArray(dataPrices) || dataPrices.length === 0) {
            return res.status(400).json({ error: "Request body must be a non-empty array" });
        }
        for (const item of dataPrices) {
            const new_uuid = await (0, utils_1.maxid)(Wholesale_1.default, "price_uuid");
            const price = await Wholesale_1.default.create({
                price_uuid: new_uuid,
                productid: productid,
                typeName: item.typeName,
                prices: item.prices,
                status: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            if (!price) {
                return res.status(500).json({ error: "Failed to create Wholesale" });
            }
        }
        return res.status(200).json({
            message: "Wholesale created successfully",
            data: dataPrices
        });
    }
    catch (error) {
        console.error("❌ createPriceMt error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.createPriceMt = createPriceMt;
// =====updatePrice 
const updatePrice = async (req, res) => {
    try {
        const price_uuid = atob(req.params.id);
        req.body.updatedAt = new Date();
        const price = await Wholesale_1.default.findByPk(price_uuid);
        if (!price)
            return res.status(404).json({ error: "Wholesale not found" });
        const updated = await Wholesale_1.default.update(req.body, {
            where: { price_uuid: price_uuid },
        });
        if (!updated)
            return res.status(404).json({ error: "Wholesale not found" });
        return res.status(200).json({ message: "Wholesale updated successfully", data: updated });
    }
    catch (error) {
        return res.status(500).json({ error: "Failed to update Wholesale" });
    }
};
exports.updatePrice = updatePrice;
//  deletePrice
const deletePrice = async (req, res) => {
    try {
        const price_uuid = atob(req.params.id);
        const deleted = await Wholesale_1.default.destroy({ where: { price_uuid: price_uuid } });
        if (!deleted)
            return res.status(404).json({ error: "Wholesale not found" });
        return res.status(200).json({ message: "Wholesale deleted successfully" });
    }
    catch (error) {
        return res.status(500).json({ error: "Failed to delete Wholesale" });
    }
};
exports.deletePrice = deletePrice;
const deletePricebyProduct = async (req, res) => {
    try {
        const productid = atob(req.params.id);
        const deleted = await Wholesale_1.default.destroy({ where: { productid: productid } });
        if (!deleted)
            return res.status(404).json({ error: "Wholesale not found" });
        return res.status(200).json({ message: "Wholesale deleted successfully", data: deleted });
    }
    catch (error) {
        return res.status(500).json({ error: "Failed to delete Wholesale" });
    }
};
exports.deletePricebyProduct = deletePricebyProduct;
const getPricebyProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const prices = await Wholesale_1.default.findAll({ where: { productid: productId } });
        if (!prices)
            return res.status(404).json({ error: "Wholesale not found" });
        return res.status(200).json({ message: "Wholesale found successfully", data: prices });
    }
    catch (error) {
        return res.status(500).json({ error: "Failed to get Wholesale" });
    }
};
exports.getPricebyProduct = getPricebyProduct;
const getPriceAll = async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
        const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
        const orderBy = req.query.orderBy || "product_uuid";
        const order = (req.query.order || "ASC").toUpperCase();
        const { shopid, cartgoryid, brandid, unitid, sizeid } = req.body;
        const whereconditions = {
            shopid: shopid,
        };
        if (cartgoryid) {
            whereconditions['$brand.categorieid$'] = cartgoryid;
        }
        if (brandid) {
            whereconditions.brandid = brandid;
        }
        if (unitid) {
            whereconditions.uniteid = unitid;
        }
        if (sizeid) {
            whereconditions.sizeid = sizeid;
        }
        const { rows, count } = await Products_1.default.findAndCountAll({
            where: whereconditions,
            limit,
            offset: skip,
            order: [[orderBy, order]],
            attributes: [
                "product_uuid",
                "productName",
                "sku",
                "images",
                "sellPrices",
                "buyPrices",
                "quantity",
                "stock",
                [(0, sequelize_1.fn)("CONCAT", (0, sequelize_1.literal)(`'${(0, utils_1.url)()}/product/'`), (0, sequelize_1.col)("images")), "url"],
            ],
            include: [
                {
                    model: Brands_1.default,
                    as: "brand",
                    attributes: ["brandCode", "brandName"],
                    include: [
                        {
                            model: Categories_1.default,
                            as: "category",
                            attributes: ["cateName"],
                        },
                    ],
                },
                {
                    model: Units_1.default,
                    as: "unit",
                    attributes: ["unitName"],
                },
                {
                    model: Sizes_1.default,
                    as: "size",
                    attributes: ["sizeName"],
                },
                {
                    model: Wholesale_1.default,
                    as: "price",
                    required: true,
                }
            ]
        });
        return res.status(200).json({
            data: rows,
            total: count,
            limit,
            skip
        });
    }
    catch (error) {
        return res.status(500).json({ error: "Failed to get Wholesale" });
    }
};
exports.getPriceAll = getPriceAll;
