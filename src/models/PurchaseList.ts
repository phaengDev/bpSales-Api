import { DataTypes, Model, Optional } from "sequelize";
import {sequelize} from "../config/database";
import Products from "./Products";

// Define the attributes interface
interface PurchaseListAttributes {
  _uuid: number;
  purchaseid?: number | null;
  productid?: string | null;
  prices_order?: number | null;
  prices_import?: string | null;
  vat?: number | null;
  discount?: string | null;
  qty_order?: number | null;
  qty_import?: number | null;
  balance_total?: number | null;
  import?: number | null;
  status?: number | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

// Optional fields when creating a new PurchaseList
type PurchaseListCreationAttributes = Optional<PurchaseListAttributes, "_uuid">;

export class PurchaseList extends Model<PurchaseListAttributes, PurchaseListCreationAttributes>
  implements PurchaseListAttributes {
  public _uuid!: number;
  public purchaseid!: number | null;
  public productid!: string | null;
  public prices_order!: number | null;
  public prices_import!: string | null;
  public vat!: number | null;
  public discount!: string | null;
  public qty_order!: number | null;
  public qty_import!: number | null;
  public balance_total!: number | null;
  public import!: number | null;
  public status!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Define model
PurchaseList.init(
  {
    _uuid: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    purchaseid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    productid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    prices_order: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    prices_import: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    vat: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    discount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    qty_order: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    qty_import: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    balance_total: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    import: {
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
    tableName: "tbl_purchase_list",
    modelName: "PurchaseList",
    timestamps: true, // Sequelize auto manages createdAt / updatedAt
  }
);

PurchaseList.belongsTo(Products, { foreignKey: "productid" ,as: "product" });
export default PurchaseList;