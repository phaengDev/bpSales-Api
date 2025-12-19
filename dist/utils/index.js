"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.codeNo = exports.maxids = void 0;
exports.url = url;
exports.maxid = maxid;
exports.maxCode = maxCode;
const sequelize_1 = require("sequelize");
// const start = new Date().getFullYear();
function url() {
    return 'http://localhost:3707/image'; // no need to be async
}
async function maxid(model, column) {
    const maxResult = await model.max(column);
    const nextId = (maxResult ?? 10000) + 1; // starts from 10001
    return nextId;
}
const maxids = async (model, field, t) => {
    const lastRow = await model.findOne({
        order: [[field, "DESC"]],
        transaction: t,
        lock: t.LOCK.UPDATE, // ✅ lock row สุดท้ายแทน
    });
    const year = new Date().getFullYear();
    return (lastRow ? lastRow.get(field) : Number(`${year}000`)) + 1;
};
exports.maxids = maxids;
const codeNo = async (model, field, code) => {
    if (!code)
        throw new Error("❌ Code is required");
    const prefix = String(code);
    // 🔹 หาข้อมูลล่าสุดที่ขึ้นต้นด้วย code นั้น (เช่น 103%)
    const lastRow = await model.findOne({
        where: {
            [field]: { [sequelize_1.Op.like]: `${prefix}%` },
        },
        order: [[field, "DESC"]],
    });
    let lastCode = lastRow ? lastRow.get(field) : null;
    let newCode;
    if (lastCode) {
        // 🔹 ดึงเลขต่อท้าย เช่น 1035 → suffix = 5
        const suffix = lastCode.replace(prefix, "");
        const nextNumber = (parseInt(suffix, 10) || 0) + 1;
        newCode = `${prefix}${nextNumber}`; // → 1036
    }
    else {
        newCode = `${prefix}1`; // → 1031
    }
    return newCode;
};
exports.codeNo = codeNo;
async function maxCode(model, column, prefix, transaction) {
    const maxResult = await model.findOne({
        attributes: [[model.sequelize.fn('MAX', model.sequelize.col(column)), 'maxCode']],
        transaction,
        raw: true,
    });
    let currentMaxCode = maxResult?.maxCode || `${prefix}-0000`;
    let currentNumber = parseInt(currentMaxCode.replace(/\D/g, ""), 10) || 0;
    let nextNumber = currentNumber + 1;
    const formattedNumber = nextNumber.toString().padStart(4, '0'); // '000001'
    return `${prefix}-${formattedNumber}`;
}
