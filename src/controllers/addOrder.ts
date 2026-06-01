import { Request, Response } from "express";
import { fn, col, literal } from 'sequelize';
import { maxid, url } from "../utils";
import CartOrder from "../models/CartOrder";
import Products from "../models/Products";
import Units from "../models/Units";
import Sizes from "../models/Sizes";
import Wholesale from "../models/Wholesale";
import Promotion from "../models/Promotion";

const toNumber = (value: unknown, defaultValue = 0) => {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : defaultValue;
};

const decodeParamId = (id: string) => {
    if (/^\d+$/.test(id)) return id;

    try {
        return atob(id);
    } catch {
        return id;
    }
};

const getPaidQuantity = (order: CartOrder) => {
    return Math.max(toNumber(order.quantity, 1), 1);
};

// Promotion is calculated from paid quantity; free quantity is stored in `promotion`.
const getPromotionQuantity = async (
    productid: number | null,
    paidQuantity: number,
    transaction?: any
) => {
    if (!productid || paidQuantity <= 0) return 0;

    const promotions = await Promotion.findAll({
        where: { productid },
        transaction,
    });

    return promotions.reduce((maxFreeQty, promotion) => {
        const status = promotion.status === null || promotion.status === undefined
            ? 1
            : toNumber(promotion.status);
        if (status !== 1) {
            return maxFreeQty;
        }

        const qtyBuy = toNumber(promotion.qty_buy);
        const qtyFree = toNumber(promotion.qty_free);
        if (qtyBuy <= 0 || qtyFree <= 0) {
            return maxFreeQty;
        }

        const freeQty = paidQuantity >= qtyBuy
            ? Math.floor(paidQuantity / qtyBuy) * qtyFree
            : 0;
        return Math.max(maxFreeQty, freeQty);
    }, 0);
};

const buildCartPromotionValues = async ({
    productid,
    paidQuantity,
    salePrices,
    transaction,
}: {
    productid: number | null;
    paidQuantity: number;
    salePrices: number | null;
    transaction?: any;
}) => {
    const payableQuantity = Math.max(toNumber(paidQuantity, 1), 1);
    const promotion = await getPromotionQuantity(productid, payableQuantity, transaction);
    const price = toNumber(salePrices);

    return {
        quantity: payableQuantity,
        promotion,
        discount: promotion * price,
    };
};

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
        // const existingOrder = await CartOrder.findOne({
        //     where: { productid, userbyid },
        //     transaction: t,
        // });
        // let result;
        // if (existingOrder) {
        //     const paidQuantity = getPaidQuantity(existingOrder) + Math.max(toNumber(req.body.quantity, 1), 1);
        //     const salePrices = toNumber(req.body.salePrices, toNumber(existingOrder.salePrices));
        //     const promotionValues = await buildCartPromotionValues({
        //         productid: existingOrder.productid,
        //         paidQuantity,
        //         salePrices,
        //         transaction: t,
        //     });

        //     await CartOrder.update(
        //         {
        //             ...promotionValues,
        //             salePrices,
        //             updatedAt: new Date(),
        //         },
        //         { where: { productid, userbyid }, transaction: t }
        //     );

        //     // ✅ ดึงข้อมูลที่อัปเดตล่าสุด
        //     result = await CartOrder.findOne({
        //         where: { productid, userbyid }, transaction: t,
        //     });
        // } else {
            const salePrices = toNumber(req.body.salePrices);
            const promotionValues = await buildCartPromotionValues({
                productid: toNumber(productid),
                paidQuantity: Math.max(toNumber(req.body.quantity, 1), 1),
                salePrices,
                transaction: t,
            });

            // ✅ สร้างสินค้าใหม่ใน cart
          const  result = await CartOrder.create(
                {
                    ...req.body,
                    ...promotionValues,
                    salePrices,
                },
                { transaction: t }
            );
        // }
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
    const t = await CartOrder.sequelize?.transaction();
    try {
        const cart_uuid = decodeParamId(req.params.id);
        const cartorder = await CartOrder.findByPk(cart_uuid, { transaction: t });
        if (!cartorder) {
            await t?.rollback();
            res.status(404).json({ message: "Cart order not found" });
            return;
        }

        const promotionValues = await buildCartPromotionValues({
            productid: cartorder.productid,
            paidQuantity: getPaidQuantity(cartorder) + 1,
            salePrices: cartorder.salePrices,
            transaction: t,
        });

        await cartorder.update(
            {
                quantity: promotionValues.quantity,
                promotion: promotionValues.promotion,
                discount: promotionValues.discount,
                updatedAt: new Date(),
            },
            { transaction: t }
        );
        const updated = await CartOrder.findByPk(cart_uuid, { transaction: t });
        await t?.commit();

        // Return the updated cart order object in the response
        res.status(200).json({ message: "Update success", data: updated });
    } catch (error) {
        await t?.rollback();
        console.error("Error updating cart:", error);
        res.status(500).json({ message: "Error updating cart" });
    }
};

