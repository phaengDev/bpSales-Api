import { DataTypes, Model, Optional } from "sequelize";
import {sequelize} from "../config/database";
import BillsaleList from "./BillsaleList";

// Define the attributes interface
interface UseToppingAttributes {
  _uuid: number;
  salesid?: number | null;
  // productid?: number | null;
  toppingName?: string | null;
  prices?: number | null;
  quantity?: number | null;
  status?: number | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

// Optional fields when creating a new UseTopping
type UseToppingCreationAttributes = Optional<UseToppingAttributes, "_uuid">;

export class UseTopping extends Model<UseToppingAttributes, UseToppingCreationAttributes>
  implements UseToppingAttributes {
  public _uuid!: number;
  public salesid!: number | null;
  // public productid!: number | null;
  public toppingName!: string | null;
  public prices!: number | null;
  public quantity!: number | null;
  public status!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Define model
UseTopping.init(
  {
    _uuid: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    salesid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    // productid: {
    //   type: DataTypes.INTEGER,
    //   allowNull: true,
    // },
    toppingName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    prices: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
    },
    quantity: {
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
    tableName: "tbl_usetopping",
    modelName: "UseTopping",
    timestamps: true, // Sequelize auto manages createdAt / updatedAt
  }
);

  // UseTopping.sync();
// UseTopping.belongsTo(Products, { foreignKey: "productid", as: "product" });
UseTopping.belongsTo(BillsaleList, { foreignKey: "salesid", as: "topping" });
BillsaleList.hasOne(UseTopping, { foreignKey: "salesid", as: "topping" });

export default UseTopping;
