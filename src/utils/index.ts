import { ModelStatic, Transaction, Model, Op, Sequelize, WhereOptions } from "sequelize";
// const start = new Date().getFullYear();
export function url() {
  return 'http://localhost:3707/image'; // no need to be async
}

export async function maxid(
  model: ModelStatic<any>,
  column: string,
  options: { transaction?: Transaction } = {}
): Promise<number> {
  const maxResult = await model.max(column, options) as number | null;
  const nextId = (maxResult ?? 10000) + 1; // starts from 10001
  return nextId;
}
export const maxids = async (model: any, field: string, t: any) => {
  const lastRow = await model.findOne({
    order: [[field, "DESC"]],
    transaction: t,
    lock: t.LOCK.UPDATE,   // ✅ lock row สุดท้ายแทน
  });
  const year = new Date().getFullYear();
  return (lastRow ? lastRow.get(field) : Number(`${year}000`)) + 1;
};


export const codeNo = async (
  model: ModelStatic<Model<any, any>>,
  field: string,
  code: string | number
): Promise<string> => {
  if (!code) throw new Error("❌ Code is required");
  const prefix = String(code);
  // 🔹 หาข้อมูลล่าสุดที่ขึ้นต้นด้วย code นั้น (เช่น 103%)
  const lastRow = await model.findOne({
    where: {
      [field]: { [Op.like]: `${prefix}%` },
    },
    order: [[field, "DESC"]],
  });

  let lastCode = lastRow ? (lastRow.get(field) as string) : null;
  let newCode: string;
  if (lastCode) {
    // 🔹 ดึงเลขต่อท้าย เช่น 1035 → suffix = 5
    const suffix = lastCode.replace(prefix, "");
    const nextNumber = (parseInt(suffix, 10) || 0) + 1;
    newCode = `${prefix}${nextNumber}`; // → 1036
  } else {
    newCode = `${prefix}1`; // → 1031
  }
  return newCode;
};


export const billno = async (
  model: ModelStatic<Model<any, any>>,
  field: string,
  prefix: string,
  dateField: string
): Promise<string> => {

  const lastRow = await model.findOne({
    where: {
      [field]: { [Op.like]: `${prefix}%` },
      [Op.and]: [
        Sequelize.where(
          Sequelize.fn("DATE", Sequelize.col(dateField)),
          "=",
          Sequelize.fn("CURDATE")
        )
      ]
    },
    order: [[field, "DESC"]],
  });

  if (!lastRow) {
    return `${prefix}1`;
  }

  const lastCode = lastRow.get(field) as string;
  const suffix = lastCode.replace(prefix, "");
  if (!suffix || isNaN(Number(suffix))) {
    return `${prefix}1`;
  }
  const nextNumber = Number(suffix) + 1;
  return `${prefix}${nextNumber}`;
};


/**
 * maxCode(Categories, "cateCode", "CAT", { shopid: req.body.shopid })
 * 🔹 where = เงื่อนไขตรง ๆ ของตารางนั้น (ตารางไหนไม่มี shopid ก็ไม่ต้องส่ง)
 * 🔹 transaction = ส่งมาเมื่ออยู่ใน transaction จะ lock แถวล่าสุดให้
 */
export async function maxCode(
  model: ModelStatic<any>,
  column: string,
  prefix: string,
  where: WhereOptions = {},
  transaction?: Transaction
): Promise<string> {
  // 🔹 ตัด key ที่เป็น undefined ทิ้ง (Sequelize จะ throw ถ้า where มีค่า undefined)
  const cleanWhere = Object.fromEntries(
    Object.entries(where as Record<string, unknown>).filter(([, v]) => v !== undefined)
  ) as WhereOptions;

  // 🔹 นับเฉพาะ prefix เดียวกัน (กันเลขของ prefix อื่นมาปน)
  const prefixWhere: WhereOptions = { [column]: { [Op.like]: `${prefix}-%` } };
  const finalWhere = { [Op.and]: [cleanWhere, prefixWhere] } as WhereOptions;

  const lastRow = await model.findOne({
    attributes: [column],
    where: finalWhere,
    // เรียงตามความยาวก่อน เพื่อให้ '10000' > '9999' (string sort จะได้ไม่ผิด)
    order: [
      [Sequelize.fn("CHAR_LENGTH", Sequelize.col(column)), "DESC"],
      [column, "DESC"],
    ],
    transaction,
    ...(transaction ? { lock: transaction.LOCK.UPDATE } : {}),
    raw: true,
  });

  const lastCode = (lastRow as any)?.[column] as string | undefined;
  // ตัด prefix ออกก่อน แล้วค่อยอ่านเลขท้าย (prefix ที่มีตัวเลข เช่น '260822' จะได้ไม่ถูกนับ)
  const suffix = lastCode ? lastCode.slice(prefix.length + 1).replace(/\D/g, "") : "";
  const nextNumber = (parseInt(suffix, 10) || 0) + 1;
  const formattedNumber = nextNumber.toString().padStart(4, "0"); // '0001'
  return `${prefix}-${formattedNumber}`;
}
