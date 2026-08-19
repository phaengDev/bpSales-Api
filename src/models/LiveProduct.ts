import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import LiveSession from "./LiveSession";
import Products from "./Products";
// Define the attributes interface
interface LiveProductAttributes {
  _uuid: number;
  liveid?: number | null;
  shopid?: number | null;
  productid?: number | null;
  code?: string | null;            // ລະຫັດ CF ທີ່ລູກຄ້າພິມ ເຊັ່ນ A1
  // ຊື່, SKU, ຫົວໜ່ວຍ, ຮູບ, ລາຄາ ແລະ ສະຕ໋ອກ ດຶງຈາກ tbl_products ດ້ວຍ join (productid)
  // ---- ການຕັ້ງຄ່າ CF ----
  deductStock?: number | null;     // 1=CF ແລ້ວຕັດສະຕ໋ອກ, 0=ບໍ່ຕັດ
  limit_qty?: number | null;       // ຈຳກັດຈຳນວນ CF (0=ບໍ່ຈຳກັດ)
  sort?: number | null;
  // ---- ຕົວນັບ ----
  cf_count?: number | null;        // CF ເຂົ້າມາຈັກຄັ້ງ
  cf_qty?: number | null;          // CF ເຂົ້າມາຈັກຊິ້ນ
  reject_qty?: number | null;      // ຖືກປະຕິເສດ ເພາະເກີນຈຳກັດ/ສະຕ໋ອກບໍ່ພໍ
  sold_qty?: number | null;        // ບັນທຶກອໍເດີແລ້ວຈັກຊິ້ນ
  sold_amount?: number | null;
  stock_end?: number | null;       // ສະຕ໋ອກຕອນປິດໄລ໌
  status?: number | null;          // 1=ກຳລັງຂາຍ, 2=ເຕັມ/ໝົດ, 3=ປິດຊົ່ວຄາວ, 9=ເອົາອອກ
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

// Optional fields when creating a new LiveProduct
type LiveProductCreationAttributes = Optional<LiveProductAttributes, "_uuid">;

export class LiveProduct extends Model<LiveProductAttributes, LiveProductCreationAttributes>
  implements LiveProductAttributes {
  declare _uuid: number;
  declare liveid: number | null;
  declare shopid: number | null;
  declare productid: number | null;
  declare code: string | null;
  declare deductStock: number | null;
  declare limit_qty: number | null;
  declare sort: number | null;
  declare cf_count: number | null;
  declare cf_qty: number | null;
  declare reject_qty: number | null;
  declare sold_qty: number | null;
  declare sold_amount: number | null;
  declare stock_end: number | null;
  declare status: number | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

// Define model
LiveProduct.init(
  {
    _uuid: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
    },
    liveid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    shopid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    productid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    code: {
      type: DataTypes.STRING(6),
      allowNull: true,
    },
    deductStock: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
    },
    limit_qty: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    sort: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    cf_count: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    cf_qty: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    reject_qty: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    sold_qty: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    sold_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
    },
    stock_end: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "tbl_live_product",
    modelName: "LiveProduct",
    timestamps: true,
    indexes: [
      { name: "uq_live_product_code", unique: true, fields: ["liveid", "code"] },
    ],
  }
);

LiveProduct.belongsTo(LiveSession, { foreignKey: "liveid", as: "live" });
LiveSession.hasMany(LiveProduct, { foreignKey: "liveid", as: "liveProducts" });
LiveProduct.belongsTo(Products, { foreignKey: "productid", as: "product" });

export default LiveProduct;
