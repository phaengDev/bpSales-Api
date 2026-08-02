"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Purchase = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const Suppliers_1 = __importDefault(require("./Suppliers"));
const PurchaseList_1 = __importDefault(require("./PurchaseList"));
const Shops_1 = __importDefault(require("./Shops"));
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
    shopid: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    billno: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    supplierid: {
        type: sequelize_1.DataTypes.INTEGER,
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
    imports: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1,
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
Purchase.belongsTo(Shops_1.default, { foreignKey: "shopid", as: "shop" });
Purchase.belongsTo(Suppliers_1.default, { foreignKey: "supplierid", as: "supplier" });
Purchase.hasMany(PurchaseList_1.default, { foreignKey: "purchaseid", as: "list" });
exports.default = Purchase;
