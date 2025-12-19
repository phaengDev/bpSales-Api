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
  status?: number | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}


// Optional fields when creating a new Products
type ProductsCreationAttributes = Optional<ProductsAttributes, "product_uuid">;

export class Products extends Model<ProductsAttributes, ProductsCreationAttributes>
  implements ProductsAttributes {
  public product_uuid!: number;
  public sku!: string | null;
  public barcode!: string | null;
  public shopid!: number | null;
  public images!: string | null;
  public productName!: string | null;
  public brandid!: number | null;
  public uniteid!: number | null;
  public sizeid!: number | null;
  public quantity!: number | null;
  public buyPrices!: number | null;
  public sellPrices!: number | null;
  public stock!: number | null;
  public description!: string | null;
  public status!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
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