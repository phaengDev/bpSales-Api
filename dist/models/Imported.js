"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Imported = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
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
    sell_price: {
        type: sequelize_1.DataTypes.DECIMAL(12, 2),
        allowNull: true,
    },
    sell_price_new: {
        type: sequelize_1.DataTypes.DECIMAL(12, 2),
        allowNull: true,
    },
    discount: {
        type: sequelize_1.DataTypes.DECIMAL(12, 2),
        allowNull: true,
    },
    buy_price: {
        type: sequelize_1.DataTypes.DECIMAL(12, 2),
        allowNull: true,
    },
    buy_price_new: {
        type: sequelize_1.DataTypes.DECIMAL(12, 2),
        allowNull: true,
    },
    quantity: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    quantity_new: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    descripiton: {
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
    tableName: "tbl_imported",
    modelName: "Imported",
    timestamps: true, // Sequelize auto manages createdAt / updatedAt
});
exports.default = Imported;
