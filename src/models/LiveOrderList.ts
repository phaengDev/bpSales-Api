import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import LiveOrder from "./LiveOrder";
import LiveProduct from "./LiveProduct";
import Products from "./Products";
// Define the attributes interface
interface LiveOrderListAttributes {
  _uuid: number;
  orderid?: number | null;
  liveid?: number | null;
  liveproductid?: number | null;
  productid?: number | null;
  code?: string | null;            // ລະຫັດ CF ຕອນສັ່ງ
  productName?: string | null;     // ສຳເນົາຊື່ສິນຄ້າ
  quantity?: number | null;
  price?: number | null;
  balance_total?: number | null;   // quantity × price
  commentid?: string | null;       // ຄອມເມັນຕົ້ນທາງ (ກັນບັນທຶກຊ້ຳ)
  deductStock?: number | null;     // ຄ່າທີ່ຕັ້ງໄວ້ຕອນສັ່ງ
  stock_moved?: number | null;     // 1=ຕັດສະຕ໋ອກແລ້ວ
  status?: number | null;          // 1=ປົກກະຕິ, 9=ຍົກເລີກ
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

// Optional fields when creating a new LiveOrderList
type LiveOrderListCreationAttributes = Optional<LiveOrderListAttributes, "_uuid">;

export class LiveOrderList extends Model<LiveOrderListAttributes, LiveOrderListCreationAttributes>
  implements LiveOrderListAttributes {
  declare _uuid: number;
  declare orderid: number | null;
  declare liveid: number | null;
  declare liveproductid: number | null;
  declare productid: number | null;
  declare code: string | null;
  declare productName: string | null;
  declare quantity: number | null;
  declare price: number | null;
  declare balance_total: number | null;
  declare commentid: string | null;
  declare deductStock: number | null;
  declare stock_moved: number | null;
  declare status: number | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

// Define model
LiveOrderList.init(
  {
    _uuid: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
    },
    orderid: {
      // ຕ້ອງເປັນ UNSIGNED ໃຫ້ກົງກັບ tbl_live_order.order_uuid (FK)
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    liveid: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    liveproductid: {
      // ຕ້ອງເປັນ UNSIGNED ໃຫ້ກົງກັບ tbl_live_product._uuid (FK)
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    productid: {
      // ຕ້ອງເປັນ UNSIGNED ໃຫ້ກົງກັບ tbl_products.product_uuid
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    code: {
      type: DataTypes.STRING(6),
      allowNull: true,
    },
    productName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
    },
    price: {
      type: DataTypes.DECIMAL(13, 2),
      allowNull: true,
      defaultValue: 0,
    },
    balance_total: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
    },
    commentid: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    deductStock: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
    },
    stock_moved: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
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
    tableName: "tbl_live_order_list",
    modelName: "LiveOrderList",
    timestamps: true,
    indexes: [
      { name: "uq_live_order_comment", unique: true, fields: ["liveid", "commentid", "code"] },
    ],
  }
);
LiveOrderList.belongsTo(LiveOrder, { foreignKey: "orderid", as: "order" });
LiveOrder.hasMany(LiveOrderList, { foreignKey: "orderid", as: "orderList" });
LiveOrderList.belongsTo(LiveProduct, { foreignKey: "liveproductid", as: "liveProduct" });
// tbl_products ຖືກຈັດການນອກ repo ນີ້ → ບໍ່ສ້າງ FK constraint
LiveOrderList.belongsTo(Products, { foreignKey: "productid", as: "product", constraints: false });

export default LiveOrderList;
