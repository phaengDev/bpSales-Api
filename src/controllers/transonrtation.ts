import { Request, Response } from "express";
import { Op, fn, col, literal, Sequelize, where } from "sequelize";
import { maxid, maxCode, codeNo } from "../utils";
import Transportation from "../models/Transportation";
import Company from "../models/Company";
import Provinces from "../models/Provinces";
import moment from "moment";
import Billsales from "../models/Billsales";
interface QueryParams {
    limit?: string;
    skip?: string;
    orderBy?: string;
    order?: string;
}

const toPlainObject = (value: any) => {
    if (!value) return value;
    return typeof value.toJSON === "function" ? value.toJSON() : value;
};

const formatTransportationDetails = (transport: any) => {
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

export const getTransportation = async (
    req: Request<{}, {}, {}, QueryParams>,
    res: Response
) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
        const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
        const orderBy = req.query.orderBy || "_uuid";
        const order = (req.query.order || "ASC").toUpperCase() as "ASC" | "DESC";
        const { startDate, endDate, shopid, status_pay, cod } = req.body as any;
        // ✅ Fix date range properly
        const start_date = moment(startDate).format("YYYY-MM-DD");
        const end_date = moment(endDate).format("YYYY-MM-DD");

        // ✅ Base conditions
        const whereConditions: any = {
            status: 1,
            shopid: shopid,
            [Op.and]: [
                where(fn('DATE', col('Transportation.createdAt')), {
                    [Op.between]: [start_date, end_date],
                }),
            ],
        };
        if (status_pay) {
            whereConditions.status_pay = status_pay;
        }
        if (cod) {
            whereConditions.cod = cod;
        }

        const { rows, count } = await Transportation.findAndCountAll({
            where: whereConditions,
            limit,
            offset: skip,
            order: [[orderBy, order]],
            include: [
                {
                    model: Billsales,
                    as: "billsale",
                    required: true,
                },
                {
                    model: Company,
                    as: "company",
                },
                {
                    model: Provinces,
                    as: "province",
                },
            ],
        });

        const sums = await Transportation.findOne({
            where: whereConditions,
            attributes: [
                [Sequelize.fn("COUNT", Sequelize.col("*")), "total_items"],
                [Sequelize.fn("SUM", Sequelize.col("balance")), "total_cod"],
                [
                    Sequelize.literal(`SUM(CASE WHEN status_pay = 1 THEN 1 ELSE 0 END)`),
                    "item_start"
                ],
                [
                    Sequelize.literal(`SUM(CASE WHEN status_pay = 2 THEN 1 ELSE 0 END)`),
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
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch categories" });
    }
};
