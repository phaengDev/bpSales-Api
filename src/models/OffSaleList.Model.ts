import { DataTypes, Model, Optional } from "sequelize";
import {sequelize} from "../config/database";
import Offsales from "./OffSales.Model";
import Products from "./Products";
// Define the attributes interface
interface OffsaleListAttributes {
  _uuid: number;
  offsaleid?: number | null;
  start_date?: Date | null;
  end_date?: Date | null;
  productid?: number | null;
  quantity?: number | null; // ຈຳນວນຂາຍ
  remaining?: number | null;  // ຈຳນວນຄົງເຫຼືອ
  balance_sales?: number | null;  // ລວມຍອດຂາຍ
  net_profit?: number | null;  // ກຳໄລ່
  status?: number | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

// Optional fields when creating a new BillsaleList
type OffsaleListCreationAttributes = Optional<OffsaleListAttributes, "_uuid">;

export class OffsaleList extends Model<OffsaleListAttributes, OffsaleListCreationAttributes>
  implements OffsaleListAttributes {
  declare _uuid: number;
  declare offsaleid: number | null;
  declare productid: number | null;
  declare quantity: number | null;
  declare remaining: number | null;
  declare balance_sales: number | null;
  declare net_profit: number | null;
  declare status: number | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

// Define model
OffsaleList.init(
  {
    _uuid: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    offsaleid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    productid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    remaining: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    balance_sales: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    net_profit: {
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
    tableName: "tbl_offsale_list",
    modelName: "OffsaleList",
    timestamps: true, // Sequelize auto manages createdAt / updatedAt
  }
);

OffsaleList.sync();

OffsaleList.belongsTo(Offsales, { foreignKey: "offsaleid",as: "offsale" });
Offsales.hasMany(OffsaleList, { foreignKey: "offsaleid",as: "offsaleList" });
OffsaleList.belongsTo(Products, { foreignKey: "productid",as: "product" });

export default OffsaleList;