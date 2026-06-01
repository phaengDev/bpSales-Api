import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

// ✅ Define attributes
interface ProvincesAttributes {
    _uuid: number;
    provinceName: string;
    status: number;
    createdAt: Date;
    updatedAt: Date;
}
interface ProvincesCreationAttributes extends Optional<ProvincesAttributes, "_uuid"> { }
// ✅ Define model
export class Provinces extends Model<ProvincesAttributes, ProvincesCreationAttributes> {

    public _uuid!: number;
    public provinceName!: string;
    public status!: number;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Provinces.init(
    {
        _uuid: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        provinceName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.INTEGER, // ໃຊ້ສະເພາະຕົວເລກ ENUM (0=inactive,1=active)
            allowNull: false,
            defaultValue: 1,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        modelName: "Provinces",
        tableName: "tbl_province",
        timestamps: true,
    }

);
// ✅ Sync model
// try {
//     Provinces.sync({ force: false });
//     console.log("✅ Provinces model synced");
// } catch (error) {
//     console.error("❌ Provinces model sync error:", error);
// }

// ✅ Export model
export default Provinces