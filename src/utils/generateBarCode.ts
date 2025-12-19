
import { randomInt,randomBytes } from "crypto";
import Products from "../models/Products";
import { ModelStatic, Transaction, Model, Op } from "sequelize";
/**
 * ສ້າງລະຫັດສິນຄ້າສຸ່ມ 7 ຕົວ ແລະກວດວ່າບໍ່ຊ້ຳພາຍໃນ shopid ເດີຍວກັນ
 * @param shopid number | string  — ລະຫັດຮ້ານ
 */


export async function generateBarCode(shopid: number | string): Promise<string> {
  let code: string;
  let exists = true;
  let tries = 0;
  do {
    // ✅ สุ่มเลข 10 หลัก (ไม่เกิน 9999999999)
    code = randomInt(1000000000, 9999999999).toString();

    // ✅ ตรวจว่ามีใน DB หรือยัง
    const found = await Products.findOne({
      where: { barcode: code, shopid: shopid },
    });

    exists = !!found;
    tries++;
  } while (exists && tries < 10);

  if (exists) throw new Error("Unable to generate unique product code after 10 tries");

  return code;
}

export const maxsku = async (
  model: ModelStatic<Model<any, any>>,
  field: string,
  skuPrefix: string
): Promise<string> => {
  if (!skuPrefix) throw new Error("❌ SKU prefix is required");

  // 🔹 หา SKU ล่าสุดที่ขึ้นต้นด้วย prefix
  const lastRow = await model.findOne({
    where: {
      [field]: { [Op.like]: `${skuPrefix}%` },
    },
    order: [[field, "DESC"]],
  });

  // 🔹 ถ้ามีข้อมูลล่าสุด → ต่อท้าย +1
  let lastCode = lastRow ? (lastRow.get(field) as string) : null;
  let newSku: string;

  if (lastCode) {
    const suffix = lastCode.replace(skuPrefix, ""); // เช่น BN00011 → "1"
    const nextNumber = (parseInt(suffix, 10) || 0) + 1;
    newSku = `${skuPrefix}${nextNumber}`; // → BN00012
  } else {
    // 🔹 ถ้ายังไม่มีข้อมูล prefix นี้ → เริ่มจาก 1
    newSku = `${skuPrefix}1`; // → BN00011
  }
  return newSku;
};
