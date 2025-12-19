"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Company = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Company extends sequelize_1.Model {
}
exports.Company = Company;
// Define model
Company.init({
    _uuid: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    logos: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    names: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: "tbl_company",
    modelName: "Company",
    timestamps: true, // Sequelize auto manages createdAt / updatedAt
});
exports.default = Company;
