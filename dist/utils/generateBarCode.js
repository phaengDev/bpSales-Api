"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.maxsku = void 0;
exports.generateBarCode = generateBarCode;
const crypto_1 = require("crypto");
const Products_1 = __importDefault(require("../models/Products"));
const sequelize_1 = require("sequelize");
/**
 * ສ້າງລະຫັດສິນຄ້າສຸ່ມ 7 ຕົວ ແລະກວດວ່າບໍ່ຊ້ຳພາຍໃນ shopid ເດີຍວກັນ
 * @param shopid number | string  — ລະຫັດຮ້ານ
 */
async function generateBarCode(shopid) {
    let code;
    let exists = true;
    let tries = 0;
    do {
        // ✅ สุ่มเลข 10 หลัก (ไม่เกิน 9999999999)
        code = (0, crypto_1.randomInt)(1000000000, 9999999999).toString();
        // ✅ ตรวจว่ามีใน DB หรือยัง
        const found = await Products_1.default.findOne({
            where: { barcode: code, shopid: shopid },
        });
        exists = !!found;
        tries++;
    } while (exists && tries < 10);
    if (exists)
        throw new Error("Unable to generate unique product code after 10 tries");
    return code;
}
const maxsku = async (model, field, skuPrefix) => {
    if (!skuPrefix)
        throw new Error("❌ SKU prefix is required");
    // 🔹 หา SKU ล่าสุดที่ขึ้นต้นด้วย prefix
    const lastRow = await model.findOne({
        where: {
            [field]: { [sequelize_1.Op.like]: `${skuPrefix}%` },
        },
        order: [[field, "DESC"]],
    });
    // 🔹 ถ้ามีข้อมูลล่าสุด → ต่อท้าย +1
    let lastCode = lastRow ? lastRow.get(field) : null;
    let newSku;
    if (lastCode) {
        const suffix = lastCode.replace(skuPrefix, ""); // เช่น BN00011 → "1"
        const nextNumber = (parseInt(suffix, 10) || 0) + 1;
        newSku = `${skuPrefix}${nextNumber}`; // → BN00012
    }
    else {
        // 🔹 ถ้ายังไม่มีข้อมูล prefix นี้ → เริ่มจาก 1
        newSku = `${skuPrefix}1`; // → BN00011
    }
    return newSku;
};
exports.maxsku = maxsku;
