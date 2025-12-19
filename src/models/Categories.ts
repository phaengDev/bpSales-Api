import { DataTypes, Model, Optional } from "sequelize";
import {sequelize} from "../config/database";

// Define the attributes interface
interface CategoriesAttributes {
  cate_uuid: number;
  cateCode?: string | null;
  shopid?: number | null;
  cateName?: string | null;
  description?: string | null;
  status?: number | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

// Optional fields when creating a new Categories
type CategoriesCreationAttributes = Optional<CategoriesAttributes, "cate_uuid">;

export class Categories extends Model<CategoriesAttributes, CategoriesCreationAttributes>
  implements CategoriesAttributes {
  public cate_uuid!: number;
  public cateCode!: string | null;
  public shopid!: number | null;
  public cateName!: string | null;
  public description!: string | null;
  public status!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Define model
Categories.init(
  {
    cate_uuid: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    cateCode: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    shopid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    cateName: {
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
    tableName: "tbl_categories",
    modelName: "Categories",
    timestamps: true, // Sequelize auto manages createdAt / updatedAt
  }
);

export default Categories;