"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Shops = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const Districts_1 = __importDefault(require("./Districts"));
class Shops extends sequelize_1.Model {
}
exports.Shops = Shops;
// Define model
Shops.init({
    shop_uuid: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    shopName: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    phone: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    village: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    districtid: {
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
    tableName: "tbl_shops",
    modelName: "Shops",
    timestamps: true, // Sequelize auto manages createdAt / updatedAt
});
Shops.belongsTo(Districts_1.default, { foreignKey: "districtid", as: "district" });
exports.default = Shops;
