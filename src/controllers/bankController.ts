import { Request, Response } from "express";
import { literal } from "sequelize";
import { maxid, url, } from "../utils";
import Banks from "../models/bankModel";
import { deleteFile } from "../utils/uploadFile";
interface QueryParams {
    limit?: string;
    skip?: string;
    orderBy?: string;
    order?: string;
}
const path = url();
/** ໂຟນເດີທີ່ເກັບຮູບຂອງທະນາຄານ — ຕ້ອງກົງກັບ createUpload ຢູ່ routes ແລະ url ຂ້າງລຸ່ມ */
const BANK_FOLDER = "bank";

/**
 * ດຶງຊື່ໄຟລ໌ຂອງແຕ່ລະຊ່ອງ
 *  logo = ໂລໂກ້ທະນາຄານ
 *  qr   = ຮູບ QR ຮັບເງິນ (ຮັບຊື່ເກົ່າ `bank` ນຳ)
 */
const getUploadFileName = (req: Request, field: "logo" | "qr"): string | undefined => {
    const files = req.files;

    if (files && !Array.isArray(files)) {
        const names = field === "logo" ? ["logo", "logos"] : ["qr", "bank"];
        for (const name of names) {
            const picked = files[name]?.[0]?.filename;
            if (picked) return picked;
        }
        return undefined;
    }

    // ອັບມາແບບບໍ່ລະບຸຊ່ອງ — ຖືເປັນໂລໂກ້
    if (field === "logo") {
        if (req.file) return req.file.filename;
        if (Array.isArray(files)) return files[0]?.filename;
    }

    return undefined;
};

/** ຮູບເກົ່າຖືກອັບເຂົ້າໂຟນເດີ logo — ລຶບທັງສອງບ່ອນ ບໍ່ໃຫ້ມີໄຟລ໌ຄ້າງ */
const removeBankFile = (fileName?: string | null) => {
    if (!fileName) return;
    deleteFile(BANK_FOLDER, fileName);
    deleteFile("logo", fileName);
};

/** ຕໍ່ URL ເຕັມຂອງຮູບໃຫ້ໜ້າເວັບ — ວ່າງ = ບໍ່ມີຮູບ */
const imageUrl = (column: string, alias: string) => [
    literal(`CASE WHEN ${column} IS NULL OR ${column} = '' THEN '' ELSE CONCAT('${url()}/${BANK_FOLDER}/', ${column}) END`),
    alias,
] as any;

// ========== create bank =======
export const createBank = async (req: Request, res: Response) => {
    try {
        const new_uuid = await maxid(Banks, "_uuid");
        const logo = getUploadFileName(req, "logo");
        const qr = getUploadFileName(req, "qr");

        const bank = await Banks.create({
            ...req.body,
            _uuid: new_uuid,
            logo: logo || req.body.logo || "",
            qr: qr || req.body.qr || "",
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        res.status(200).json({ message: "Bank created successfully", data: bank });
    } catch (error) {
        res.status(500).json({ error: "Failed to create bank" });
    }
};

// ========== update bank =======
export const updateBank = async (req: Request, res: Response) => {
    try {
        const bank_uuid = atob(req.params.id);
        const bank = await Banks.findByPk(bank_uuid);

        if (!bank) {
            return res.status(404).json({ error: "Bank not found" });
        }

        const logo = getUploadFileName(req, "logo");
        const qr = getUploadFileName(req, "qr");
        const payload = {
            ...req.body,
            updatedAt: new Date(),
        };

        // ບໍ່ໄດ້ສົ່ງຮູບໃໝ່ມາ = ໃຊ້ຮູບເກົ່າຕໍ່ (ຢ່າໃຫ້ຄ່າຫວ່າງຈາກ form ມາລ້າງ)
        if (logo) {
            removeBankFile(bank.logo);
            payload.logo = logo;
        } else {
            delete payload.logo;
        }

        if (qr) {
            removeBankFile(bank.qr);
            payload.qr = qr;
        } else {
            delete payload.qr;
        }

        const [updated] = await Banks.update(payload, {
            where: { _uuid: bank_uuid },
        });

        if (!updated) return res.status(404).json({ error: "Bank not found" });

        const updatedBank = await Banks.findByPk(bank_uuid);
        res.status(200).json({ message: "Bank updated successfully", data: updatedBank });
    } catch (error) {
        res.status(500).json({ error: "Failed to update bank" });
    }
};

// ========== delete bank =======
export const deleteBank = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const bank_uuid = atob(req.params.id);
        const bank = await Banks.findByPk(bank_uuid);

        if (!bank) {
            return res.status(404).json({ error: "Bank not found" });
        }

        removeBankFile(bank.logo);
        removeBankFile(bank.qr);

        const deleted = await Banks.destroy({
            where: { _uuid: bank_uuid },
        });

        if (!deleted) return res.status(404).json({ error: "Bank not found" });
        res.status(200).json({ message: "Bank deleted successfully", data: deleted });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete bank" });
    }
};

// ========== fetch bank =======
export const fetchBank = async (req: Request<{id: string}, {}, {}, QueryParams>, res: Response) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 100;
        const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
        const orderBy = req.query.orderBy || "_uuid";
        const order = (req.query.order || "ASC").toUpperCase() as "ASC" | "DESC";
       const shopid = req.params.id;
        const whereCondition = {
            status: 1,
            shopid:shopid
        } as any;

        const { rows, count } = await Banks.findAndCountAll({
            where: whereCondition,
            limit,
            offset: skip,
            order: [[orderBy, order]],
            attributes: {
                include: [
                    imageUrl("logo", "url"),
                    imageUrl("qr", "qrUrl"),
                ],
            },
        });

        res.status(200).json({
            data: rows,
            total: count,
            meta: {
                limit,
                skip,
                orderBy,
                order,
            },
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch bank" });
    }
};
// ========== fetch bank by id =======
export const getBankOption = async (req: Request<{id: string}>, res: Response) => {
    try {
        const shopid = req.params.id;
        const bank = await Banks.findAll({
            where: { status: 1,shopid: shopid },
            attributes: {
                include: [
                    imageUrl("logo", "url"),
                    imageUrl("qr", "qrUrl"),
                ],
            },
        });
        if (!bank) {
            return res.status(404).json({ error: "Bank not found" });
        }
        res.status(200).json({ data: bank });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch bank" });
    }
};
