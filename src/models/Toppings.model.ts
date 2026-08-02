import { DataTypes, Model, Optional } from "sequelize";
import {sequelize} from "../config/database";
import Products from "./Products";
// Define the attributes interface
interface ToppingsAttributes {
  _uuid: number;
  productid?: number | null;
  toppingName?: string | null;
  prices?: number | null;
  status?: number | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

// Optional fields when creating a new Toppings
type ToppingsCreationAttributes = Optional<ToppingsAttributes, "_uuid">;

export class Toppings extends Model<ToppingsAttributes, ToppingsCreationAttributes>
  implements ToppingsAttributes {
  public _uuid!: number;
  public productid!: number | null;
  public toppingName!: string | null;
  public prices!: number | null;
  public status!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Define model
Toppings.init(
  {
    _uuid: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    productid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    toppingName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    prices: {
      type: DataTypes.DECIMAL(10, 2),
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
    tableName: "tbl_toppings",
    modelName: "Toppings",
    timestamps: true, // Sequelize auto manages createdAt / updatedAt
  }
);
async function sync() {
    await Toppings.sync();
}
sync();

Toppings.belongsTo(Products, { foreignKey: "productid", as: "product" });
Products.hasMany(Toppings, { foreignKey: "productid", as: "toppings" });

export default Toppings;