"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Suppliers = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const Country_1 = __importDefault(require("./Country"));
class Suppliers extends sequelize_1.Model {
}
exports.Suppliers = Suppliers;
// Define model
Suppliers.init({
    _uuid: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    logos: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    shopid: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    supplierName: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    phone: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    countryid: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    villageName: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    districtName: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    provinceName: {
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
    tableName: "tbl_suppliers",
    modelName: "Suppliers",
    timestamps: true, // Sequelize auto manages createdAt / updatedAt
});
Suppliers.belongsTo(Country_1.default, { foreignKey: "countryid", as: "country" });
exports.default = Suppliers;
