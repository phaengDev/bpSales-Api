"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Imported = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const Products_1 = __importDefault(require("./Products"));
const Users_1 = __importDefault(require("./Users"));
class Imported extends sequelize_1.Model {
}
exports.Imported = Imported;
// Define model
Imported.init({
    import_uuid: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    productid: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    sell_price_old: {
        type: sequelize_1.DataTypes.DECIMAL(12, 2),
        allowNull: true,
    },
    sell_price: {
        type: sequelize_1.DataTypes.DECIMAL(12, 2),
        allowNull: true,
    },
    discount: {
        type: sequelize_1.DataTypes.DECIMAL(12, 2),
        allowNull: true,
    },
    buy_price_old: {
        type: sequelize_1.DataTypes.DECIMAL(12, 2),
        allowNull: true,
    },
    buy_price: {
        type: sequelize_1.DataTypes.DECIMAL(12, 2),
        allowNull: true,
    },
    quantity_old: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    quantity: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    descripiton: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    types: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1,
    },
    createbyid: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
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
    tableName: "tbl_imported",
    modelName: "Imported",
    timestamps: true, // Sequelize auto manages createdAt / updatedAt
});
Imported.belongsTo(Products_1.default, { foreignKey: 'productid', as: 'product' });
Imported.belongsTo(Users_1.default, { foreignKey: 'createbyid', as: 'user' });
exports.default = Imported;
