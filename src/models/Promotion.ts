import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import Products from "./Products";
// Define the attributes interface
interface PromotionAttributes {
  _uuid: number;
  productid?: number | null;
  qty_buy?: number | null;
  qty_free?: number | null;
  status?: number | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

// Optional fields when creating a new Promotion
type PromotionCreationAttributes = Optional<PromotionAttributes, "_uuid">;

export class Promotion extends Model<PromotionAttributes, PromotionCreationAttributes>
  implements PromotionAttributes {
  public _uuid!: number;
  public productid!: number | null;
  public qty_buy!: number | null;
  public qty_free!: number | null;
  public status!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Define model
Promotion.init(
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
    qty_buy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    qty_free: {
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
    tableName: "tbl_promotion",
    modelName: "Promotion",
    timestamps: true, // Sequelize auto manages createdAt / updatedAt
  }
);

Promotion.belongsTo(Products, {
  foreignKey: "productid",
  as: "product",
});

Products.hasMany(Promotion, {
  foreignKey: "productid",
  as: "proms",
});

export default Promotion;