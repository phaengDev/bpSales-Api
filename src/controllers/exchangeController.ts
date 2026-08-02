import { Request, Response } from "express";
import Exchanges from "../models/Exchanges";

export const getExchange = async (req: Request<{id: string}>, res: Response) => {
    try {
        const shopid = req.params.id;
        const exchange = await Exchanges.findAll(
            {
                where: { shopid: shopid, status: 1 },
            }
        );
        res.status(200).json({data:exchange});
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch exchange" });
    }
};
export const updateExchange = async (req: Request<{id: string}>, res: Response) => {
    try {
        const _uuid = atob(req.params.id);
        const exchange = await Exchanges.findByPk(_uuid);
        if (!exchange) return res.status(404).json({ error: "Exchange not found" });
        const updated = await Exchanges.update(req.body, {
            where: { _uuid: _uuid },
        });
        res.status(200).json({data:updated,message:"Exchange updated successfully"});
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch exchange" });
    }
};