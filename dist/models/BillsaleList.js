"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillsaleList = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const Billsales_1 = __importDefault(require("./Billsales"));
const Products_1 = __importDefault(require("./Products"));
class BillsaleList extends sequelize_1.Model {
}
exports.BillsaleList = BillsaleList;
// Define model
BillsaleList.init({
    _uuid: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    billsaleid: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    productid: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    price_buy: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1,
    },
    price_sales: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1,
    },
    quantity: {
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
    tableName: "tbl_billsale_list",
    modelName: "BillsaleList",
    timestamps: true, // Sequelize auto manages createdAt / updatedAt
});
BillsaleList.belongsTo(Billsales_1.default, { foreignKey: "billsaleid", as: "bill" });
Billsales_1.default.hasMany(BillsaleList, { foreignKey: "billsaleid", as: "billList" });
BillsaleList.belongsTo(Products_1.default, { foreignKey: "productid", as: "product" });
exports.default = BillsaleList;
