"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImportAll = exports.updateCartImport = exports.importbyPurchase = exports.createImport = void 0;
const database_1 = require("../config/database");
const sequelize_1 = require("sequelize");
const utils_1 = require("../utils");
const Imported_1 = __importDefault(require("../models/Imported"));
const Products_1 = __importDefault(require("../models/Products"));
const Units_1 = __importDefault(require("../models/Units"));
const Sizes_1 = __importDefault(require("../models/Sizes"));
const CartImport_1 = __importDefault(require("../models/CartImport"));
const moment_1 = __importDefault(require("moment"));
const Brands_1 = __importDefault(require("../models/Brands"));
const Users_1 = __importDefault(require("../models/Users"));
const Purchase_1 = __importDefault(require("../models/Purchase"));
const PurchaseList_1 = __importDefault(require("../models/PurchaseList"));
const createImport = async (req, res) => {
    const t = await database_1.sequelize.transaction(); // ⭐ ใช้ instance ตรงนี้
    try {
        const { product } = req.body;
        let importId = await (0, utils_1.maxids)(Imported_1.default, "import_uuid", t);
        for (const item of product) {
            await Imported_1.default.create({
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
            const prod = await Products_1.default.findByPk(item.productid, { transaction: t });
            if (prod) {
                prod.quantity = (prod.quantity || 0) + item.quantity;
                await prod.save({ transaction: t });
            }
            await CartImport_1.default.destroy({
                where: { _uuid: item._uuid },
                transaction: t
            });
        }
        await t.commit();
        res.status(200).json({
            message: "Product imported successfully",
            data: product
        });
    }
    catch (error) {
        console.error(error);
        await t.rollback();
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.createImport = createImport;
const importbyPurchase = async (req, res) => {
    const t = await database_1.sequelize.transaction(); // ⭐ ใช้ instance ตรงนี้
    try {
        const _uuid = req.params.id;
        const { product } = req.body;
        const import_uuid = await (0, utils_1.maxids)(Imported_1.default, "import_uuid", t);
        for (const item of product) {
            await Imported_1.default.create({
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
            const prod = await Products_1.default.findByPk(item.productid, { transaction: t });
            if (prod) {
                prod.quantity = (prod.quantity || 0) + item.quantity;
                await prod.save({ transaction: t });
            }
            const purchList = await PurchaseList_1.default.findByPk(item._uuid, { transaction: t });
            if (purchList) {
                purchList.qty_import = item.quantity;
                await purchList.save({ transaction: t });
            }
            await CartImport_1.default.destroy({
                where: { _uuid: item._uuid },
                transaction: t
            });
        }
        await Purchase_1.default.update({
            imports: 2,
            updatedAt: new Date()
        }, {
            where: {
                _uuid: _uuid
            }
        });
        await t.commit();
        res.status(200).json({
            message: "Product imported successfully",
            data: product
        });
    }
    catch (error) {
        console.error(error);
        await t.rollback();
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.importbyPurchase = importbyPurchase;
const updateCartImport = async (req, res) => {
    const t = await database_1.sequelize.transaction();
    try {
        const { import_uuid } = req.params;
        const { qty_order, sell_price, buy_price, discount } = req.body;
        const imported = await Imported_1.default.findByPk(import_uuid, { transaction: t });
        if (!imported) {
            await t.rollback();
            return res.status(404).json({ error: "Import record not found" });
        }
        const oldQty = imported.quantity || 0;
        const newQty = qty_order ?? oldQty;
        const diff = newQty - oldQty;
        if (sell_price !== undefined)
            imported.sell_price = sell_price;
        if (buy_price !== undefined)
            imported.buy_price = buy_price;
        if (discount !== undefined)
            imported.discount = discount;
        imported.quantity = newQty;
        await imported.save({ transaction: t });
        if (diff !== 0 && imported.productid) {
            const prod = await Products_1.default.findByPk(imported.productid, { transaction: t });
            if (prod) {
                prod.quantity = (prod.quantity || 0) + diff;
                await prod.save({ transaction: t });
            }
        }
        await t.commit();
        res.status(200).json({ message: "Import updated successfully", data: imported });
    }
    catch (error) {
        console.error(error);
        await t.rollback();
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.updateCartImport = updateCartImport;
const getImportAll = async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 25;
        const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
        const orderBy = req.query.orderBy || "import_uuid";
        const order = (req.query.order || "ASC").toUpperCase();
        const { startDate, endDate, shopid, types, categorieid, brandid } = req.body;
        // ⭐ Fix date range
        const start_date = (0, moment_1.default)(startDate).startOf("day").toDate();
        const end_date = (0, moment_1.default)(endDate).endOf("day").toDate();
        const whereConditions = {
            status: 1,
            createdAt: {
                [sequelize_1.Op.between]: [start_date, end_date]
            }
        };
        if (types) {
            whereConditions.types = types;
        }
        if (categorieid) {
            whereConditions["$product.brand.categorieid$"] = categorieid;
        }
        if (brandid) {
            whereConditions["$product.brandid$"] = brandid;
        }
        const { rows, count } = await Imported_1.default.findAndCountAll({
            where: whereConditions,
            limit,
            offset: skip,
            order: [[orderBy, order]],
            include: [
                {
                    model: Products_1.default,
                    as: "product",
                    where: {
                        shopid: shopid
                    },
                    required: true,
                    include: [
                        {
                            model: Brands_1.default,
                            as: "brand"
                        },
                        {
                            model: Units_1.default,
                            as: "unit"
                        },
                        {
                            model: Sizes_1.default,
                            as: "size"
                        }
                    ]
                },
                {
                    model: Users_1.default,
                    as: "user"
                }
            ]
        });
        res.status(200).json({
            data: rows,
            total: count,
            limit,
            skip,
            orderBy,
            order
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.getImportAll = getImportAll;
