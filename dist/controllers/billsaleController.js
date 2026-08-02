"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchBillCancel = exports.searchBillSale = exports.fetchSaleList = exports.getsaleListbybill = exports.getSalebyid = exports.fetchSaleDaily = exports.cancleBillsale = exports.createOnline = exports.createBillsale = void 0;
const sequelize_1 = require("sequelize");
const utils_1 = require("../utils");
const Billsales_1 = __importDefault(require("../models/Billsales"));
const BillsaleList_1 = __importDefault(require("../models/BillsaleList"));
const Transportation_1 = __importDefault(require("../models/Transportation"));
const Company_1 = __importDefault(require("../models/Company"));
const Provinces_1 = __importDefault(require("../models/Provinces"));
const Brands_1 = __importDefault(require("../models/Brands"));
const Categories_1 = __importDefault(require("../models/Categories"));
const moment_1 = __importDefault(require("moment"));
const CartOrder_1 = __importDefault(require("../models/CartOrder"));
const Products_1 = __importDefault(require("../models/Products"));
const Exchanges_1 = __importDefault(require("../models/Exchanges"));
const Units_1 = __importDefault(require("../models/Units"));
const Shops_1 = __importDefault(require("../models/Shops"));
const Districts_1 = __importDefault(require("../models/Districts"));
const Sizes_1 = __importDefault(require("../models/Sizes"));
const Users_1 = __importDefault(require("../models/Users"));
const days = (0, moment_1.default)(new Date()).format("DD").toString();
const codes = (0, moment_1.default)(new Date()).format("YYMMDD").toString();
const toPlainObject = (value) => {
    if (!value)
        return value;
    return typeof value.toJSON === "function" ? value.toJSON() : value;
};
const formatTransportDetails = (transport) => {
    const item = toPlainObject(transport);
    if (!item)
        return item;
    const destinationBranchName = [
        item.province?.provinceName,
        item.branch_name,
    ].filter(Boolean).join(" - ");
    return {
        ...item,
        transport_company: item.company || null,
        transport_company_name: item.company?.names || null,
        destination_branch: {
            province: item.province || null,
            branch_name: item.branch_name || null,
        },
        destination_branch_name: destinationBranchName || null,
    };
};
const formatBillsaleTransport = (billsale) => {
    const item = toPlainObject(billsale);
    if (!item)
        return item;
    return {
        ...item,
        transport: formatTransportDetails(item.transport),
    };
};
const createBillsale = async (req, res) => {
    try {
        const { orderList } = req.body;
        const new_uuid = await (0, utils_1.maxid)(Billsales_1.default, "bill_uuid");
        const newCode = await (0, utils_1.maxCode)(Billsales_1.default, "billcode", codes);
        const newNo = await (0, utils_1.codeNo)(Billsales_1.default, "billno", `${days}-0`);
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
            res.status(200).json({ message: "Billsale created successfully", data: billsale, billid: new_uuid });
        }
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create Billsale" });
    }
};
exports.createBillsale = createBillsale;
const createOnline = async (req, res) => {
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
            const { companyid, shopid, title, fullnames, phone, provinceid, typepay, cod, balance, branch_name, } = req.body;
            const online_uuid = await (0, utils_1.maxid)(Transportation_1.default, "_uuid");
            const newNo = await (0, utils_1.codeNo)(Transportation_1.default, "codebill", `${codes}0`);
            const transportation = await Transportation_1.default.create({
                _uuid: online_uuid,
                shopid: shopid,
                codebill: newNo,
                billsaleid: new_uuid,
                companyid: companyid,
                title: title,
                fullnames: fullnames,
                phone: phone,
                provinceid: provinceid,
                branch_name: branch_name,
                cod: cod,
                balance: balance,
                status_pay: typepay,
            });
            if (!billsale)
                return res.status(404).json({ error: "Billsale not found" });
            res.status(200).json({
                message: "Billsale created successfully",
                data: billsale,
                billid: new_uuid,
                onlineid: online_uuid,
                transportation,
            });
        }
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create Billsale" });
    }
};
exports.createOnline = createOnline;
const cancleBillsale = async (req, res) => {
    try {
        const bill_uuid = atob(req.params.id);
        const { createby, description } = req.body;
        const billsale = await Billsales_1.default.update({
            status: 2,
            statusoff: 1,
            createby: createby,
            description: description,
            updatedAt: new Date()
        }, {
            where: { bill_uuid: bill_uuid }
        });
        if (!billsale)
            return res.status(404).json({ error: "Billsale not found" });
        await BillsaleList_1.default.update({
            status: 2,
            updatedAt: new Date()
        }, {
            where: { billsaleid: bill_uuid }
        });
        await Transportation_1.default.update({
            status: 2,
            updatedAt: new Date()
        }, {
            where: { billsaleid: bill_uuid }
        });
        res.status(200).json({ message: "Billsale cancle successfully", data: billsale });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to cancle Billsale" });
    }
};
exports.cancleBillsale = cancleBillsale;
const fetchSaleDaily = async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
        const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
        const orderBy = req.query.orderBy || "bill_uuid";
        const order = (req.query.order || "ASC").toUpperCase();
        const { start_date, end_date, shopid, typesale, userid, statusoff } = req.body;
        // ⭐ Fix date range
        const startDate = (0, moment_1.default)(start_date).startOf("day").toDate();
        const endDate = (0, moment_1.default)(end_date).endOf("day").toDate();
        const whereConditions = {
            status: 1,
            shopid: shopid,
            createdAt: {
                [sequelize_1.Op.between]: [startDate, endDate]
            }
        };
        if (typesale) {
            whereConditions.typesale = typesale;
        }
        if (userid) {
            whereConditions.createby = userid;
        }
        if (statusoff) {
            whereConditions.statusoff = statusoff;
        }
        const { rows, count } = await Billsales_1.default.findAndCountAll({
            where: whereConditions,
            limit,
            offset: skip,
            order: [[orderBy, order]],
            include: [
                {
                    model: Exchanges_1.default,
                    as: "exchange",
                    attributes: ["abbr", "icons", "rate", "genus"],
                },
                {
                    model: Users_1.default,
                    as: "user",
                    attributes: ["userName", "phones"],
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
        const summaryResult = await Billsales_1.default.findOne({
            where: whereConditions,
            attributes: [
                [(0, sequelize_1.fn)("SUM", (0, sequelize_1.col)("balanceSale")), "balanceSale"],
                [(0, sequelize_1.fn)("SUM", (0, sequelize_1.col)("balanceTotal")), "balanceTotal"],
                [(0, sequelize_1.fn)("SUM", (0, sequelize_1.col)("taxBalance")), "taxBalance"],
                [(0, sequelize_1.fn)("SUM", (0, sequelize_1.col)("discount")), "discount"],
                [(0, sequelize_1.fn)("SUM", (0, sequelize_1.col)("balance_payable")), "balance_payable"],
                [(0, sequelize_1.fn)("SUM", (0, sequelize_1.col)("getCash")), "getCash"],
                [(0, sequelize_1.fn)("SUM", (0, sequelize_1.col)("getTransfer")), "getTransfer"],
                [(0, sequelize_1.fn)("SUM", (0, sequelize_1.col)("balance_pays")), "balance_pays"],
                [(0, sequelize_1.fn)("SUM", (0, sequelize_1.col)("refund")), "refund"],
            ],
            raw: true,
        });
        const toNumber = (value) => Number(value || 0);
        const summary = {
            bill_count: count,
            balanceSale: toNumber(summaryResult?.balanceSale),
            balanceTotal: toNumber(summaryResult?.balanceTotal),
            taxBalance: toNumber(summaryResult?.taxBalance),
            discount: toNumber(summaryResult?.discount),
            balance_payable: toNumber(summaryResult?.balance_payable),
            getCash: toNumber(summaryResult?.getCash),
            getTransfer: toNumber(summaryResult?.getTransfer),
            balance_pays: toNumber(summaryResult?.balance_pays),
            refund: toNumber(summaryResult?.refund),
        };
        const data = rows.map(formatBillsaleTransport);
        res.status(200).json({
            data,
            total: count,
            summary,
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
                    model: Exchanges_1.default,
                    as: "exchange",
                },
                {
                    model: Users_1.default,
                    as: "user",
                    attributes: ["userName", "phones"],
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
            ]
        });
        res.status(200).json(formatBillsaleTransport(result));
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
// ============= fetch sale list ============
const fetchSaleList = async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
        const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
        const orderBy = req.query.orderBy || "_uuid";
        const order = (req.query.order || "ASC").toUpperCase();
        const { startDate, endDate, shopid, cartgoryid, uniteid, sizeid } = req.body;
        // ✅ Fix date range properly
        const start_date = (0, moment_1.default)(startDate).format("YYYY-MM-DD");
        const end_date = (0, moment_1.default)(endDate).format("YYYY-MM-DD");
        // ✅ Base conditions
        const whereConditions = {
            status: 1,
            [sequelize_1.Op.and]: [
                (0, sequelize_1.where)((0, sequelize_1.fn)('DATE', (0, sequelize_1.col)('BillsaleList.createdAt')), {
                    [sequelize_1.Op.between]: [start_date, end_date],
                }),
            ],
        };
        // ✅ Filters with include path syntax
        if (shopid)
            whereConditions["$product.shopid$"] = shopid;
        if (cartgoryid)
            whereConditions["$product.brand.categorieid$"] = cartgoryid;
        if (uniteid)
            whereConditions["$product.uniteid$"] = uniteid;
        if (sizeid)
            whereConditions["$product.sizeid$"] = sizeid;
        // ✅ Query data
        const { rows, count } = await BillsaleList_1.default.findAndCountAll({
            where: whereConditions,
            limit,
            offset: skip,
            order: [[orderBy, order]],
            include: [
                {
                    model: Products_1.default,
                    as: "product",
                    attributes: ["product_uuid", "sku", "barcode", "images", "productName"],
                    include: [
                        {
                            model: Units_1.default,
                            as: "unit",
                            attributes: ["unit_uuid", "unitName"],
                        },
                        {
                            model: Sizes_1.default,
                            as: "size",
                            attributes: ["size_uuid", "sizeName"],
                        },
                        {
                            model: Brands_1.default,
                            as: "brand",
                            attributes: ["brand_uuid", "brandName"],
                            include: [
                                {
                                    model: Categories_1.default,
                                    as: "category",
                                    attributes: ["cate_uuid", "cateName"],
                                },
                            ],
                        },
                    ],
                },
            ],
        });
        // ✅ Send response
        res.status(200).json({
            data: rows,
            total: count,
            limit,
            skip,
        });
    }
    catch (error) {
        console.error("❌ Fetch error:", error);
        res.status(500).json({ error: "Failed to fetch BillsaleList" });
    }
};
exports.fetchSaleList = fetchSaleList;
const searchBillSale = async (req, res) => {
    try {
        const { shopid, billSale } = req.body;
        const result = await Billsales_1.default.findOne({
            where: { billcode: billSale, shopid: shopid },
            include: [
                {
                    model: Users_1.default,
                    as: "user",
                    attributes: ["userName", "phones"],
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
                },
                {
                    model: BillsaleList_1.default,
                    as: "billList",
                    include: [
                        {
                            model: Products_1.default,
                            as: "product",
                            attributes: ["product_uuid", "sku", "barcode", "images", "productName"],
                            include: [
                                {
                                    model: Units_1.default,
                                    as: "unit",
                                    attributes: ["unit_uuid", "unitName"],
                                },
                                {
                                    model: Sizes_1.default,
                                    as: "size",
                                    attributes: ["size_uuid", "sizeName"],
                                },
                                {
                                    model: Brands_1.default,
                                    as: "brand",
                                    attributes: ["brand_uuid", "brandName"],
                                },
                            ],
                        },
                    ],
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
                },
            ]
        });
        if (!result) {
            return res.status(404).json({ error: "BillSale not found" });
        }
        res.status(200).json({ data: formatBillsaleTransport(result) });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch Billsale" });
    }
};
exports.searchBillSale = searchBillSale;
// ======= get bill cancle ========
const fetchBillCancel = async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
        const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
        const orderBy = req.query.orderBy || "bill_uuid";
        const order = (req.query.order || "ASC").toUpperCase();
        const { start_date, end_date, shopid, typesale, userid } = req.body;
        // ⭐ Fix date range
        const startDate = (0, moment_1.default)(start_date).startOf("day").toDate();
        const endDate = (0, moment_1.default)(end_date).endOf("day").toDate();
        const whereConditions = {
            status: 2,
            shopid: shopid,
            updatedAt: {
                [sequelize_1.Op.between]: [startDate, endDate]
            }
        };
        if (typesale) {
            whereConditions.typesale = typesale;
        }
        if (userid) {
            whereConditions.createby = userid;
        }
        const { rows, count } = await Billsales_1.default.findAndCountAll({
            where: whereConditions,
            limit,
            offset: skip,
            order: [[orderBy, order]],
            include: [
                {
                    model: Exchanges_1.default,
                    as: "exchange",
                    attributes: ["abbr", "icons", "rate", "genus"],
                },
                {
                    model: Users_1.default,
                    as: "user",
                    attributes: ["userName", "phones"],
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
        const data = rows.map(formatBillsaleTransport);
        res.status(200).json({
            data,
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
exports.fetchBillCancel = fetchBillCancel;
