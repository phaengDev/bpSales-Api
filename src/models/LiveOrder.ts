import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import LiveSession from "./LiveSession";
import Shops from "./Shops.Model";
import Customer from "./Customer";
import Users from "./Users.Model";
// Define the attributes interface
interface LiveOrderAttributes {
  order_uuid: number;
  liveid?: number | null;
  shopid?: number | null;
  orderNo?: string | null;         // ເລກໃບຈອງ ເຊັ່ນ LV250818-1
  customerid?: number | null;      // ລູກຄ້າໃນລະບົບ (ຖ້າຈັບຄູ່ໄດ້)
  fb_userid?: string | null;       // id ຜູ້ຄອມເມັນໃນ Facebook
  customerName?: string | null;
  phone?: string | null;
  address?: string | null;
  total_qty?: number | null;
  total_amount?: number | null;
  discount?: number | null;
  shipping_fee?: number | null;
  balance_total?: number | null;
  status?: number | null;          // 1=ຈອງ(CF), 2=ຢືນຢັນ, 3=ຊຳລະແລ້ວ, 4=ສົ່ງແລ້ວ, 9=ຍົກເລີກ
  billid?: number | null;          // ອ້າງອິງບິນຂາຍຈິງ ເມື່ອແປງເປັນບິນແລ້ວ
  description?: string | null;
  createby?: number | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

// Optional fields when creating a new LiveOrder
type LiveOrderCreationAttributes = Optional<LiveOrderAttributes, "order_uuid">;

export class LiveOrder extends Model<LiveOrderAttributes, LiveOrderCreationAttributes>
  implements LiveOrderAttributes {
  declare order_uuid: number;
  declare liveid: number | null;
  declare shopid: number | null;
  declare orderNo: string | null;
  declare customerid: number | null;
  declare fb_userid: string | null;
  declare customerName: string | null;
  declare phone: string | null;
  declare address: string | null;
  declare total_qty: number | null;
  declare total_amount: number | null;
  declare discount: number | null;
  declare shipping_fee: number | null;
  declare balance_total: number | null;
  declare status: number | null;
  declare billid: number | null;
  declare description: string | null;
  declare createby: number | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

// Define model
LiveOrder.init(
  {
    order_uuid: {
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
    orderNo: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    customerid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    fb_userid: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    customerName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    total_qty: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    total_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
    },
    discount: {
      type: DataTypes.DECIMAL(13, 2),
      allowNull: true,
      defaultValue: 0,
    },
    shipping_fee: {
      type: DataTypes.DECIMAL(13, 2),
      allowNull: true,
      defaultValue: 0,
    },
    balance_total: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
    },
    billid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    createby: {
      type: DataTypes.INTEGER,
      allowNull: true,
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
    tableName: "tbl_live_order",
    modelName: "LiveOrder",
    timestamps: true,
  }
);

LiveOrder.belongsTo(LiveSession, { foreignKey: "liveid", as: "live" });
LiveSession.hasMany(LiveOrder, { foreignKey: "liveid", as: "orders" });
LiveOrder.belongsTo(Shops, { foreignKey: "shopid", as: "shop" });
LiveOrder.belongsTo(Customer, { foreignKey: "customerid", as: "customer" });
LiveOrder.belongsTo(Users, { foreignKey: "createby", as: "user" });

export default LiveOrder;
