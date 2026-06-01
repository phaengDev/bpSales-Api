import { Request, Response } from "express";
import Provinces from "../models/Provinces";
import District from "../models/Districts";
import Country from "../models/Country";
import Company from "../models/Company";
import Shops from "../models/Shops";
// ======== get province =======
export const getProvince = async (req: Request, res: Response) => {
    try {
        const province = await Provinces.findAll();

        if (!province || province.length === 0) {
            return res.status(404).json({ message: "No provinces found", data: [] });
        }

        res.status(200).json({
            message: "Provinces fetched successfully",
            data: province,
        });
    } catch (error) {
        console.error("❌ Fetch provinces error:", error);
        res.status(500).json({ error: "Failed to fetch provinces" });
    }
};

// ======== get district ======
export const districtbyProvince = async (req: Request, res: Response) => {
    try {
        const provinceid = req.params.id;
        const district = await District.findAll({
            where: { provinceid: provinceid },
        });
        res.status(200).json(district);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch district by province" });
    }
};
// ========== get district All===========
export const getDistrict = async (req: Request, res: Response) => {
    try {
        const district = await District.findAll();
        if (!district) return res.status(404).json({ error: "District not found" });

        res.status(200).json({ data: district });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch district" });
    }
};

export const getCountry = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const shopid = req.params.id;
        const country = await Country.findAll(
            {
                where: { shopid: shopid, status: 1 },
            }
        );
        res.status(200).json(country);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch country" });
    }
};
export const getCompany = async (req: Request, res: Response) => {
    try {
        const data = await Company.findAll();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch country" });
    }
};

export const getShops = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const shopId = req.params.id;
        const shop = await Shops.findOne({
            where: { shop_uuid: shopId },
            include: [
                {
                    model: District,
                    as: 'district',
                    include: [
                        {
                            model: Provinces,
                            as: 'province',
                        },
                    ],
                },
            ],
        });

        if (!shop) {
            return res.status(404).json({ error: "Shop not found" });
        }

        res.status(200).json({ data: shop });
    } catch (error) {
        console.error("❌ Fetch shop error:", error);
        res.status(500).json({ error: "Failed to fetch shop" });
    }
};
