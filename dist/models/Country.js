"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Country = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Country extends sequelize_1.Model {
}
exports.Country = Country;
// Define model
Country.init({
    _uuid: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    shopid: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    names: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    abbr: {
        type: sequelize_1.DataTypes.STRING(10),
        allowNull: true,
    },
    icons: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    rate: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    genus: {
        type: sequelize_1.DataTypes.STRING(10),
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
    tableName: "tbl_country",
    modelName: "Country",
    timestamps: true, // Sequelize auto manages createdAt / updatedAt
});
exports.default = Country;
