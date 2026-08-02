"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Toppings = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const Products_1 = __importDefault(require("./Products"));
class Toppings extends sequelize_1.Model {
}
exports.Toppings = Toppings;
// Define model
Toppings.init({
    _uuid: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    productid: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    toppingName: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    prices: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
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
    tableName: "tbl_toppings",
    modelName: "Toppings",
    timestamps: true, // Sequelize auto manages createdAt / updatedAt
});
async function sync() {
    await Toppings.sync();
}
sync();
Toppings.belongsTo(Products_1.default, { foreignKey: "productid", as: "product" });
Products_1.default.hasMany(Toppings, { foreignKey: "productid", as: "toppings" });
exports.default = Toppings;
