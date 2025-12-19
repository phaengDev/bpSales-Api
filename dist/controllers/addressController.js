"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompany = exports.getCountry = exports.getDistrict = exports.districtbyProvince = exports.getProvince = void 0;
const Provinces_1 = __importDefault(require("../models/Provinces"));
const Districts_1 = __importDefault(require("../models/Districts"));
const Country_1 = __importDefault(require("../models/Country"));
const Company_1 = __importDefault(require("../models/Company"));
// ======== get province =======
const getProvince = async (req, res) => {
    try {
        const province = await Provinces_1.default.findAll();
        if (!province || province.length === 0) {
            return res.status(404).json({ message: "No provinces found", data: [] });
        }
        res.status(200).json({
            message: "Provinces fetched successfully",
            data: province,
        });
    }
    catch (error) {
        console.error("❌ Fetch provinces error:", error);
        res.status(500).json({ error: "Failed to fetch provinces" });
    }
};
exports.getProvince = getProvince;
// ======== get district ======
const districtbyProvince = async (req, res) => {
    try {
        const provinceid = req.params.id;
        const district = await Districts_1.default.findAll({
            where: { provinceid: provinceid },
        });
        res.status(200).json(district);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch district by province" });
    }
};
exports.districtbyProvince = districtbyProvince;
// ========== get district All===========
const getDistrict = async (req, res) => {
    try {
        const district = await Districts_1.default.findAll();
        if (!district)
            return res.status(404).json({ error: "District not found" });
        res.status(200).json({ data: district });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch district" });
    }
};
exports.getDistrict = getDistrict;
const getCountry = async (req, res) => {
    try {
        const shopid = req.params.id;
        const country = await Country_1.default.findAll({
            where: { shopid: shopid, status: 1 },
        });
        res.status(200).json(country);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch country" });
    }
};
exports.getCountry = getCountry;
const getCompany = async (req, res) => {
    try {
        const data = await Company_1.default.findAll();
        res.status(200).json(data);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch country" });
    }
};
exports.getCompany = getCompany;
