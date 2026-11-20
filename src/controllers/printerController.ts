import { Request, Response } from "express";
import { Op } from "sequelize";
import { maxid } from "../utils";
import Printers from "../models/Printers.Model";
import Users from "../models/Users.Model";

/** ຂໍ້ມູນຜູ້ໃຊ້ທີ່ຕິດມານຳ ເວລາດຶງລາຍການປຣີນເຕີ */
const withUser = [{ model: Users, as: "user", attributes: ["user_uuid", "userName"] }];

/**
 * ຕັ້ງເປັນຄ່າຫຼັກໄດ້ໜ່ວຍດຽວ ຕໍ່ 1 ໜ້າທີ່ ແລະ ຕໍ່ 1 ຂອບເຂດ
 * (ຂອງຜູ້ໃຊ້ຄົນນັ້ນ ຫຼື ຂອງຮ້ານທີ່ໃຊ້ຮ່ວມກັນ)
 */
const clearOtherDefaults = async (
  shopid: number | null,
  purpose: string | null,
  user_uuid: number | null,
  keepId?: number
) => {
  await Printers.update(
    { isDefault: 0 },
    {
      where: {
        shopid,
        purpose,
        user_uuid: user_uuid ?? null,
        ...(keepId ? { _uuid: { [Op.ne]: keepId } } : {}),
      },
    }
  );
};

/** ແປງຄ່າທີ່ສົ່ງມາໃຫ້ເປັນຮູບແບບທີ່ເກັບໄດ້ (user_uuid ວ່າງ = ໃຊ້ຮ່ວມກັນທັງຮ້ານ) */
const normalize = (body: any) => ({
  ...body,
  user_uuid: body.user_uuid ? Number(body.user_uuid) : null,
  copies: body.copies ? Number(body.copies) : 1,
  isDefault: Number(body.isDefault) === 1 ? 1 : 0,
});

// ====== ລາຍການປຣີນເຕີທັງໝົດຂອງຮ້ານ ======
export const getPrinters = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const shopid = req.params.id;
    const printers = await Printers.findAll({
      where: { shopid },
      include: withUser,
      order: [["purpose", "ASC"], ["isDefault", "DESC"], ["_uuid", "ASC"]],
    });
    res.status(200).json({ data: printers, total: printers.length });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch printers" });
  }
};

/**
 * ປຣີນເຕີທີ່ຜູ້ໃຊ້ທີ່ login ຢູ່ ໃຊ້ໄດ້ — ຂອງຕົນເອງ + ຂອງຮ້ານທີ່ໃຊ້ຮ່ວມກັນ
 * ໜ້າຂາຍເອີ້ນເສັ້ນນີ້ ແລ້ວເລືອກໜ່ວຍທີ່ isDefault ຂອງແຕ່ລະໜ້າທີ່
 */
export const getMyPrinters = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const shopid = req.params.id;
    const user_uuid = req.user?.sub;

    const printers = await Printers.findAll({
      where: {
        shopid,
        status: 1,
        [Op.or]: [{ user_uuid: null }, { user_uuid: user_uuid ?? null }],
      },
      include: withUser,
      // ຂອງຜູ້ໃຊ້ເອງມາກ່ອນ ຈຶ່ງເອົາໄປໃຊ້ແທນຂອງຮ້ານໄດ້ເລີຍ
      order: [["user_uuid", "DESC"], ["isDefault", "DESC"], ["_uuid", "ASC"]],
    });
    res.status(200).json({ data: printers });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch printers" });
  }
};

// ====== ເພີ່ມປຣີນເຕີ ======
export const createPrinter = async (req: Request, res: Response) => {
  try {
    const body = normalize(req.body);
    if (!body.printerName) return res.status(400).json({ error: "printerName is required" });

    body._uuid = await maxid(Printers, "_uuid");
    if (body.isDefault === 1) {
      await clearOtherDefaults(body.shopid, body.purpose, body.user_uuid);
    }

    const printer = await Printers.create(body);
    res.status(200).json({ message: "Printer created successfully", data: printer });
  } catch (error) {
    res.status(500).json({ error: "Failed to create printer" });
  }
};

// ====== ແກ້ໄຂປຣີນເຕີ ======
export const updatePrinter = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const _uuid = Number(atob(req.params.id));
    const printer = await Printers.findByPk(_uuid);
    if (!printer) return res.status(404).json({ error: "Printer not found" });

    const body = normalize(req.body);
    body.updatedAt = new Date();
    if (body.isDefault === 1) {
      await clearOtherDefaults(
        body.shopid ?? printer.getDataValue("shopid"),
        body.purpose ?? printer.getDataValue("purpose"),
        body.user_uuid,
        _uuid
      );
    }

    await Printers.update(body, { where: { _uuid } });
    res.status(200).json({ message: "Printer updated successfully", data: await Printers.findByPk(_uuid) });
  } catch (error) {
    res.status(500).json({ error: "Failed to update printer" });
  }
};

// ====== ລຶບປຣີນເຕີ ======
export const deletePrinter = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const _uuid = Number(atob(req.params.id));
    const deleted = await Printers.destroy({ where: { _uuid } });
    if (!deleted) return res.status(404).json({ error: "Printer not found" });
    res.status(200).json({ message: "Printer deleted successfully", data: deleted });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete printer" });
  }
};
