import { DataTypes, Model, Optional } from "sequelize";
import {sequelize} from "../config/database";
import Products from "./Products";
// Define the attributes interface
interface CartOrderAttributes {
  cart_uuid: number;
  productid?: number | null;
  quantity?: number | null;
  salePrices?: number | null;
  userbyid?: number | null;
  status?: number | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

// Optional fields when creating a new CartOrder
type CartOrderCreationAttributes = Optional<CartOrderAttributes, "cart_uuid">;

export class CartOrder extends Model<CartOrderAttributes, CartOrderCreationAttributes>
  implements CartOrderAttributes {
  public cart_uuid!: number;
  public productid!: number | null;
  public quantity!: number | null;
  public salePrices!: number | null;
  public userbyid!: number | null;
  public status!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Define model
CartOrder.init(
  {
    cart_uuid: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    productid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    salePrices: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
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
    tableName: "tbl_cart_order",
    modelName: "CartOrder",
    timestamps: true, // Sequelize auto manages createdAt / updatedAt
  }
);

// Export model
CartOrder.belongsTo(Products, {
  foreignKey: "productid",
  as: "product",
})
export default CartOrder;