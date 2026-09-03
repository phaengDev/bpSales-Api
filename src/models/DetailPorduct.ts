import { DataTypes, Model, Optional } from "sequelize";
import {sequelize} from "../config/database";
import Products from "./Products";
// Define the attributes interface
interface DetailPorductAttributes {
  _uuid: number;
  productid?: number | null;
  title?: string | null;
  name?: string | null;
  status?: number | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

// Optional fields when creating a new DetailPorduct
type DetailPorductCreationAttributes = Optional<DetailPorductAttributes, "_uuid">;

export class DetailPorduct extends Model<DetailPorductAttributes, DetailPorductCreationAttributes>
  implements DetailPorductAttributes {
  public _uuid!: number;
  public productid!: number | null;
  public title!: string | null;
  public name!: string | null;
  public status!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Define model
DetailPorduct.init(
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
    title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    name: {
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
    tableName: "tbl_detail_product",
    modelName: "DetailPorduct",
    timestamps: true, // Sequelize auto manages createdAt / updatedAt
  }
);
async function sync() {
    await DetailPorduct.sync();
}
sync();

DetailPorduct.belongsTo(Products, { foreignKey: "productid", as: "product" });
Products.hasMany(DetailPorduct, { foreignKey: "productid", as: "details" });

export default DetailPorduct;