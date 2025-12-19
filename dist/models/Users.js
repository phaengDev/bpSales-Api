"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Users = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const Shops_1 = __importDefault(require("./Shops"));
class Users extends sequelize_1.Model {
}
exports.Users = Users;
// Define model
Users.init({
    user_uuid: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    shopid: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    userName: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    phones: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    password: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    typeuser: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    created: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    updated: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    deleted: {
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
    tableName: "tbl_users",
    modelName: "Users",
    timestamps: true, // Sequelize auto manages createdAt / updatedAt
});
// Export model
Users.belongsTo(Shops_1.default, { foreignKey: "shopid", as: "shop" });
exports.default = Users;
