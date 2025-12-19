"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCartOrder = exports.deleteCart = exports.updateCartMinus = exports.updateCartPlus = exports.addOrder = void 0;
const sequelize_1 = require("sequelize");
const utils_1 = require("../utils");
const CartOrder_1 = __importDefault(require("../models/CartOrder"));
const Products_1 = __importDefault(require("../models/Products"));
const Units_1 = __importDefault(require("../models/Units"));
const Sizes_1 = __importDefault(require("../models/Sizes"));
const addOrder = async (req, res) => {
    const t = await CartOrder_1.default.sequelize?.transaction(); // ✅ ใช้ optional chaining ป้องกัน undefined
    try {
        const new_uuid = await (0, utils_1.maxid)(CartOrder_1.default, "cart_uuid");
        req.body.cart_uuid = new_uuid;
        const { productid, userbyid } = req.body;
        if (!productid || !userbyid) {
            await t?.rollback();
            return res.status(400).json({ error: "Missing productid or userbyid" });
        }
        // ✅ ຄົ້ນຫາວ່າມີສິນຄ້າໃນ cart ຢູ່ແລ້ວຫຼືບໍ່
        const existingOrder = await CartOrder_1.default.findOne({
            where: { productid, userbyid },
            transaction: t,
        });
        let result;
        if (existingOrder) {
            await CartOrder_1.default.update({ quantity: sequelize_1.Sequelize.literal(`quantity + ${req.body.quantity}`) }, { where: { productid, userbyid }, transaction: t });
            // ✅ ดึงข้อมูลที่อัปเดตล่าสุด
            result = await CartOrder_1.default.findOne({
                where: { productid, userbyid }, transaction: t,
            });
        }
        else {
            // ✅ สร้างสินค้าใหม่ใน cart
            result = await CartOrder_1.default.create(req.body, { transaction: t });
        }
        await t?.commit();
        return res
            .status(200)
            .json({ message: "Order saved successfully", data: result });
    }
    catch (error) {
        // ✅ rollback ถ้ามี transaction
        await t?.rollback();
        console.error("Error adding order:", error);
        return res.status(500).json({
            error: "Failed to add order",
            detail: error.message || "Unknown error",
        });
    }
};
exports.addOrder = addOrder;
// update cartorder plus
const updateCartPlus = async (req, res) => {
    try {
        const cart_uuid = atob(req.params.id); // req.params.id;
        const cartorder = await CartOrder_1.default.findByPk(cart_uuid);
        if (!cartorder) {
            res.status(404).json({ message: "Cart order not found" });
            return;
        }
        if (!req.body.updatedAt) {
            req.body.updatedAt = new Date();
        }
        await CartOrder_1.default.update({ quantity: sequelize_1.Sequelize.literal('quantity + 1') }, // Increment quantity by 1
        {
            where: { cart_uuid: cart_uuid },
            returning: true,
        });
        const updated = await CartOrder_1.default.findByPk(cart_uuid);
        if (!updated) {
            res.status(404).json({ message: "Updated cart order not found" });
            return;
        }
        // Return the updated cart order object in the response
        res.status(200).json({ message: "Update success", data: updated });
    }
    catch (error) {
        console.error("Error updating cart:", error);
        res.status(500).json({ message: "Error updating cart" });
    }
};
exports.updateCartPlus = updateCartPlus;
// update cartorder Delete quantity
const updateCartMinus = async (req, res) => {
    try {
        const id = atob(req.params.id); // req.params.id;
        // Check if cartorder exists
        const cartorder = await CartOrder_1.default.findByPk(id);
        if (!cartorder) {
            res.status(404).json({ message: "cartorder not found" });
            return;
        }
        if (!req.body.updatedAt) {
            req.body.updatedAt = new Date();
        }
        //   const updatedQuantity = cartorder.quantity - 1;
        await CartOrder_1.default.update({ quantity: sequelize_1.Sequelize.literal('quantity - 1') }, // Update the quantity and timestamp
        {
            where: { cart_uuid: id },
            returning: true,
        });
        const updated = await CartOrder_1.default.findByPk(id);
        res.status(200).json({ message: "update success", data: updated });
    }
    catch (error) {
        console.error("Error in cart:", error);
        res.status(500).json({ message: "Error updating cart" }); // Avoid sending raw error in production
    }
};
exports.updateCartMinus = updateCartMinus;
const deleteCart = async (req, res) => {
    try {
        const id = atob(req.params.id); // req.params.id;
        const targetCart = await CartOrder_1.default.findByPk(id);
        if (!targetCart) {
            res.status(404).json({ message: "Cart not found" });
            return;
        }
        await CartOrder_1.default.destroy({ where: { cart_uuid: id } });
        res.status(200).json({ message: "Cart deleted successfully", data: targetCart });
    }
    catch (error) {
        console.error("Error in delete CArt:", error);
        res.status(500).json({ message: "Error deleting Cart" });
    }
};
exports.deleteCart = deleteCart;
const getCartOrder = async (req, res) => {
    try {
        const userbyid = req.params.id;
        // ✅ ดึงข้อมูล cart พร้อมสินค้าและหน่วย
        const cartOrders = await CartOrder_1.default.findAll({
            where: { userbyid },
            include: [
                {
                    model: Products_1.default,
                    as: "product",
                    attributes: [
                        "productName",
                        "images",
                        "stock",
                        "buyPrices",
                        "sellPrices",
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
        // ✅ ตอบกลับข้อมูลให้ frontend ใช้งานง่าย
        return res.status(200).json({
            message: "Fetched cart orders successfully",
            data: cartOrders,
        });
    }
    catch (error) {
        console.error("❌ Error getting cart orders:", error);
        return res.status(500).json({
            error: "Failed to get cart orders",
            detail: error.message || "Unknown error",
        });
    }
};
exports.getCartOrder = getCartOrder;
