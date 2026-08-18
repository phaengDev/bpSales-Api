import { Request, Response } from "express";
import { col } from "sequelize";
import { maxid } from "../utils";
import Exchanges from "../models/Exchanges";
import Country from "../models/Country";
export const getExchange = async (req: Request<{id: string}>, res: Response) => {
    try {
        const shopid = req.params.id;
        const exchange = await Country.findAll(
            {
                where: {status: 1 },
                attributes: [
                   [col("Country._uuid"), "countryid"],
                    "names",
                    "abbr",
                    "icons",
                    "genus",
                    [col("rates._uuid"), "_uuid"],
                    [col("rates.rate"), "rate"],
                    [col("rates.shopid"), "shopid"],
                ],
                include: [
                    {
                        model: Exchanges,
                        as: "rates",
                        attributes: [],
                        required: false,
                        where: { shopid: shopid, status: 1  },
                    },
                ],
                raw: true,
            }
        );

        res.status(200).json({data:exchange});
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch exchange" });
    }
};

// =============== create or update exchange

export const createExchange = async (req: Request, res: Response) => {
    try {
        const { shopid, countryid, rate } = req.body;

        if (shopid == null || countryid == null || rate == null) {
            return res.status(400).json({
                error: "shopid, countryid and rate are required",
            });
        }
        const new_uuid= await maxid(Exchanges, "_uuid");

        const exchange = await Exchanges.findOne({
            where: { shopid, countryid },
        });

        if (exchange) {
            const updated = await exchange.update({ rate, status: 1 });
            return res.status(200).json({
                data: updated,
                message: "Exchange updated successfully",
            });
        }

        const created = await Exchanges.create({
            _uuid: new_uuid,
            shopid,
            countryid,
            rate,
            status: 1,
        });

        return res.status(200).json({
            data: created,
            message: "Exchange created successfully",
        });
    } catch (error) {
        return res.status(500).json({ error: "Failed to save exchange" });
    }
};
