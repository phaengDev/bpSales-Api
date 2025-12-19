"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Units = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Units extends sequelize_1.Model {
}
exports.Units = Units;
// Define model
Units.init({
    unit_uuid: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    shopid: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    unitName: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    relationship: {
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
    tableName: "tbl_units",
    modelName: "Units",
    timestamps: true, // Sequelize auto manages createdAt / updatedAt
});
exports.default = Units;
