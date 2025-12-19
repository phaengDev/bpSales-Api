import { DataTypes, Model, Optional } from "sequelize";
import {sequelize} from "../config/database";
import Billsales from "./Billsales";
import Products from "./Products";
// Define the attributes interface
interface BillsaleListAttributes {
  _uuid: number;
  billsaleid?: number | null;
  productid?: number | null;
  price_buy?: number | null;  
  price_sales?: number | null;
  discount?: number | null;
  quantity?: number | null;
  free?: number | null;
  status?: number | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

// Optional fields when creating a new BillsaleList
type BillsaleListCreationAttributes = Optional<BillsaleListAttributes, "_uuid">;

export class BillsaleList extends Model<BillsaleListAttributes, BillsaleListCreationAttributes>
  implements BillsaleListAttributes {
  public _uuid!: number;
  public billsaleid!: number | null;
  public productid!: number | null;
  public price_buy!: number | null;
  public price_sales!: number | null;
  public discount!: number | null;
  public quantity!: number | null;
  public free!: number | null;
  public status!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Define model
BillsaleList.init(
  {
    _uuid: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    billsaleid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    productid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    price_buy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
    },
    price_sales: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
    },
    discount: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    free: {
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
    tableName: "tbl_billsale_list",
    modelName: "BillsaleList",
    timestamps: true, // Sequelize auto manages createdAt / updatedAt
  }
);

BillsaleList.belongsTo(Billsales, { foreignKey: "billsaleid",as: "bill" });
Billsales.hasMany(BillsaleList, { foreignKey: "billsaleid",as: "billList" });
BillsaleList.belongsTo(Products, { foreignKey: "productid",as: "product" });

export default BillsaleList;