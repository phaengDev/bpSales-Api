"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Brands = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const Categories_1 = __importDefault(require("./Categories"));
class Brands extends sequelize_1.Model {
}
exports.Brands = Brands;
// Define model
Brands.init({
    brand_uuid: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    brandCode: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    categorieid: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    brandName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        defaultValue: 1,
    },
    description: {
        type: sequelize_1.DataTypes.STRING,
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
    tableName: "tbl_brands",
    modelName: "Brands",
    timestamps: true, // Sequelize auto manages createdAt / updatedAt
});
Brands.belongsTo(Categories_1.default, { foreignKey: "categorieid", as: "category" });
exports.default = Brands;
