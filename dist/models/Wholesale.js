"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wholesale = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Wholesale extends sequelize_1.Model {
}
exports.Wholesale = Wholesale;
// Define model
Wholesale.init({
    price_uuid: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    productid: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    typeName: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    prices: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
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
    tableName: "tbl_wholesale",
    modelName: "Wholesale",
    timestamps: true, // Sequelize auto manages createdAt / updatedAt
});
exports.default = Wholesale;
