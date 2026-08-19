import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import Shops from "./Shops.Model";
import Users from "./Users.Model";
// Define the attributes interface
interface LiveSessionAttributes {
  live_uuid: number;
  shopid?: number | null;
  title?: string | null;
  platform?: string | null;
  videoid?: string | null;
  videoUrl?: string | null;
  pageid?: string | null;
  accessToken?: string | null;
  status?: number | null;          // 1=ກຳລັງໄລ໌, 2=ຈົບແລ້ວ, 9=ຍົກເລີກ
  startedAt?: Date | null;
  endedAt?: Date | null;
  viewers_peak?: number | null;
  viewers_last?: number | null;
  total_products?: number | null;  // ເອົາສິນຄ້າເຂົ້າໄລ໌ຈັກລາຍການ
  total_comments?: number | null;
  total_cf?: number | null;        // ຄອມເມັນທີ່ເປັນ CF
  total_orders?: number | null;
  total_qty?: number | null;
  total_amount?: number | null;
  description?: string | null;
  createby?: number | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

// Optional fields when creating a new LiveSession
type LiveSessionCreationAttributes = Optional<LiveSessionAttributes, "live_uuid">;

export class LiveSession extends Model<LiveSessionAttributes, LiveSessionCreationAttributes>
  implements LiveSessionAttributes {
  declare live_uuid: number;
  declare shopid: number | null;
  declare title: string | null;
  declare platform: string | null;
  declare videoid: string | null;
  declare videoUrl: string | null;
  declare pageid: string | null;
  declare accessToken: string | null;
  declare status: number | null;
  declare startedAt: Date | null;
  declare endedAt: Date | null;
  declare viewers_peak: number | null;
  declare viewers_last: number | null;
  declare total_products: number | null;
  declare total_comments: number | null;
  declare total_cf: number | null;
  declare total_orders: number | null;
  declare total_qty: number | null;
  declare total_amount: number | null;
  declare description: string | null;
  declare createby: number | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

// Define model
LiveSession.init(
  {
    live_uuid: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
    },
    shopid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    platform: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: "facebook",
    },
    videoid: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    videoUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    pageid: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    accessToken: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    endedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    viewers_peak: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    viewers_last: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    total_products: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    total_comments: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    total_cf: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    total_orders: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
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
    tableName: "tbl_live_session",
    modelName: "LiveSession",
    timestamps: true,
  }
);

LiveSession.belongsTo(Shops, { foreignKey: "shopid", as: "shop" });
LiveSession.belongsTo(Users, { foreignKey: "createby", as: "user" });

export default LiveSession;
