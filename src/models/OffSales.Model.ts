import { DataTypes, Model, Optional } from "sequelize";
import {sequelize} from "../config/database";
import Users from "./Users.Model";
// Define the attributes interface
interface OffSalesAttributes {
  _uuid: number;
  shopid?: number | null;
  start_date?: Date | null;
  end_date?: Date | null;
  quantity?: number | null;
  balanceTotal?: number | null;
  getCash?: number | null;
  getTransfer?: number | null;
  balance_shop?: number | null;
  balance_online?: number | null;
  description?: string | null;
  createby?: string | null;
  status?: number | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

// Optional fields when creating a new OffSales
type OffSalesCreationAttributes = Optional<OffSalesAttributes, "_uuid">;

export class OffSales extends Model<OffSalesAttributes, OffSalesCreationAttributes>
  implements OffSalesAttributes {
  declare _uuid: number;
  declare shopid: number | null;
  declare start_date: Date | null;
  declare end_date: Date | null;
  declare quantity: number | null; // ຈຳນວນບິນທັງໝົດ
  declare balanceTotal: number | null; // ເປັນເງິນທັງໝົດ
  declare getCash: number | null; // ສະເພາະເງິນສົດ
  declare getTransfer: number | null; // ສະເພາະເງິນໂອນ
  declare balance_shop: number | null; // ສະເພາະຍອດເງິນຂາຍໜ້າຮ້ານ
  declare balance_online: number | null; // ສະເພາະຍອດເງິນຂາຍອອນໄລນ໌
  declare description: string | null;
  declare status: number | null;
  declare createby: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

// Define model
OffSales.init(
  {
   _uuid: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    shopid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    balanceTotal: {
      type: DataTypes.DECIMAL(13, 2),
      allowNull: true,
      defaultValue: 0,
    },
    getCash: {
      type: DataTypes.DECIMAL(13, 2),
      allowNull: true,
      defaultValue: 0,
    },
    getTransfer: {
      type: DataTypes.DECIMAL(13, 2),
      allowNull: true,
      defaultValue: 0,
    },
    balance_shop: {
      type: DataTypes.DECIMAL(13, 2),
      allowNull: true,
      defaultValue: 0,
    },
    balance_online: {
      type: DataTypes.DECIMAL(13, 2),
      allowNull: true,
      defaultValue: 0,    
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
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
    tableName: "tbl_offsales",
    modelName: "OffSales",
    timestamps: true, // Sequelize auto manages createdAt / updatedAt
  }
);
OffSales.sync();
OffSales.belongsTo(Users, { foreignKey: "createby", as: "user" });
export default OffSales;