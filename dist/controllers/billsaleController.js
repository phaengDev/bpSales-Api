"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getsaleListbybill = exports.getSalebyid = exports.fetchSaleDaily = exports.createBillsale = void 0;
const sequelize_1 = require("sequelize");
const utils_1 = require("../utils");
const Billsales_1 = __importDefault(require("../models/Billsales"));
const BillsaleList_1 = __importDefault(require("../models/BillsaleList"));
const Transportation_1 = __importDefault(require("../models/Transportation"));
const Company_1 = __importDefault(require("../models/Company"));
const Provinces_1 = __importDefault(require("../models/Provinces"));
const moment_1 = __importDefault(require("moment"));
const CartOrder_1 = __importDefault(require("../models/CartOrder"));
const Products_1 = __importDefault(require("../models/Products"));
const Country_1 = __importDefault(require("../models/Country"));
const Units_1 = __importDefault(require("../models/Units"));
const Shops_1 = __importDefault(require("../models/Shops"));
const Districts_1 = __importDefault(require("../models/Districts"));
const days = (0, moment_1.default)(new Date()).format("DD").toString();
const createBillsale = async (req, res) => {
    try {
        const { orderList } = req.body;
        const new_uuid = await (0, utils_1.maxid)(Billsales_1.default, "bill_uuid");
        const newCode = await (0, utils_1.maxCode)(Billsales_1.default, "billcode", "BIL");
        const newNo = await (0, utils_1.codeNo)(Billsales_1.default, "billno", `${days}0`);
        req.body.bill_uuid = new_uuid;
        req.body.billcode = newCode;
        req.body.billno = newNo;
        const billsale = await Billsales_1.default.create(req.body);
        if (billsale) {
            for (const item of orderList) {
                const _uuid = await (0, utils_1.maxid)(BillsaleList_1.default, "_uuid");
                const result = await BillsaleList_1.default.create({
                    _uuid: _uuid,
                    billsaleid: new_uuid,
                    productid: item.productid,
                    price_buy: item.price_buy,
                    price_sales: item.price_sales,
                    quantity: item.quantity,
                    status: 1,
                });
                if (!result) {
                    return res.status(500).json({ error: "Failed to create BillsaleList" });
                }
                if (item.stock === 1) {
                    await Products_1.default.update({ quantity: (0, sequelize_1.literal)(`quantity - ${item.quantity}`) }, { where: { product_uuid: item.productid } });
                }
                await CartOrder_1.default.destroy({ where: { cart_uuid: item.cart_uuid } });
            }
            if (!billsale)
                return res.status(404).json({ error: "Billsale not found" });
            res.status(200).json({ message: "Billsale created successfully", data: billsale });
        }
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create Billsale" });
    }
};
exports.createBillsale = createBillsale;
const fetchSaleDaily = async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
        const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
        const orderBy = req.query.orderBy || "bill_uuid";
        const order = (req.query.order || "ASC").toUpperCase();
        const { start_date, end_date, shopid, typesale } = req.body;
        // ⭐ Fix date range
        const startDate = (0, moment_1.default)(start_date).startOf("day").toDate();
        const endDate = (0, moment_1.default)(end_date).endOf("day").toDate();
        const whereConditions = {
            shopid: shopid,
            createdAt: {
                [sequelize_1.Op.between]: [startDate, endDate]
            }
        };
        if (typesale) {
            whereConditions.typesale = typesale;
        }
        const { rows, count } = await Billsales_1.default.findAndCountAll({
            where: whereConditions,
            limit,
            offset: skip,
            order: [[orderBy, order]],
            include: [
                {
                    model: Country_1.default,
                    as: "country",
                    attributes: ["names", "abbr", "icons", "rate", "genus"],
                },
                {
                    model: Transportation_1.default,
                    as: "transport",
                    include: [
                        {
                            model: Provinces_1.default,
                            as: "province"
                        },
                        {
                            model: Company_1.default,
                            as: "company"
                        }
                    ]
                }
            ],
        });
        res.status(200).json({
            data: rows,
            total: count,
            limit,
            skip
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to fetch Billsales" });
    }
};
exports.fetchSaleDaily = fetchSaleDaily;
// ========= get sale bill by id
const getSalebyid = async (req, res) => {
    try {
        const billid = req.params.id;
        const result = await Billsales_1.default.findOne({
            where: { bill_uuid: billid },
            include: [
                {
                    model: BillsaleList_1.default,
                    as: "billList",
                    include: [
                        {
                            model: Products_1.default,
                            as: "product",
                            attributes: ["sku", "productName"],
                            include: [
                                {
                                    model: Units_1.default,
                                    as: "unit",
                                    attributes: ["unitName"],
                                },
                            ],
                        },
                    ]
                },
                {
                    model: Country_1.default,
                    as: "country",
                },
                {
                    model: Shops_1.default,
                    as: "shop",
                    include: [{
                            model: Districts_1.default,
                            as: "district",
                            include: [
                                {
                                    model: Provinces_1.default,
                                    as: "province"
                                }
                            ]
                        }]
                }
            ]
        });
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch Billsale" });
    }
};
exports.getSalebyid = getSalebyid;
// =============
const getsaleListbybill = async (req, res) => {
    try {
        const billid = req.params.id;
        const result = await BillsaleList_1.default.findAll({
            where: { billsaleid: billid },
            include: [
                {
                    model: Products_1.default,
                    as: "product",
                    attributes: ["sku", "productName"],
                    include: [
                        {
                            model: Units_1.default,
                            as: "unit",
                            attributes: ["unitName"],
                        },
                    ],
                },
            ]
        });
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch BillsaleList" });
    }
};
exports.getsaleListbybill = getsaleListbybill;
