"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Purchase = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Purchase extends sequelize_1.Model {
}
exports.Purchase = Purchase;
// Define model
Purchase.init({
    _uuid: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    supplierid: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    order_no: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    balance_order: {
        type: sequelize_1.DataTypes.DECIMAL(12, 2),
        allowNull: true,
    },
    actual_balance: {
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
    total_orders: {
        type: sequelize_1.DataTypes.DECIMAL(12, 2),
        allowNull: true,
    },
    description: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    import: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    userName: {
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
    tableName: "tbl_purchase",
    modelName: "Purchase",
    timestamps: true, // Sequelize auto manages createdAt / updatedAt
});
exports.default = Purchase;
