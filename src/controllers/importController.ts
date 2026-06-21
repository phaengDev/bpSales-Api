import { Request, Response } from "express";
import { sequelize } from "../config/database";
import { Sequelize, Op, fn, col, literal } from 'sequelize';
import { maxids } from "../utils";
import Imported from "../models/Imported";
import Products from "../models/Products";
import Units from "../models/Units";
import Sizes from "../models/Sizes";
import CartImport from "../models/CartImport";
import moment from "moment";
import Brands from "../models/Brands";
import Users from "../models/Users";
import Purchase from "../models/Purchase";
import PurchaseList from "../models/PurchaseList";
interface QueryParams {
    limit?: string;
    skip?: string;
    orderBy?: string;
    order?: string;
}
export const createImport = async (req: Request, res: Response) => {
    const t = await sequelize.transaction();   // ⭐ ใช้ instance ตรงนี้
    try {
        const { product } = req.body;
        let importId = await maxids(Imported, "import_uuid", t);
        for (const item of product) {
            await Imported.create({
                import_uuid: importId++,
                productid: item.productid,
                sell_price_old: item.sell_price_old,
                sell_price: item.sell_price,
                buy_price_old: item.buy_price_old,
                buy_price: item.buy_price,
                quantity_old: item.quantity_old,
                quantity: item.quantity,
                discount: item.discount,
                types: item.types,
                createbyid: item.createbyid,
                createdAt: new Date(),
            }, { transaction: t });
        }
        for (const item of product) {
            const prod = await Products.findByPk(item.productid, { transaction: t });
            if (prod) {
                prod.quantity = (prod.quantity || 0) + item.quantity;
                await prod.save({ transaction: t });
            }
            await CartImport.destroy({
                where: { _uuid: item._uuid },
                transaction: t
            });
        }
        await t.commit();
        res.status(200).json({
            message: "Product imported successfully",
            data: product
        });

    } catch (error) {
        console.error(error);
        await t.rollback();
        res.status(500).json({ error: "Internal server error" });
    }
};

export const importbyPurchase = async (req: Request, res: Response) => {
    const t = await sequelize.transaction();   // ⭐ ใช้ instance ตรงนี้
    try {
        const _uuid = req.params.id;
        const { product } = req.body;
        const import_uuid = await maxids(Imported, "import_uuid", t);
        for (const item of product) {
            await Imported.create({
                import_uuid: import_uuid,
                productid: item.productid,
                sell_price_old: item.sell_price_old,
                sell_price: item.sell_price,
                buy_price_old: item.buy_price_old,
                buy_price: item.buy_price,
                quantity_old: item.quantity_old,
                quantity: item.quantity,
                discount: item.discount,
                types: item.types,
                createbyid: item.createbyid,
                createdAt: new Date(),
            }, { transaction: t });
        }
        for (const item of product) {
            const prod = await Products.findByPk(item.productid, { transaction: t });
            if (prod) {
                prod.quantity = (prod.quantity || 0) + item.quantity;
                await prod.save({ transaction: t });
            }
            const purchList = await PurchaseList.findByPk(item._uuid, { transaction: t });
            if (purchList) {
                purchList.qty_import =item.quantity;
                await purchList.save({ transaction: t });
            }
            await CartImport.destroy({
                where: { _uuid: item._uuid },
                transaction: t
            });
        }
        await Purchase.update({
            imports: 2,
            updatedAt: new Date()
        }, {
        where: {
            _uuid: _uuid
        }
        })
        await t.commit();
        res.status(200).json({
            message: "Product imported successfully",
            data: product
        });

    } catch (error) {
        console.error(error);
        await t.rollback();
        res.status(500).json({ error: "Internal server error" });
    }
};

export const updateCartImport = async (req: Request, res: Response) => {
    const t = await sequelize.transaction();
    try {
        const { import_uuid } = req.params;
        const { qty_order, sell_price, buy_price, discount } = req.body;

        const imported = await Imported.findByPk(import_uuid, { transaction: t });
        if (!imported) {
            await t.rollback();
            return res.status(404).json({ error: "Import record not found" });
        }

        const oldQty = imported.quantity || 0;
        const newQty = qty_order ?? oldQty;
        const diff = newQty - oldQty;

        if (sell_price !== undefined) imported.sell_price = sell_price;
        if (buy_price !== undefined) imported.buy_price = buy_price;
        if (discount !== undefined) imported.discount = discount;
        imported.quantity = newQty;
        await imported.save({ transaction: t });

        if (diff !== 0 && imported.productid) {
            const prod = await Products.findByPk(imported.productid, { transaction: t });
            if (prod) {
                prod.quantity = (prod.quantity || 0) + diff;
                await prod.save({ transaction: t });
            }
        }

        await t.commit();
        res.status(200).json({ message: "Import updated successfully", data: imported });
    } catch (error) {
        console.error(error);
        await t.rollback();
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getImportAll = async (req: Request<{}, {}, {}, QueryParams>, res: Response) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 25;
        const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
        const orderBy = req.query.orderBy || "import_uuid";
        const order = (req.query.order || "ASC").toUpperCase() as "ASC" | "DESC";

        const { startDate, endDate, shopid, types, categorieid, brandid } = req.body as any;
        // ⭐ Fix date range
        const start_date = moment(startDate).startOf("day").toDate();
        const end_date = moment(endDate).endOf("day").toDate();
        const whereConditions: any = {
            status: 1,
            createdAt: {
                [Op.between]: [start_date, end_date]
            }
        }
        if (types) {
            whereConditions.types = types;
        }
        if (categorieid) {
            whereConditions["$product.brand.categorieid$"] = categorieid;
        }
        if (brandid) {
            whereConditions["$product.brandid$"] = brandid;
        }
        const { rows, count } = await Imported.findAndCountAll({
            where: whereConditions,
            limit,
            offset: skip,
            order: [[orderBy, order]],
            include: [
                {
                    model: Products,
                    as: "product",
                    where: {
                        shopid: shopid
                    },
                    required: true,
                    include: [
                        {
                            model: Brands,
                            as: "brand"
                        },
                        {
                            model: Units,
                            as: "unit"
                        },
                        {
                            model: Sizes,
                            as: "size"
                        }
                    ]
                },
                {
                    model: Users,
                    as: "user"
                }
            ]
        });
        res.status(200).json(
            {
                data: rows,
                total: count,
                limit,
                skip,
                orderBy,
                order
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};