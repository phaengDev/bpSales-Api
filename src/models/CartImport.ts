import { DataTypes, Model, Optional } from "sequelize";
import {sequelize} from "../config/database";
import Products from "./Products";
// Define the attributes interface
interface CartImportAttributes {
  _uuid: number;
  productid?: number | null;
  userbyid?: number | null;
  status?: number | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

// Optional fields when creating a new CartImport
type CartImportCreationAttributes = Optional<CartImportAttributes, "_uuid">;

export class CartImport extends Model<CartImportAttributes, CartImportCreationAttributes>
  implements CartImportAttributes {
  public _uuid!: number;
  public productid!: number | null;
  public userbyid!: number | null;
  public status!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Define model
CartImport.init(
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
    userbyid: {
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
    tableName: "tbl_cart_import",
    modelName: "CartImport",
    timestamps: true, // Sequelize auto manages createdAt / updatedAt
  }
);

CartImport.belongsTo(Products, { foreignKey: "productid",as: "product" });
export default CartImport;