"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Products = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const Brands_1 = __importDefault(require("./Brands"));
const Sizes_1 = __importDefault(require("./Sizes"));
const Units_1 = __importDefault(require("./Units"));
const Wholesale_1 = __importDefault(require("./Wholesale"));
class Products extends sequelize_1.Model {
}
exports.Products = Products;
// Define model
Products.init({
    product_uuid: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    sku: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    barcode: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    shopid: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    images: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    productName: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    brandid: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    uniteid: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    sizeid: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    quantity: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    buyPrices: {
        type: sequelize_1.DataTypes.DECIMAL(12, 2),
        allowNull: true,
    },
    sellPrices: {
        type: sequelize_1.DataTypes.DECIMAL(12, 2),
        allowNull: true,
    },
    stock: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1,
    },
    description: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1,
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: "tbl_products",
    modelName: "Products",
    timestamps: true, // Sequelize auto manages createdAt / updatedAt
});
Products.belongsTo(Brands_1.default, { foreignKey: "brandid", as: "brand" });
Brands_1.default.hasMany(Products, { foreignKey: "brandid", as: "products" });
Products.belongsTo(Sizes_1.default, { foreignKey: "sizeid", as: "size" });
Products.belongsTo(Units_1.default, { foreignKey: "uniteid", as: "unit" });
Products.hasMany(Wholesale_1.default, { foreignKey: "productid", as: "price" });
exports.default = Products;
