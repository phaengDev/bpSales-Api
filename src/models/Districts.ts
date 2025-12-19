import { DataTypes, Model, Optional } from "sequelize";
import {sequelize} from "../config/database";
import Provinces from "./Provinces";

// ✅ Define attributes
interface DistrictAttributes {
    _uuid: number;
    provinceid: number;
    distName: string;
    status: number;
    createdAt: Date;
    updatedAt: Date;
}

export type DistrictCreationAttributes = Optional<DistrictAttributes, "_uuid">;
// ✅ Define model
export class District extends Model<DistrictAttributes, DistrictCreationAttributes> {
    public _uuid!: number;
    public provinceid!: number;
    public distName!: string;
    public status!: number;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

District.init(
    {
        _uuid: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        provinceid: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        distName: {
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
        modelName: "District",
        tableName: "tbl_district",
        timestamps: true,
        }
    );
    // ✅ Sync model
    // try {
    //     District.sync();
    //     console.log("✅ District model synced");
    // }
    // catch (error) {
    //     console.log(error);
    // }

// ✅ Export model
District.belongsTo(Provinces, { foreignKey: "provinceid", as: "province" });
export default District