"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartImport = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class CartImport extends sequelize_1.Model {
}
exports.CartImport = CartImport;
// Define model
CartImport.init({
    cart_uuid: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    productid: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
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
    tableName: "tbl_cart_import",
    modelName: "CartImport",
    timestamps: true, // Sequelize auto manages createdAt / updatedAt
});
exports.default = CartImport;
