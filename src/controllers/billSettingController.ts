import { Request, Response } from "express";
import { fn, col, literal } from "sequelize";
import { maxid, url } from "../utils";
import { deleteFile } from "../utils/uploadFile";
import BillSettings from "../models/BillSettings.Model";

/** ໂລໂກ້ບິນເກັບໂຟນເດີດຽວກັນກັບໂລໂກ້ອື່ນຂອງລະບົບ */
const LOGO_FOLDER = "logo";

const logoUrl = (): any[] => [
  [fn("CONCAT", literal(`'${url()}/${LOGO_FOLDER}/'`), col("logo")), "logoUrl"],
];

/** ຄ່າທີ່ແກ້ໄດ້ຈາກໜ້າ ຕັ້ງຄ່າລະບົບ > ຮູບແບບບິນ */
const FIELDS = [
  "paper", "fontScale", "copies", "margin",
  "showLogo", "showAddress", "showPhone", "showSeller", "showTax", "showQr",
  "autoPrint", "silentPrint", "footerText", "labelSize",
] as const;

/** ຫາແຖວຂອງຮ້ານ — ຮ້ານໃໝ່ທີ່ຍັງບໍ່ເຄີຍຕັ້ງ ໃຫ້ສ້າງແຖວຄ່າຕັ້ງຕົ້ນໃຫ້ເລີຍ */
const findOrCreate = async (shopid: number) => {
  const found = await BillSettings.findOne({ where: { shopid } });
  if (found) return found;

  const _uuid = await maxid(BillSettings, "_uuid");
  return BillSettings.create({ _uuid, shopid, footerText: "" });
};

// ====== ດຶງຮູບແບບບິນຂອງຮ້ານ ======
export const getBillSetting = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const shopid = Number(req.params.id);
    await findOrCreate(shopid);

    const setting = await BillSettings.findOne({
      where: { shopid },
      attributes: { include: logoUrl() },
    });
    res.status(200).json({ data: setting });
  } catch (error) {
    console.error("❌ Fetch bill setting error:", error);
    res.status(500).json({ error: "Failed to fetch bill setting" });
  }
};

// ====== ບັນທຶກຮູບແບບບິນ ======
export const saveBillSetting = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const shopid = Number(req.params.id);
    await findOrCreate(shopid);

    const payload: Record<string, unknown> = { updatedAt: new Date() };
    FIELDS.forEach((field) => {
      if (req.body[field] === undefined) return;
      // ຄ່າເປີດ/ປິດ ສົ່ງມາເປັນ boolean ໄດ້ ເກັບເປັນ 0/1
      payload[field] = typeof req.body[field] === "boolean"
        ? (req.body[field] ? 1 : 0)
        : req.body[field];
    });

    await BillSettings.update(payload, { where: { shopid } });
    const setting = await BillSettings.findOne({ where: { shopid }, attributes: { include: logoUrl() } });
    res.status(200).json({ message: "Bill setting saved successfully", data: setting });
  } catch (error) {
    console.error("❌ Save bill setting error:", error);
    res.status(500).json({ error: "Failed to save bill setting" });
  }
};

// ====== ໂລໂກ້ໃນບິນ ======
export const updateBillLogo = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const shopid = Number(req.params.id);
    const setting = await findOrCreate(shopid);

    const fileName = req.file?.filename;
    if (!fileName) return res.status(400).json({ error: "No image uploaded" });

    const oldFile = setting.getDataValue("logo") as string | null;
    await BillSettings.update({ logo: fileName, updatedAt: new Date() }, { where: { shopid } });
    if (oldFile) deleteFile(LOGO_FOLDER, oldFile);

    const updated = await BillSettings.findOne({ where: { shopid }, attributes: { include: logoUrl() } });
    res.status(200).json({ message: "Bill logo updated successfully", data: updated });
  } catch (error) {
    console.error("❌ Update bill logo error:", error);
    res.status(500).json({ error: "Failed to update bill logo" });
  }
};

export const deleteBillLogo = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const shopid = Number(req.params.id);
    const setting = await findOrCreate(shopid);

    const oldFile = setting.getDataValue("logo") as string | null;
    await BillSettings.update({ logo: null, updatedAt: new Date() }, { where: { shopid } });
    if (oldFile) deleteFile(LOGO_FOLDER, oldFile);

    res.status(200).json({ message: "Bill logo removed successfully" });
  } catch (error) {
    console.error("❌ Remove bill logo error:", error);
    res.status(500).json({ error: "Failed to remove bill logo" });
  }
};
