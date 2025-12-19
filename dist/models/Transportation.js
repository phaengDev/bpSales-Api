"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transportation = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const Billsales_1 = __importDefault(require("./Billsales"));
const Company_1 = __importDefault(require("./Company"));
const Provinces_1 = __importDefault(require("./Provinces"));
class Transportation extends sequelize_1.Model {
}
exports.Transportation = Transportation;
// Define model
Transportation.init({
    _uuid: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    billsaleid: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    companyid: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    title: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    fullnames: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    phone: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: true,
    },
    provinceid: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    branch_name: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    cod: {
        type: sequelize_1.DataTypes.DECIMAL(12, 2),
        allowNull: true,
    },
    status_pay: {
        type: sequelize_1.DataTypes.INTEGER,
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
    tableName: "tbl_transportation",
    modelName: "Transportation",
    timestamps: true, // Sequelize auto manages createdAt / updatedAt
});
Transportation.belongsTo(Company_1.default, { foreignKey: "companyid", as: "company" });
Transportation.belongsTo(Provinces_1.default, { foreignKey: "provinceid", as: "province" });
Billsales_1.default.hasOne(Transportation, {
    foreignKey: "billsaleid",
    as: "transport"
});
exports.default = Transportation;
