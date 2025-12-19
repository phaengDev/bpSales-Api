import { Request, Response } from "express";
import { Sequelize, Op, fn, col, literal } from 'sequelize';
import { maxid, url } from "../utils";
import CartImport from "../models/CartImport";
import Products from "../models/Products";
import Units from "../models/Units";
import Sizes from "../models/Sizes";


export const addorderImport = async (req: Request, res: Response) => {
    try {
        const { items, userbyid, status } = req.body;
        for (const item of items) {
            const check = await CartImport.findOne({
                where: {
                    productid: item.productid,
                    userbyid: userbyid,
                    status: status
                }
            })
            if (!check) {
                item.userbyid = userbyid;
                item.status = status;
                await CartImport.create(item);
            }
        }

        res.status(200).json({ message: "Add order success", data: items });
    } catch (error: any) {
        console.error("❌ Error adding order:", error);
        return res.status(500).json({
            error: "Failed to add order",
            detail: error.message || "Unknown error",
        });
    }
};

export const deleteCartImport = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const id = req.params.id;
        const deleted = await CartImport.destroy({ where: { _uuid: id } });
        if (!deleted) return res.status(404).json({ error: "Order not found" });
        res.status(200).json({ message: "Order deleted successfully" });
    } catch (error: any) {
        console.error("❌ Error deleting order:", error);
        return res.status(500).json({
            error: "Failed to delete order",
            detail: error.message || "Unknown error",
        });
    }
}

export const deleteCartImportAll = async (
    req: Request<{ id: string }, {}, {}, { status: string }>,
    res: Response
) => {
    try {
        const id = req.params.id;
        const status = req.query.status;
        const deleted = await CartImport.destroy({ where: { userbyid: id, status: status } });
        if (!deleted) return res.status(404).json({ error: "Order not found" });
        res.status(200).json({ message: "Order deleted successfully" });
    } catch (error: any) {
        console.error("❌ Error deleting order:", error);
        return res.status(500).json({
            error: "Failed to delete order",
            detail: error.message || "Unknown error",
        });
    }
}
// =========== createby sku ===========
export const addorderImportSku = async (req: Request, res: Response) => {
    try {
        const { sku, shopid, createbyid, status } = req.body;

        const product = await Products.findOne({
            where: { sku, shopid, status: status }
        });

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const exists = await CartImport.findOne({
            where: {
                productid: product.product_uuid,
                userbyid: createbyid
            }
        });

        if (exists) {
            return res.status(409).json({ message: "Product already in cart" }); // ✔ FIX
        }

        await CartImport.create({
            productid: product.product_uuid,
            userbyid: createbyid
        });

        return res.status(200).json({
            message: "Add order success",
            data: product
        });

    } catch (error: any) {
        console.error("❌ Error adding order:", error);
        return res.status(500).json({
            message: "Failed to add order",
            error: error.message
        });
    }
};


// =========== createby sku ===========
export const addorderImportBarcode = async (req: Request, res: Response) => {
    try {
        const { barcode, shopid, createbyid, status } = req.body;
        const product = await Products.findOne({
            where: { barcode, shopid, status: status }
        });
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const exists = await CartImport.findOne({
            where: {
                productid: product.product_uuid,
                userbyid: createbyid
            }
        });
        if (exists) {
            return res.status(409).json({ message: "Product already in cart" }); // ✔ FIX
        }
        await CartImport.create({
            productid: product.product_uuid,
            userbyid: createbyid
        });

        return res.status(200).json({
            message: "Add order success",
            data: product
        });

    } catch (error: any) {
        console.error("❌ Error adding order:", error);
        return res.status(500).json({
            message: "Failed to add order",
            error: error.message
        });
    }
};



export const getCartImport =async (
  req: Request<{ id: string }, {}, {}, { status: string }>,
  res: Response
) => {
    try {
        const userbyid = req.params.id;
           const status = req.query.status;
        const cartOrders = await CartImport.findAll({
            where: { userbyid, status: status },
            include: [
                {
                    model: Products,
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
        res.status(200).json({ message: "Get order success", data: cartOrders });
    } catch (error: any) {
        console.error("❌ Error getting order:", error);
        return res.status(500).json({
            error: "Failed to get order",
            detail: error.message || "Unknown error",
        });
    }
};

