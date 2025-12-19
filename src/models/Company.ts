import { DataTypes, Model, Optional } from "sequelize";
import {sequelize} from "../config/database";

// Define the attributes interface
interface CompanyAttributes {
  _uuid: number;
  logos?: string | null;
  names?: string | null;
  description?: Text | null;
  status?: number | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

// Optional fields when creating a new Company
type CompanyCreationAttributes = Optional<CompanyAttributes, "_uuid">;

export class Company extends Model<CompanyAttributes, CompanyCreationAttributes>
  implements CompanyAttributes {
  public _uuid!: number;
  public logos!: string | null;
  public names!: string | null;
  public description!: Text | null;
  public status!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Define model
Company.init(
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
    names: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
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
    tableName: "tbl_company",
    modelName: "Company",
    timestamps: true, // Sequelize auto manages createdAt / updatedAt
  }
);

export default Company;