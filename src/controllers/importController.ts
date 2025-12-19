import { Request, Response } from "express";
import { sequelize } from "../config/database";
import { Sequelize, Op, fn, col, literal } from 'sequelize';
import { maxid, url } from "../utils";
import Imported from "../models/Imported";
import Products from "../models/Products";
import Units from "../models/Units";
import Sizes from "../models/Sizes";
import CartImport from "../models/CartImport";
import moment from "moment";
import Brands from "../models/Brands";
import Users from "../models/Users";
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
        let importId = await maxid(Imported, "import_uuid");
        for (const item of product) {
            item.import_uuid = importId++;
            await Imported.create(item, { transaction: t });
        }
        for (const item of product) {
            // find product
            const prod = await Products.findByPk(item.productid, { transaction: t });
            if (prod) {
                prod.quantity = (prod.quantity || 0) + item.quantity;
                await prod.save({ transaction: t });
            }
            // delete cart
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