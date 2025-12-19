import { DataTypes, Model, Optional } from "sequelize";
import {sequelize} from "../config/database";
import Categories from "./Categories";
// Define the attributes interface
interface BrandsAttributes {
  brand_uuid: number;
  brandCode?: string | null;
  categorieid?: number | null;
  brandName?: string | null;
  description?: string | null;
  status?: number | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

// Optional fields when creating a new Brands
type BrandsCreationAttributes = Optional<BrandsAttributes, "brand_uuid">;
export class Brands extends Model<BrandsAttributes, BrandsCreationAttributes>
  implements BrandsAttributes {
  public brand_uuid!: number;
  public brandCode!: string | null;
  public categorieid!: number | null;
  public brandName!: string | null;
  public description!: string | null;
  public status!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}
// Define model
Brands.init(
  {
    brand_uuid: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    brandCode: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    categorieid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    brandName: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 1,
    },
    description: {
      type: DataTypes.STRING,
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
    tableName: "tbl_brands",
    modelName: "Brands",
    timestamps: true, // Sequelize auto manages createdAt / updatedAt
  }
);
Brands.belongsTo(Categories, { foreignKey: "categorieid",as: "category" });
export default Brands;