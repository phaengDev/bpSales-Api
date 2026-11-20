import { Request, Response } from "express";
import { fn, col, literal } from "sequelize";
import { url } from "../utils";
import { deleteFile } from "../utils/uploadFile";
import Provinces from "../models/Provinces";
import District from "../models/Districts";
import Country from "../models/Country";
import Company from "../models/Company";
import Shops from "../models/Shops.Model";

/** ໂຟນເດີເກັບຮູບ — ໃຊ້ຮ່ວມກັບບ່ອນອື່ນຂອງລະບົບ (logo, QR) */
export const SHOP_IMAGE_FOLDER = {
    logo: "logo",
    bank_qr: "QR",
} as const;

/** url ເຕັມຂອງຮູບ ສົ່ງໄປໃຫ້ໜ້າເວັບໃຊ້ໄດ້ເລີຍ */
const shopImageUrls = (): any[] => [
    [fn("CONCAT", literal(`'${url()}/${SHOP_IMAGE_FOLDER.logo}/'`), col("logo")), "logoUrl"],
    [fn("CONCAT", literal(`'${url()}/${SHOP_IMAGE_FOLDER.bank_qr}/'`), col("bank_qr")), "qrUrl"],
];
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

export const getCountry = async (req: Request, res: Response) => {
    try {
        const country = await Country.findAll(
            {
                where: { status: 1 },
            }
        );
        res.status(200).json({data:country});
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch country" });
    }
};
export const getCompany = async (req: Request, res: Response) => {
    try {
        const data = await Company.findAll();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch company" });
    }
};

export const getShops = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const shopId = req.params.id;
        const shop = await Shops.findOne({
            where: { shop_uuid: shopId },
            attributes: { include: shopImageUrls() },
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

/** ແກ້ໄຂຂໍ້ມູນຮ້ານ — ໃຊ້ຢູ່ໜ້າ ຕັ້ງຄ່າລະບົບ > ຂໍ້ມູນຮ້ານ */
export const updateShop = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const shop_uuid = req.params.id;
        const shop = await Shops.findByPk(shop_uuid);
        if (!shop) return res.status(404).json({ error: "Shop not found" });

        // ຮັບສະເພາະຄໍລຳທີ່ແກ້ໄດ້ ປ້ອງກັນການຂຽນທັບຄ່າອື່ນ
        const allowed = ["shopName", "phone", "email", "village", "districtid", "taxNumber", "description", "bank_qr"] as const;
        const payload: Record<string, unknown> = { updatedAt: new Date() };
        allowed.forEach((field) => {
            if (req.body[field] !== undefined) payload[field] = req.body[field];
        });

        await Shops.update(payload, { where: { shop_uuid } });
        res.status(200).json({ message: "Shop updated successfully", data: await Shops.findByPk(shop_uuid) });
    } catch (error) {
        console.error("❌ Update shop error:", error);
        res.status(500).json({ error: "Failed to update shop" });
    }
};

/** ບັນທຶກຮູບຂອງຮ້ານ (ໂລໂກ້ ຫຼື QR) ແລ້ວລຶບໄຟລ໌ເກົ່າຖິ້ມ */
const saveShopImage = async (req: Request<{ id: string }>, res: Response, field: "logo" | "bank_qr") => {
    const folder = SHOP_IMAGE_FOLDER[field];
    try {
        const shop_uuid = req.params.id;
        const shop = await Shops.findByPk(shop_uuid);
        if (!shop) return res.status(404).json({ error: "Shop not found" });

        const fileName = req.file?.filename;
        if (!fileName) return res.status(400).json({ error: "No image uploaded" });

        const oldFile = shop.getDataValue(field) as string | null;
        await Shops.update({ [field]: fileName, updatedAt: new Date() }, { where: { shop_uuid } });
        if (oldFile) deleteFile(folder, oldFile);

        const updated = await Shops.findByPk(shop_uuid, { attributes: { include: shopImageUrls() } });
        res.status(200).json({ message: "Shop image updated successfully", data: updated });
    } catch (error) {
        console.error("❌ Update shop image error:", error);
        res.status(500).json({ error: "Failed to update shop image" });
    }
};

/** ລຶບຮູບຂອງຮ້ານ — ກັບໄປໃຊ້ຮູບຕັ້ງຕົ້ນ */
const removeShopImage = async (req: Request<{ id: string }>, res: Response, field: "logo" | "bank_qr") => {
    const folder = SHOP_IMAGE_FOLDER[field];
    try {
        const shop_uuid = req.params.id;
        const shop = await Shops.findByPk(shop_uuid);
        if (!shop) return res.status(404).json({ error: "Shop not found" });

        const oldFile = shop.getDataValue(field) as string | null;
        await Shops.update({ [field]: null, updatedAt: new Date() }, { where: { shop_uuid } });
        if (oldFile) deleteFile(folder, oldFile);

        res.status(200).json({ message: "Shop image removed successfully" });
    } catch (error) {
        console.error("❌ Remove shop image error:", error);
        res.status(500).json({ error: "Failed to remove shop image" });
    }
};

export const updateShopLogo = (req: Request<{ id: string }>, res: Response) => saveShopImage(req, res, "logo");
export const deleteShopLogo = (req: Request<{ id: string }>, res: Response) => removeShopImage(req, res, "logo");
export const updateShopQr = (req: Request<{ id: string }>, res: Response) => saveShopImage(req, res, "bank_qr");
export const deleteShopQr = (req: Request<{ id: string }>, res: Response) => removeShopImage(req, res, "bank_qr");
