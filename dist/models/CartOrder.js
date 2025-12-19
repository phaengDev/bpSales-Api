"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartOrder = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const Products_1 = __importDefault(require("./Products"));
class CartOrder extends sequelize_1.Model {
}
exports.CartOrder = CartOrder;
// Define model
CartOrder.init({
    cart_uuid: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    productid: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    quantity: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    salePrices: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1,
    },
    userbyid: {
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
    tableName: "tbl_cart_order",
    modelName: "CartOrder",
    timestamps: true, // Sequelize auto manages createdAt / updatedAt
});
// Export model
CartOrder.belongsTo(Products_1.default, {
    foreignKey: "productid",
    as: "product",
});
exports.default = CartOrder;
