"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Promotion = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const Products_1 = __importDefault(require("./Products"));
class Promotion extends sequelize_1.Model {
}
exports.Promotion = Promotion;
// Define model
Promotion.init({
    _uuid: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    productid: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    qty_buy: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    qty_free: {
        type: sequelize_1.DataTypes.INTEGER,
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
    tableName: "tbl_promotion",
    modelName: "Promotion",
    timestamps: true, // Sequelize auto manages createdAt / updatedAt
});
Promotion.belongsTo(Products_1.default, {
    foreignKey: "productid",
    as: "product",
});
Products_1.default.hasMany(Promotion, {
    foreignKey: "productid",
    as: "promotion",
});
exports.default = Promotion;
