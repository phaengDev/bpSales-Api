import { Request, Response } from "express";
import { Op, fn, col, literal, Sequelize, where } from "sequelize";
import { maxid, maxCode, codeNo } from "../utils";
import Billsales from "../models/Billsales";
import BillsaleList from "../models/BillsaleList";
import Transportation from "../models/Transportation";
import Company from "../models/Company";
import Provinces from "../models/Provinces";
import Brands from "../models/Brands";
import Categories from "../models/Categories";
import moment from "moment";
import CartOrder from "../models/CartOrder";
import Products from "../models/Products";
import Country from "../models/Country";
import Units from "../models/Units";
import Shops from "../models/Shops";
import District from "../models/Districts";
import Sizes from "../models/Sizes";
import Users from "../models/Users";

interface QueryParams {
    limit?: string;
    skip?: string;
    orderBy?: string;
    order?: string;
}
const days = moment(new Date()).format("DD").toString();
const codes = moment(new Date()).format("YYMMDD").toString();

const toPlainObject = (value: any) => {
    if (!value) return value;
    return typeof value.toJSON === "function" ? value.toJSON() : value;
};

const formatTransportDetails = (transport: any) => {
    const item = toPlainObject(transport);
    if (!item) return item;

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

const formatBillsaleTransport = (billsale: any) => {
    const item = toPlainObject(billsale);
    if (!item) return item;

    return {
        ...item,
        transport: formatTransportDetails(item.transport),
    };
};

export const createBillsale = async (req: Request, res: Response) => {
    try {
        const { orderList } = req.body as any;
        const new_uuid = await maxid(Billsales, "bill_uuid");
        const newCode = await maxCode(Billsales, "billcode", codes);
        const newNo = await codeNo(Billsales, "billno", `${days}-0`);
        req.body.bill_uuid = new_uuid;
        req.body.billcode = newCode;
        req.body.billno = newNo;

        const billsale = await Billsales.create(req.body);
        if (billsale) {
            for (const item of orderList) {
                const _uuid = await maxid(BillsaleList, "_uuid");
                const result = await BillsaleList.create({
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
                    await Products.update(
                        { quantity: literal(`quantity - ${item.quantity}`) },
                        { where: { product_uuid: item.productid } }
                    )
                }
                await CartOrder.destroy({ where: { cart_uuid: item.cart_uuid } });
            }
            if (!billsale) return res.status(404).json({ error: "Billsale not found" });
            res.status(200).json({ message: "Billsale created successfully", data: billsale, billid: new_uuid });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to create Billsale" });
    }
};

export const createOnline = async (req: Request, res: Response) => {
    try {
        const { orderList } = req.body as any;
        const new_uuid = await maxid(Billsales, "bill_uuid");
        const newCode = await maxCode(Billsales, "billcode", "BIL");
        const newNo = await codeNo(Billsales, "billno", `${days}0`);
        req.body.bill_uuid = new_uuid;
        req.body.billcode = newCode;
        req.body.billno = newNo;

        const billsale = await Billsales.create(req.body);
        if (billsale) {
            for (const item of orderList) {
                const _uuid = await maxid(BillsaleList, "_uuid");
                const result = await BillsaleList.create({
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
                    await Products.update(
                        { quantity: literal(`quantity - ${item.quantity}`) },
                        { where: { product_uuid: item.productid } }
                    )
                }
                await CartOrder.destroy({ where: { cart_uuid: item.cart_uuid } });
            }

            const {
                companyid,
                shopid,
                title,
                fullnames,
                phone,
                provinceid,
                typepay,
                cod,
                balance,
                branch_name,
            } = req.body;
            const online_uuid = await maxid(Transportation, "_uuid");
            const newNo = await codeNo(Transportation, "codebill", `${codes}0`);
            const transportation = await Transportation.create(
                {
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
                }
            );

            if (!billsale) return res.status(404).json({ error: "Billsale not found" });
            res.status(200).json({
                message: "Billsale created successfully",
                data: billsale,
                billid: new_uuid,
                onlineid: online_uuid,
                transportation,
            });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to create Billsale" });
    }
};

export const cancleBillsale = async (req: Request<{ id: string }, {}, {}, {}, QueryParams>,
    res: Response
) => {
    try {
        const bill_uuid = atob(req.params.id);
           const {createby,description} = req.body as any;
        const billsale = await Billsales.update({
            status: 2,
            statusoff: 1,
            createby:createby,
            description:description,
            updatedAt: new Date()
        },
            {
                where:
                    { bill_uuid: bill_uuid }
            });
        if (!billsale) return res.status(404).json({ error: "Billsale not found" });
        await BillsaleList.update({
            status: 2,
            updatedAt: new Date()
        },
            {
                where:
                    { billsaleid: bill_uuid }
            });

            await Transportation.update({
                status: 2,
                updatedAt: new Date()
            },{
                    where:{ billsaleid: bill_uuid }   
            });

        res.status(200).json({ message: "Billsale cancle successfully", data: billsale });
    } catch (error) {
        res.status(500).json({ error: "Failed to cancle Billsale" });
    }
}

export const fetchSaleDaily = async (
    req: Request<{}, {}, {}, QueryParams>,
    res: Response
) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
        const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
        const orderBy = req.query.orderBy || "bill_uuid";
        const order = (req.query.order || "ASC").toUpperCase() as "ASC" | "DESC";

        const { start_date, end_date, shopid, typesale, userid, statusoff } = req.body as any;

        // ⭐ Fix date range
        const startDate = moment(start_date).startOf("day").toDate();
        const endDate = moment(end_date).endOf("day").toDate();

        const whereConditions: any = {
            status: 1,
            shopid: shopid,
            createdAt: {
                [Op.between]: [startDate, endDate]
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

        const { rows, count } = await Billsales.findAndCountAll({
            where: whereConditions,
            limit,
            offset: skip,
            order: [[orderBy, order]],
            include: [
                {
                    model: Country,
                    as: "country",
                    attributes: ["names", "abbr", "icons", "rate", "genus"],
                },
                {
                    model: Users,
                    as: "user",
                    attributes: ["userName", "phones"],
                },
                {
                    model: Transportation,
                    as: "transport",
                    include: [
                        {
                            model: Provinces,
                            as: "province"
                        },
                        {
                            model: Company,
                            as: "company"
                        }
                    ]
                }
            ],
        });

        const summaryResult = await Billsales.findOne({
            where: whereConditions,
            attributes: [
                [fn("SUM", col("balanceSale")), "balanceSale"],
                [fn("SUM", col("balanceTotal")), "balanceTotal"],
                [fn("SUM", col("taxBalance")), "taxBalance"],
                [fn("SUM", col("discount")), "discount"],
                [fn("SUM", col("balance_payable")), "balance_payable"],
                [fn("SUM", col("getCash")), "getCash"],
                [fn("SUM", col("getTransfer")), "getTransfer"],
                [fn("SUM", col("balance_pays")), "balance_pays"],
                [fn("SUM", col("refund")), "refund"],
            ],
            raw: true,
        }) as unknown as Record<string, unknown> | null;

        const toNumber = (value: unknown) => Number(value || 0);
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

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to fetch Billsales" });
    }
};
// ========= get sale bill by id
export const getSalebyid = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const billid = req.params.id;
        const result = await Billsales.findOne({
            where: { bill_uuid: billid },
            include: [
                {
                    model: BillsaleList,
                    as: "billList",
                    include: [
                        {
                            model: Products,
                            as: "product",
                            attributes: ["sku", "productName"],
                            include: [
                                {
                                    model: Units,
                                    as: "unit",
                                    attributes: ["unitName"],
                                },
                            ],
                        },
                    ]
                },
                {
                    model: Country,
                    as: "country",
                },
                {
                    model: Users,
                    as: "user",
                    attributes: ["userName", "phones"],
                },
                {
                    model: Shops,
                    as: "shop",
                    include: [{
                        model: District,
                        as: "district",
                        include: [
                            {
                                model: Provinces,
                                as: "province"
                            }
                        ]
                    }]
                },
                {
                    model: Transportation,
                    as: "transport",
                    include: [
                        {
                            model: Provinces,
                            as: "province"
                        },
                        {
                            model: Company,
                            as: "company"
                        }
                    ]
                }
            ]
        });
        res.status(200).json(formatBillsaleTransport(result));
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch Billsale" });
    }
}

// =============
export const getsaleListbybill = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const billid = req.params.id;
        const result = await BillsaleList.findAll({
            where: { billsaleid: billid },
            include: [
                {
                    model: Products,
                    as: "product",
                    attributes: ["sku", "productName"],
                    include: [
                        {
                            model: Units,
                            as: "unit",
                            attributes: ["unitName"],
                        },
                    ],
                },
            ]
        });
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch BillsaleList" });
    }
}

// ============= fetch sale list ============
export const fetchSaleList = async (
    req: Request<{}, {}, {}, QueryParams>,
    res: Response
) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
        const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
        const orderBy = req.query.orderBy || "_uuid";
        const order = (req.query.order || "ASC").toUpperCase() as "ASC" | "DESC";
        const { startDate, endDate, shopid, cartgoryid, uniteid, sizeid } = req.body as any;

        // ✅ Fix date range properly
        const start_date = moment(startDate).format("YYYY-MM-DD");
        const end_date = moment(endDate).format("YYYY-MM-DD");

        // ✅ Base conditions
        const whereConditions: any = {
            status: 1,
            [Op.and]: [
                where(fn('DATE', col('BillsaleList.createdAt')), {
                    [Op.between]: [start_date, end_date],
                }),
            ],
        };


        // ✅ Filters with include path syntax
        if (shopid) whereConditions["$product.shopid$"] = shopid;
        if (cartgoryid) whereConditions["$product.brand.categorieid$"] = cartgoryid;
        if (uniteid) whereConditions["$product.uniteid$"] = uniteid;
        if (sizeid) whereConditions["$product.sizeid$"] = sizeid;

        // ✅ Query data
        const { rows, count } = await BillsaleList.findAndCountAll({
            where: whereConditions,
            limit,
            offset: skip,
            order: [[orderBy, order]],
            include: [
                {
                    model: Products,
                    as: "product",
                    attributes: ["product_uuid", "sku", "barcode", "images", "productName"],
                    include: [
                        {
                            model: Units,
                            as: "unit",
                            attributes: ["unit_uuid", "unitName"],
                        },
                        {
                            model: Sizes,
                            as: "size",
                            attributes: ["size_uuid", "sizeName"],
                        },
                        {
                            model: Brands,
                            as: "brand",
                            attributes: ["brand_uuid", "brandName"],
                            include: [
                                {
                                    model: Categories,
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
    } catch (error) {
        console.error("❌ Fetch error:", error);
        res.status(500).json({ error: "Failed to fetch BillsaleList" });
    }
};

export const searchBillSale = async (req: Request, res: Response) => {
    try {
        const { shopid, billSale } = req.body as any;
        const result = await Billsales.findOne({
            where: { billcode: billSale, shopid: shopid },
            include: [
                {
                    model: Users,
                    as: "user",
                    attributes: ["userName", "phones"],
                },
                {
                    model: Shops,
                    as: "shop",
                    include: [{
                        model: District,
                        as: "district",
                        include: [
                            {
                                model: Provinces,
                                as: "province"
                            }
                        ]
                    }]
                },
                {
                    model: BillsaleList,
                    as: "billList",
                    include: [
                        {
                            model: Products,
                            as: "product",
                            attributes: ["product_uuid", "sku", "barcode", "images", "productName"],
                            include: [
                                {
                                    model: Units,
                                    as: "unit",
                                    attributes: ["unit_uuid", "unitName"],
                                },
                                {
                                    model: Sizes,
                                    as: "size",
                                    attributes: ["size_uuid", "sizeName"],
                                },
                                {
                                    model: Brands,
                                    as: "brand",
                                    attributes: ["brand_uuid", "brandName"],
                                },
                            ],
                        },
                    ],
                },
                {
                    model: Transportation,
                    as: "transport",
                    include: [
                        {
                            model: Provinces,
                            as: "province"
                        },
                        {
                            model: Company,
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
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch Billsale" });
    }
}

// ======= get bill cancle ========

export const fetchBillCancel = async (
    req: Request<{}, {}, {}, QueryParams>,
    res: Response
) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
        const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
        const orderBy = req.query.orderBy || "bill_uuid";
        const order = (req.query.order || "ASC").toUpperCase() as "ASC" | "DESC";

        const { start_date, end_date, shopid, typesale, userid } = req.body as any;

        // ⭐ Fix date range
        const startDate = moment(start_date).startOf("day").toDate();
        const endDate = moment(end_date).endOf("day").toDate();

        const whereConditions: any = {
            status: 2,
            shopid: shopid,
            updatedAt: {
                [Op.between]: [startDate, endDate]
            }
        };

        if (typesale) {
            whereConditions.typesale = typesale;
        }
        if (userid) {
            whereConditions.createby = userid;
        }

        const { rows, count } = await Billsales.findAndCountAll({
            where: whereConditions,
            limit,
            offset: skip,
            order: [[orderBy, order]],
            include: [
                {
                    model: Country,
                    as: "country",
                    attributes: ["names", "abbr", "icons", "rate", "genus"],
                },
                {
                    model: Users,
                    as: "user",
                    attributes: ["userName", "phones"],
                },
                {
                    model: Transportation,
                    as: "transport",
                    include: [
                        {
                            model: Provinces,
                            as: "province"
                        },
                        {
                            model: Company,
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

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to fetch Billsales" });
    }
};
