import { Request, Response } from "express";
import { Sequelize, Op, fn, col, literal } from 'sequelize';
import { maxid, url } from "../utils";
import CartOrder from "../models/CartOrder";
import Products from "../models/Products";
import Units from "../models/Units";
import Sizes from "../models/Sizes";
import CartImport from "../models/CartImport";

export const addOrder = async (req: Request, res: Response) => {
    const t = await CartOrder.sequelize?.transaction(); // ✅ ใช้ optional chaining ป้องกัน undefined
    try {
        const new_uuid = await maxid(CartOrder, "cart_uuid");
        req.body.cart_uuid = new_uuid;
        const { productid, userbyid } = req.body as any;
        if (!productid || !userbyid) {
            await t?.rollback();
            return res.status(400).json({ error: "Missing productid or userbyid" });
        }
        // ✅ ຄົ້ນຫາວ່າມີສິນຄ້າໃນ cart ຢູ່ແລ້ວຫຼືບໍ່
        const existingOrder = await CartOrder.findOne({
            where: { productid, userbyid },
            transaction: t,
        });
        let result;
        if (existingOrder) {
            await CartOrder.update(
                { quantity: Sequelize.literal(`quantity + ${req.body.quantity}`) },
                { where: { productid, userbyid }, transaction: t }
            );

            // ✅ ดึงข้อมูลที่อัปเดตล่าสุด
            result = await CartOrder.findOne({
                where: { productid, userbyid }, transaction: t,
            });
        } else {
            // ✅ สร้างสินค้าใหม่ใน cart
            result = await CartOrder.create(req.body, { transaction: t });
        }
        await t?.commit();
        return res
            .status(200)
            .json({ message: "Order saved successfully", data: result });
    } catch (error: any) {
        // ✅ rollback ถ้ามี transaction
        await t?.rollback();
        console.error("Error adding order:", error);
        return res.status(500).json({
            error: "Failed to add order",
            detail: error.message || "Unknown error",
        });
    }
};


// update cartorder plus
export const updateCartPlus = async (
    req: Request<{ id: string }, any>,
    res: Response
): Promise<void> => {
    try {
        const cart_uuid = atob(req.params.id); // req.params.id;
        const cartorder = await CartOrder.findByPk(cart_uuid);
        if (!cartorder) {
            res.status(404).json({ message: "Cart order not found" });
            return;
        }
        if (!req.body.updatedAt) {
            req.body.updatedAt = new Date();
        }
        await CartOrder.update(
            { quantity: Sequelize.literal('quantity + 1') }, // Increment quantity by 1
            {
                where: { cart_uuid: cart_uuid },
                returning: true,
            }
        );
        const updated = await CartOrder.findByPk(cart_uuid);
        if (!updated) {
            res.status(404).json({ message: "Updated cart order not found" });
            return;
        }

        // Return the updated cart order object in the response
        res.status(200).json({ message: "Update success", data:updated });
    } catch (error) {
        console.error("Error updating cart:", error);
        res.status(500).json({ message: "Error updating cart" });
    }
};

// update cartorder Delete quantity
export const updateCartMinus = async (
    req: Request<{ id: string }, any>,
    res: Response
): Promise<void> => {
    try {
        const id = atob(req.params.id); // req.params.id;
        // Check if cartorder exists
        const cartorder = await CartOrder.findByPk(id);
        if (!cartorder) {
            res.status(404).json({ message: "cartorder not found" });
            return;
        }
        if (!req.body.updatedAt) {
            req.body.updatedAt = new Date();
        }
        //   const updatedQuantity = cartorder.quantity - 1;
        await CartOrder.update(
            { quantity: Sequelize.literal('quantity - 1') }, // Update the quantity and timestamp
            {
                where: { cart_uuid: id },
                returning: true,
            }
        );
        const updated = await CartOrder.findByPk(id);
        res.status(200).json({ message: "update success", data:updated });

    } catch (error) {
        console.error("Error in cart:", error);
        res.status(500).json({ message: "Error updating cart" }); // Avoid sending raw error in production
    }
};


export const deleteCart = async (
    req: Request<{ id: string }, any>,
    res: Response
): Promise<void> => {
    try {
        const id = atob(req.params.id); // req.params.id;
        const targetCart = await CartOrder.findByPk(id);
        if (!targetCart) {
            res.status(404).json({ message: "Cart not found" });
            return;
        }
        await CartOrder.destroy({ where: { cart_uuid: id } });
        res.status(200).json({ message: "Cart deleted successfully", data: targetCart });
    } catch (error) {
        console.error("Error in delete CArt:", error);
        res.status(500).json({ message: "Error deleting Cart" });
    }
};


export const getCartOrder = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const userbyid = req.params.id;
        // ✅ ดึงข้อมูล cart พร้อมสินค้าและหน่วย
        const cartOrders = await CartOrder.findAll({
            where: { userbyid },
            include: [
                {
                    model: Products,
                    as: "product",
                    attributes: [
                        "productName",
                        "images",
                        "stock",
                        "buyPrices",
                        "sellPrices",
                        [fn("CONCAT", literal(`'${url()}/product/'`), col("product.images")), "url"],
                    ],
                    include: [
                        {
                            model: Units,
                            as: "unit",
                            attributes: ["unitName"],
                        },
                        {
                            model: Sizes,
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
    } catch (error: any) {
        console.error("❌ Error getting cart orders:", error);
        return res.status(500).json({
            error: "Failed to get cart orders",
            detail: error.message || "Unknown error",
        });
    }
};