import { ModelStatic, Transaction, Model, Op, Sequelize } from "sequelize";
// const start = new Date().getFullYear();
export function url() {
  return 'http://localhost:3707/image'; // no need to be async
}

export async function maxid(model: ModelStatic<any>, column: string): Promise<number> {
  const maxResult = await model.max(column) as number | null;
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


export async function maxCode(
  model: ModelStatic<any>,
  column: string,
  prefix: string,
  transaction?: Transaction
): Promise<string> {
  const maxResult = await model.findOne({
    attributes: [[model.sequelize!.fn('MAX', model.sequelize!.col(column)), 'maxCode']],
    transaction,
    raw: true,
  });

  let currentMaxCode: string = (maxResult as any)?.maxCode || `${prefix}-0000`;
  let currentNumber = parseInt(currentMaxCode.replace(/\D/g, ""), 10) || 0;
  let nextNumber = currentNumber + 1;
  const formattedNumber = nextNumber.toString().padStart(4, '0'); // '000001'
  return `${prefix}-${formattedNumber}`;
}
