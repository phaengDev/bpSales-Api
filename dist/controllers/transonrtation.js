"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransportation = void 0;
const sequelize_1 = require("sequelize");
const Transportation_1 = __importDefault(require("../models/Transportation"));
const Company_1 = __importDefault(require("../models/Company"));
const Provinces_1 = __importDefault(require("../models/Provinces"));
const moment_1 = __importDefault(require("moment"));
const Billsales_1 = __importDefault(require("../models/Billsales"));
const toPlainObject = (value) => {
    if (!value)
        return value;
    return typeof value.toJSON === "function" ? value.toJSON() : value;
};
const formatTransportationDetails = (transport) => {
    const item = toPlainObject(transport);
    if (!item)
        return item;
    const destinationBranchName = [
        item.province?.name_la,
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
const getTransportation = async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
        const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
        const orderBy = req.query.orderBy || "_uuid";
        const order = (req.query.order || "ASC").toUpperCase();
        const { startDate, endDate, shopid, status_pay, cod } = req.body;
        // ✅ Fix date range properly
        const start_date = (0, moment_1.default)(startDate).format("YYYY-MM-DD");
        const end_date = (0, moment_1.default)(endDate).format("YYYY-MM-DD");
        // ✅ Base conditions
        const whereConditions = {
            status: 1,
            shopid: shopid,
            [sequelize_1.Op.and]: [
                (0, sequelize_1.where)((0, sequelize_1.fn)('DATE', (0, sequelize_1.col)('Transportation.createdAt')), {
                    [sequelize_1.Op.between]: [start_date, end_date],
                }),
            ],
        };
        if (status_pay) {
            whereConditions.status_pay = status_pay;
        }
        if (cod) {
            whereConditions.cod = cod;
        }
        const { rows, count } = await Transportation_1.default.findAndCountAll({
            where: whereConditions,
            limit,
            offset: skip,
            order: [[orderBy, order]],
            include: [
                {
                    model: Billsales_1.default,
                    as: "billsale",
                    required: true,
                },
                {
                    model: Company_1.default,
                    as: "company",
                },
                {
                    model: Provinces_1.default,
                    as: "province",
                },
            ],
        });
        const sums = await Transportation_1.default.findOne({
            where: whereConditions,
            attributes: [
                [sequelize_1.Sequelize.fn("COUNT", sequelize_1.Sequelize.col("*")), "total_items"],
                [sequelize_1.Sequelize.fn("SUM", sequelize_1.Sequelize.col("balance")), "total_cod"],
                [
                    sequelize_1.Sequelize.literal(`SUM(CASE WHEN status_pay = 1 THEN 1 ELSE 0 END)`),
                    "item_start"
                ],
                [
                    sequelize_1.Sequelize.literal(`SUM(CASE WHEN status_pay = 2 THEN 1 ELSE 0 END)`),
                    "item_end"
                ],
            ],
        });
        const data = rows.map(formatTransportationDetails);
        res.status(200).json({
            data,
            total: count,
            sums: sums || {},
            limit,
            skip
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch categories" });
    }
};
exports.getTransportation = getTransportation;
