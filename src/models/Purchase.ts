import { DataTypes, Model, Optional } from "sequelize";
import {sequelize} from "../config/database";
import Suppliers from "./Suppliers";
import PurchaseList from "./PurchaseList";
import Shops from "./Shops";
// Define the attributes interface
interface PurchaseAttributes {
  _uuid: number;
  shopid?: number | null;
  billno?: string | null;
  supplierid?: number | null;
  balance_order?: number | null;
  actual_balance?: number | null;
  vat?: number | null;
  discount?: number | null;
  total_orders?: number | null;
  description?: string | null;
  imports?: number | null;
  userName?: string | null;
  status?: number | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

// Optional fields when creating a new user
type PurchaseCreationAttributes = Optional<PurchaseAttributes, "_uuid">;

export class Purchase extends Model<PurchaseAttributes, PurchaseCreationAttributes>
  implements PurchaseAttributes {
  public _uuid!: number;
  public shopid!: number | null;
  public billno!: string | null;
  public supplierid!: number | null;
  public balance_order!: number | null;
  public actual_balance!: number | null;
  public vat!: number | null;
  public discount!: number | null;
  public total_orders!: number | null;
  public description!: string | null;
  public imports!: number | null;
  public userName!: string | null;
  public status!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Define model
Purchase.init(
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
    billno: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    supplierid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    balance_order: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    actual_balance: {
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
    total_orders: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    imports: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
    },
    userName: {
      type: DataTypes.STRING(255),
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
    tableName: "tbl_purchase",
    modelName: "Purchase",
    timestamps: true, // Sequelize auto manages createdAt / updatedAt
  }
);
Purchase.belongsTo(Shops, { foreignKey: "shopid" ,as: "shop" });
Purchase.belongsTo(Suppliers, { foreignKey: "supplierid" ,as: "supplier" });
Purchase.hasMany(PurchaseList, { foreignKey: "purchaseid" ,as: "list" });

export default Purchase;