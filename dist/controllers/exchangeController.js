"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateExchange = exports.getExchange = void 0;
const Exchanges_1 = __importDefault(require("../models/Exchanges"));
const getExchange = async (req, res) => {
    try {
        const exchange = await Exchanges_1.default.findAll();
        res.status(200).json({ data: exchange });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch exchange" });
    }
};
exports.getExchange = getExchange;
const updateExchange = async (req, res) => {
    try {
        const _uuid = atob(req.params.id);
        const exchange = await Exchanges_1.default.findByPk(_uuid);
        if (!exchange)
            return res.status(404).json({ error: "Exchange not found" });
        const updated = await Exchanges_1.default.update(req.body, {
            where: { _uuid: _uuid },
        });
        res.status(200).json({ data: updated, message: "Exchange updated successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch exchange" });
    }
};
exports.updateExchange = updateExchange;
