"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Billsales = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const Country_1 = __importDefault(require("./Country"));
const Shops_1 = __importDefault(require("./Shops"));
class Billsales extends sequelize_1.Model {
}
exports.Billsales = Billsales;
// Define model
Billsales.init({
    bill_uuid: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    billcode: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    billno: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    shopid: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    customerid: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1,
    },
    balanceSale: {
        type: sequelize_1.DataTypes.DECIMAL(13, 2),
        allowNull: true,
    },
    balanceTotal: {
        type: sequelize_1.DataTypes.DECIMAL(13, 2),
        allowNull: true,
    },
    taxBalance: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    discount: {
        type: sequelize_1.DataTypes.DECIMAL(12, 2),
        allowNull: true,
    },
    countryid: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    rate: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    balance_payable: {
        type: sequelize_1.DataTypes.DECIMAL(13, 2),
        allowNull: true,
    },
    getCash: {
        type: sequelize_1.DataTypes.DECIMAL(13, 2),
        allowNull: true,
    },
    getTransfer: {
        type: sequelize_1.DataTypes.DECIMAL(13, 2),
        allowNull: true,
    },
    balance_pays: {
        type: sequelize_1.DataTypes.DECIMAL(12, 2),
        allowNull: true,
    },
    refund: {
        type: sequelize_1.DataTypes.DECIMAL(12, 2),
        allowNull: true,
    },
    typesale: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1,
    },
    statusoff: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1,
    },
    createby: {
        type: sequelize_1.DataTypes.STRING(255),
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
    tableName: "tbl_billsales",
    modelName: "Billsales",
    timestamps: true, // Sequelize auto manages createdAt / updatedAt
});
// export 
Billsales.belongsTo(Country_1.default, { foreignKey: "countryid", as: "country" });
Billsales.belongsTo(Shops_1.default, { foreignKey: "shopid", as: "shop" });
exports.default = Billsales;
