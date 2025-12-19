"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Categories = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Categories extends sequelize_1.Model {
}
exports.Categories = Categories;
// Define model
Categories.init({
    cate_uuid: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    cateCode: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: true,
    },
    shopid: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    cateName: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
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
    tableName: "tbl_categories",
    modelName: "Categories",
    timestamps: true, // Sequelize auto manages createdAt / updatedAt
});
exports.default = Categories;