// update cartorder Delete quantity
export const updateCartMinus = async (
    req: Request<{ id: string }, any>,
    res: Response
): Promise<void> => {
    const t = await CartOrder.sequelize?.transaction();
    try {
        const id = decodeParamId(req.params.id);
        // Check if cartorder exists
        const cartorder = await CartOrder.findByPk(id, { transaction: t });
        if (!cartorder) {
            await t?.rollback();
            res.status(404).json({ message: "cartorder not found" });
            return;
        }

        const promotionValues = await buildCartPromotionValues({
            productid: cartorder.productid,
            paidQuantity: Math.max(getPaidQuantity(cartorder) - 1, 1),
            salePrices: cartorder.salePrices,
            transaction: t,
        });

        await cartorder.update(
            {
                quantity: promotionValues.quantity,
                promotion: promotionValues.promotion,
                discount: promotionValues.discount,
                updatedAt: new Date(),
            },
            { transaction: t }
        );
        const updated = await CartOrder.findByPk(id, { transaction: t });
        await t?.commit();

        res.status(200).json({ message: "update success", data: updated });

    } catch (error) {
        await t?.rollback();
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
                        "barcode",
                        "sku",
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
                        {
                            model: Wholesale,
                            as: "price",
                        }
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
// ========= update price ===========
export const updatePriceOrder = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const id = req.params.id;

        const { salePrices } = req.body;
        const cartorder = await CartOrder.findByPk(id);
        if (!cartorder) {
            res.status(404).json({ message: "Updated cart order not found" });
            return;
        }

        const newSalePrices = toNumber(salePrices);
        const promotionValues = await buildCartPromotionValues({
            productid: cartorder.productid,
            paidQuantity: getPaidQuantity(cartorder),
            salePrices: newSalePrices,
        });

        await cartorder.update({
            salePrices: newSalePrices,
            ...promotionValues,
            updatedAt: new Date(),
        });

        res.status(200).json({ message: "Update success", data: cartorder });
    } catch (error) {
        console.error("Error updating cart:", error);
        res.status(500).json({ message: "Error updating cart" });
    }
}


export const addOrderBarcode = async (req: Request, res: Response) => {
  const t = await CartOrder.sequelize!.transaction();

  try {
    const new_uuid = await maxid(CartOrder, "cart_uuid");
    req.body.cart_uuid = new_uuid;

    const { shopsid, userbyid, barcode, quantity = 1 } = req.body as any;

    if (!barcode || !userbyid || !shopsid) {
      await t.rollback();
      return res.status(400).json({ error: "Missing barcode, userbyid or shopsid" });
    }

    // ✅ Scan barcode only
    const pos = await Products.findOne({
      where: {
        status: 1,
        shopid: shopsid,
        barcode
      },
      transaction: t
    });

    if (!pos) {
      await t.rollback();
      return res.status(404).json({ error: "Product not found" });
    }

    const productid = toNumber(pos.dataValues.product_uuid);
    const salePrices = toNumber(pos.dataValues.sellPrices);
    // ✅ Check existing cart item
    const existingOrder = await CartOrder.findOne({
      where: { productid, userbyid },
      transaction: t
    });

    let result;

    if (existingOrder) {
      const paidQuantity = getPaidQuantity(existingOrder) + Math.max(toNumber(quantity, 1), 1);
      const promotionValues = await buildCartPromotionValues({
        productid: existingOrder.productid,
        paidQuantity,
        salePrices,
        transaction: t,
      });

      await CartOrder.update(
        {
          ...promotionValues,
          salePrices,
          updatedAt: new Date(),
        },
        {
          where: { productid, userbyid },
          transaction: t
        }
      );

      result = await CartOrder.findOne({
        where: { productid, userbyid },
        transaction: t
      });
    } else {
      const promotionValues = await buildCartPromotionValues({
        productid,
        paidQuantity: Math.max(toNumber(quantity, 1), 1),
        salePrices,
        transaction: t,
      });

      result = await CartOrder.create(
        {
          cart_uuid: new_uuid,
          productid,
          ...promotionValues,
          salePrices,
          userbyid,
        },
        { transaction: t }
      );
    }

    await t.commit();

    return res.status(200).json({
      message: "Order saved successfully",
      data: result
    });
  } catch (error: any) {
    await t.rollback();
    console.error("Error adding order:", error);

    return res.status(500).json({
      error: "Failed to add order",
      detail: error.message || "Unknown error"
    });
  }
};
