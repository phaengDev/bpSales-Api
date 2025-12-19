import { DataTypes, Model, Optional } from "sequelize";
import {sequelize} from "../config/database";
import Country from "./Country";
// Define the attributes interface
interface SuppliersAttributes {
  _uuid: number;
  logos?: string | null;
  shopid?: number | null;
  supplierName?: string | null;
  phone?: number | null;
  countryid?: number | null;
  villageName?: string | null;
  districtName?: string | null;
  provinceName?: string | null;
  description?: string | null;
  status?: number | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

// Optional fields when creating a new Suppliers
type SuppliersCreationAttributes = Optional<SuppliersAttributes, "_uuid">;

export class Suppliers extends Model<SuppliersAttributes, SuppliersCreationAttributes>
  implements SuppliersAttributes {
  public _uuid!: number;
  public logos!: string | null;
  public shopid!: number | null;
  public supplierName!: string | null;
  public phone!: number | null;
  public countryid!: number | null;
  public villageName!: string | null;
  public districtName!: string | null;
  public provinceName!: string | null;
  public description!: string | null;
  public status!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Define model
Suppliers.init(
  {
    _uuid: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    logos: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    shopid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    supplierName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    phone: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    countryid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    villageName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    districtName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    provinceName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    description: {
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
    tableName: "tbl_suppliers",
    modelName: "Suppliers",
    timestamps: true, // Sequelize auto manages createdAt / updatedAt
  }
);

Suppliers.belongsTo(Country, { foreignKey: "countryid",as : "country" });

export default Suppliers;