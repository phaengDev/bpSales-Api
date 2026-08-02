"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchBillPurchase = exports.getPurchaseBymain = exports.getPurchaseById = exports.getPurchase = exports.createPurchase = void 0;
const sequelize_1 = require("sequelize");
const utils_1 = require("../utils");
const moment_1 = __importDefault(require("moment"));
const Purchase_1 = __importDefault(require("../models/Purchase"));
const PurchaseList_1 = __importDefault(require("../models/PurchaseList"));
const Suppliers_1 = __importDefault(require("../models/Suppliers"));
const Products_1 = __importDefault(require("../models/Products"));
const Units_1 = __importDefault(require("../models/Units"));
const Sizes_1 = __importDefault(require("../models/Sizes"));
const Brands_1 = __importDefault(require("../models/Brands"));
const Shops_1 = __importDefault(require("../models/Shops"));
const days = (0, moment_1.default)().format("YYMMDD").toString();
const createPurchase = async (req, res) => {
    const t = await Purchase_1.default.sequelize?.transaction();
    try {
        const { itemproduct } = req.body;
        // Generate IDs
        const new_uuid = await (0, utils_1.maxid)(Purchase_1.default, "_uuid");
        req.body._uuid = new_uuid;
        const newNo = await (0, utils_1.billno)(Purchase_1.default, "billno", `${days}0`, "createdAt");
        req.body.billno = newNo;
        // Create purchase
        const purchase = await Purchase_1.default.create(req.body, { transaction: t });
        if (!purchase) {
            await t?.rollback();
            return res.status(400).json({ error: "Failed to create purchase" });
        }
        // Insert product list
        for (const item of itemproduct) {
            const uuid = await (0, utils_1.maxid)(PurchaseList_1.default, "_uuid");
            const result = await PurchaseList_1.default.create({
                _uuid: uuid,
                purchaseid: new_uuid,
                productid: item.productid,
                prices_order: item.prices_order,
                prices_import: item.prices_order,
                vat: 0,
                discount: item.discount,
                qty_order: item.qty_order,
                qty_import: 0,
                balance_total: item.balance_total,
                import: 1,
                status: 1,
            }, { transaction: t });
            if (!result) {
                await t?.rollback();
                return res.status(500).json({ error: "Failed to create PurchaseList" });
            }
        }
        // Commit
        await t?.commit();
        return res.status(200).json({
            message: "Purchase created successfully",
            data: purchase,
        });
    }
    catch (error) {
        await t?.rollback();
        return res.status(500).json({ error: "Failed to create purchase", details: error });
    }
};
exports.createPurchase = createPurchase;
const getPurchase = async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
        const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
        const orderBy = req.query.orderBy || "_uuid";
        const order = (req.query.order || "ASC").toUpperCase();
        const { startDate, endDate, supplierid, imports, shopid } = req.body;
        const whereConditions = {
            shopid: shopid,
            status: 1,
            createdAt: {
                [sequelize_1.Op.between]: [startDate, endDate]
            }
        };
        if (supplierid) {
            whereConditions.supplierid = supplierid;
        }
        if (imports) {
            whereConditions.imports = imports;
        }
        const { rows, count } = await Purchase_1.default.findAndCountAll({
            where: whereConditions,
            limit,
            offset: skip,
            order: [[orderBy, order]],
            include: [
                {
                    model: Suppliers_1.default,
                    as: "supplier",
                },
                {
                    model: Shops_1.default,
                    as: "shop",
                }
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
        res.status(500).json({ error: "Failed to fetch purchase" });
    }
};
exports.getPurchase = getPurchase;
const getPurchaseById = async (req, res) => {
    try {
        const uuid = req.params.id;
        const purchase = await Purchase_1.default.findByPk(uuid, {
            include: [
                {
                    model: Suppliers_1.default,
                    as: "supplier",
                },
                {
                    model: PurchaseList_1.default,
                    as: "list",
                }
            ]
        });
        if (!purchase) {
            return res.status(404).json({ error: "Purchase not found" });
        }
        res.status(200).json({ data: purchase });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch purchase" });
    }
};
exports.getPurchaseById = getPurchaseById;
const getPurchaseBymain = async (req, res) => {
    try {
        const uuid = req.params.id;
        const purchase = await PurchaseList_1.default.findAll({
            where: { purchaseid: uuid },
            include: [
                {
                    model: Products_1.default,
                    as: "product",
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
            ]
        });
        if (!purchase) {
            return res.status(404).json({ error: "Purchase not found" });
        }
        res.status(200).json({ data: purchase });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch purchase" });
    }
};
exports.getPurchaseBymain = getPurchaseBymain;
const searchBillPurchase = async (req, res) => {
    try {
        const { buillNumber, shopid } = req.body;
        const purchase = await Purchase_1.default.findOne({
            where: { shopid: shopid, billno: buillNumber },
            include: [
                {
                    model: Suppliers_1.default,
                    as: "supplier",
                    attributes: {
                        include: [
                            [(0, sequelize_1.fn)("CONCAT", (0, sequelize_1.literal)(`'${(0, utils_1.url)()}/logo/'`), (0, sequelize_1.col)("logos")), "url"],
                        ],
                    },
                },
                {
                    model: PurchaseList_1.default,
                    as: "list",
                    include: [
                        {
                            model: Products_1.default,
                            as: "product",
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
                    ]
                }
            ]
        });
        if (!purchase) {
            return res.status(404).json({ error: "Purchase not found" });
        }
        res.status(200).json({ data: purchase });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch purchase" });
    }
};
exports.searchBillPurchase = searchBillPurchase;
