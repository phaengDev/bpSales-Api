"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseList = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const Products_1 = __importDefault(require("./Products"));
class PurchaseList extends sequelize_1.Model {
}
exports.PurchaseList = PurchaseList;
// Define model
PurchaseList.init({
    _uuid: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    purchaseid: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    productid: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    prices_order: {
        type: sequelize_1.DataTypes.DECIMAL(12, 2),
        allowNull: true,
    },
    prices_import: {
        type: sequelize_1.DataTypes.DECIMAL(12, 2),
        allowNull: true,
    },
    vat: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    discount: {
        type: sequelize_1.DataTypes.DECIMAL(12, 2),
        allowNull: true,
    },
    qty_order: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    qty_import: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    balance_total: {
        type: sequelize_1.DataTypes.DECIMAL(12, 2),
        allowNull: true,
    },
    import: {
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
    tableName: "tbl_purchase_list",
    modelName: "PurchaseList",
    timestamps: true, // Sequelize auto manages createdAt / updatedAt
});
PurchaseList.belongsTo(Products_1.default, { foreignKey: "productid", as: "product" });
exports.default = PurchaseList;
