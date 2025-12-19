"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Provinces = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
// ✅ Define model
class Provinces extends sequelize_1.Model {
}
exports.Provinces = Provinces;
Provinces.init({
    _uuid: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    provinceName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.INTEGER, // ໃຊ້ສະເພາະຕົວເລກ ENUM (0=inactive,1=active)
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
    modelName: "Provinces",
    tableName: "tbl_province",
    timestamps: true,
});
// ✅ Sync model
try {
    Provinces.sync({ force: false });
    console.log("✅ Provinces model synced");
}
catch (error) {
    console.error("❌ Provinces model sync error:", error);
}
// ✅ Export model
exports.default = Provinces;
