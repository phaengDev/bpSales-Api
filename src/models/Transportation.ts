import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import Billsales from "./Billsales";
import Company from "./Company";
import Provinces from "./Provinces";
// Define the attributes interface
interface TransportationAttributes {
  _uuid: number;
  shopid?: number | null;
  codebill?: string | null;
  billsaleid?: number | null;
  companyid?: number | null;
  title?: Text | null;
  fullnames?: string | null;
  phone?: string | null;
  provinceid?: number | null;
  branch_name?: string | null;
  cod?: number | null;
  balance?: number | null;
  status_pay?: number | null;
  status?: number | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

// Optional fields when creating a new Transportation
type TransportationCreationAttributes = Optional<TransportationAttributes, "_uuid">;
export class Transportation extends Model<TransportationAttributes, TransportationCreationAttributes>
  implements TransportationAttributes {
  public _uuid!: number;
  public shopid!: number | null;
  public codebill!: string | null;
  public billsaleid!: number | null;
  public companyid!: number | null;
  public title!: Text | null;
  public fullnames!: string | null;
  public phone!: string | null;
  public provinceid!: number | null;
  public branch_name!: string | null;
  public cod!: number | null;
  public balance!: number | null;
  public status_pay!: number | null;
  public status!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Define model
Transportation.init(
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
    codebill: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    billsaleid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    companyid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    fullnames: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    provinceid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    branch_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    cod: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    balance: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    status_pay: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "tbl_transportation",
    modelName: "Transportation",
    timestamps: true, // Sequelize auto manages createdAt / updatedAt
  }
);

Transportation.belongsTo(Company, { foreignKey: "companyid", as: "company" });
Transportation.belongsTo(Provinces, { foreignKey: "provinceid", as: "province" });
Transportation.belongsTo(Billsales, { foreignKey: "billsaleid", as: "billsale" });
Billsales.hasOne(Transportation, {
  foreignKey: "billsaleid",
  as: "transport"
});
export default Transportation;