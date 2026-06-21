import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import Brands from "./Brands";
import Sizes from "./Sizes";
import Units from "./Units";
import Wholesale from './Wholesale';
// Define the attributes interface
interface ProductsAttributes {
  product_uuid: number;
  sku?: string | null;
  barcode?: string | null;
  shopid?: number | null;
  images?: string | null;
  productName?: string | null;
  brandid?: number | null;
  uniteid?: number | null;
  sizeid?: number | null;
  quantity?: number | null;
  buyPrices?: number | null;
  sellPrices?: number | null;
  stock?: number | null;
  description?: string | null;
  usage?: number | null;
  status?: number | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}


// Optional fields when creating a new Products
type ProductsCreationAttributes = Optional<ProductsAttributes, "product_uuid">;

export class Products extends Model<ProductsAttributes, ProductsCreationAttributes>
  implements ProductsAttributes {
  declare product_uuid: number;
  declare sku: string | null;
  declare barcode: string | null;
  declare shopid: number | null;
  declare images: string | null;
  declare productName: string | null;
  declare brandid: number | null;
  declare uniteid: number | null;
  declare sizeid: number | null;
  declare quantity: number | null;
  declare buyPrices: number | null;
  declare sellPrices: number | null;
  declare stock: number | null;
  declare description: string | null;
  declare usage: number | null;
  declare status: number | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

// Define model
Products.init(
  {
    product_uuid: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    sku: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    barcode: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    shopid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    images: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    productName: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    brandid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    uniteid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    sizeid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    buyPrices: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    sellPrices: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    usage: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
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
    tableName: "tbl_products",
    modelName: "Products",
    timestamps: true, // Sequelize auto manages createdAt / updatedAt
  }
);

Products.belongsTo(Brands, { foreignKey: "brandid", as: "brand" });
Brands.hasMany(Products, { foreignKey: "brandid", as: "products" });

Products.belongsTo(Sizes, { foreignKey: "sizeid", as: "size" });
Products.belongsTo(Units, { foreignKey: "uniteid", as: "unit" });
Products.hasMany(Wholesale, { foreignKey: "productid", as: "price" });
export default Products;