"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCartImport = exports.addorderImportBarcode = exports.addorderImportSku = exports.deleteCartImportAll = exports.deleteCartImport = exports.addorderImport = void 0;
const sequelize_1 = require("sequelize");
const utils_1 = require("../utils");
const CartImport_1 = __importDefault(require("../models/CartImport"));
const Products_1 = __importDefault(require("../models/Products"));
const Units_1 = __importDefault(require("../models/Units"));
const Sizes_1 = __importDefault(require("../models/Sizes"));
const addorderImport = async (req, res) => {
    try {
        const { items, userbyid, status } = req.body;
        for (const item of items) {
            const check = await CartImport_1.default.findOne({
                where: {
                    productid: item.productid,
                    userbyid: userbyid,
                    status: status
                }
            });
            if (!check) {
                item.userbyid = userbyid;
                item.status = status;
                await CartImport_1.default.create(item);
            }
        }
        res.status(200).json({ message: "Add order success", data: items });
    }
    catch (error) {
        console.error("❌ Error adding order:", error);
        return res.status(500).json({
            error: "Failed to add order",
            detail: error.message || "Unknown error",
        });
    }
};
exports.addorderImport = addorderImport;
const deleteCartImport = async (req, res) => {
    try {
        const id = req.params.id;
        const deleted = await CartImport_1.default.destroy({ where: { _uuid: id } });
        if (!deleted)
            return res.status(404).json({ error: "Order not found" });
        res.status(200).json({ message: "Order deleted successfully" });
    }
    catch (error) {
        console.error("❌ Error deleting order:", error);
        return res.status(500).json({
            error: "Failed to delete order",
            detail: error.message || "Unknown error",
        });
    }
};
exports.deleteCartImport = deleteCartImport;
const deleteCartImportAll = async (req, res) => {
    try {
        const id = req.params.id;
        const status = req.query.status;
        const deleted = await CartImport_1.default.destroy({ where: { userbyid: id, status: status } });
        if (!deleted)
            return res.status(404).json({ error: "Order not found" });
        res.status(200).json({ message: "Order deleted successfully" });
    }
    catch (error) {
        console.error("❌ Error deleting order:", error);
        return res.status(500).json({
            error: "Failed to delete order",
            detail: error.message || "Unknown error",
        });
    }
};
exports.deleteCartImportAll = deleteCartImportAll;
// =========== createby sku ===========
const addorderImportSku = async (req, res) => {
    try {
        const { sku, shopid, createbyid, status } = req.body;
        const product = await Products_1.default.findOne({
            where: { sku, shopid, status: 1 }
        });
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        const exists = await CartImport_1.default.findOne({
            where: {
                productid: product.product_uuid,
                userbyid: createbyid,
                status: status
            }
        });
        if (exists) {
            return res.status(409).json({ message: "Product already in cart" }); // ✔ FIX
        }
        await CartImport_1.default.create({
            productid: product.product_uuid,
            userbyid: createbyid
        });
        return res.status(200).json({
            message: "Add order success",
            data: product
        });
    }
    catch (error) {
        console.error("❌ Error adding order:", error);
        return res.status(500).json({
            message: "Failed to add order",
            error: error.message
        });
    }
};
exports.addorderImportSku = addorderImportSku;
// =========== createby sku ===========
const addorderImportBarcode = async (req, res) => {
    try {
        const { barcode, shopid, createbyid, status } = req.body;
        const product = await Products_1.default.findOne({
            where: { barcode, shopid, status: status }
        });
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        const exists = await CartImport_1.default.findOne({
            where: {
                productid: product.product_uuid,
                userbyid: createbyid
            }
        });
        if (exists) {
            return res.status(409).json({ message: "Product already in cart" }); // ✔ FIX
        }
        await CartImport_1.default.create({
            productid: product.product_uuid,
            userbyid: createbyid
        });
        return res.status(200).json({
            message: "Add order success",
            data: product
        });
    }
    catch (error) {
        console.error("❌ Error adding order:", error);
        return res.status(500).json({
            message: "Failed to add order",
            error: error.message
        });
    }
};
exports.addorderImportBarcode = addorderImportBarcode;
const getCartImport = async (req, res) => {
    try {
        const userbyid = req.params.id;
        const status = req.query.status;
        const cartOrders = await CartImport_1.default.findAll({
            where: { userbyid, status: status },
            include: [
                {
                    model: Products_1.default,
                    as: "product",
                    attributes: [
                        "product_uuid",
                        "sku",
                        "barcode",
                        "productName",
                        "images",
                        "stock",
                        "buyPrices",
                        "sellPrices",
                        "quantity",
                        [(0, sequelize_1.fn)("CONCAT", (0, sequelize_1.literal)(`'${(0, utils_1.url)()}/product/'`), (0, sequelize_1.col)("product.images")), "url"],
                    ],
                    include: [
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
                    ],
                },
            ],
        });
        res.status(200).json({ message: "Get order success", data: cartOrders });
    }
    catch (error) {
        console.error("❌ Error getting order:", error);
        return res.status(500).json({
            error: "Failed to get order",
            detail: error.message || "Unknown error",
        });
    }
};
exports.getCartImport = getCartImport;
