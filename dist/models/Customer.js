"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Customer = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const Districts_1 = __importDefault(require("./Districts"));
class Customer extends sequelize_1.Model {
}
exports.Customer = Customer;
// Define model
Customer.init({
    _uuid: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    codes: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    profiles: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    custName: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    phones: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: true,
    },
    villages: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    districtid: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    types: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    percent: {
        type: sequelize_1.DataTypes.INTEGER,
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
    tableName: "tbl_customer",
    modelName: "Customer",
    timestamps: true, // Sequelize auto manages createdAt / updatedAt
});
Customer.belongsTo(Districts_1.default, { foreignKey: "districtid", as: "district" });
exports.default = Customer;
