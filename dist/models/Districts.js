"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.District = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const Provinces_1 = __importDefault(require("./Provinces"));
// ✅ Define model
class District extends sequelize_1.Model {
}
exports.District = District;
District.init({
    _uuid: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    provinceid: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    distName: {
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
    modelName: "District",
    tableName: "tbl_district",
    timestamps: true,
});
// ✅ Sync model
// try {
//     District.sync();
//     console.log("✅ District model synced");
// }
// catch (error) {
//     console.log(error);
// }
// ✅ Export model
District.belongsTo(Provinces_1.default, { foreignKey: "provinceid", as: "province" });
exports.default = District;
