import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import Districts from "./Districts";

// Define the attributes interface
interface CustomerAttributes {
    _uuid: number;
    codes?: string | null;
    shopid?: number | null;
    profiles?: string | null;
    gender?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    phone?: string | null;
    email?: string | null;
    villages?: string | null;
    districtid?: number | null;
    types?: number | null; // ===== 1 = ລູກຄ້າທົ່ວໄປ, 2 = ຕົວແທນ 3= ສະມາຊິກ
    percent?: number | null;
    description?: string | null;
    status?: number | null;
    createdAt?: Date | null;
    updatedAt?: Date | null;
}

// Optional fields when creating a new Customer
type CustomerCreationAttributes = Optional<CustomerAttributes, "_uuid">;
export class Customer extends Model<CustomerAttributes, CustomerCreationAttributes>
    implements CustomerAttributes {
    declare _uuid: number;
    declare codes: string | null;
    declare shopid: number | null;
    declare profiles: string | null;
    declare gender: string | null;
    declare first_name: string | null;
    declare last_name: string | null;
    declare phone: string | null;
    declare email: string | null;
    declare villages: string | null;
    declare districtid: number | null;
    declare types: number | null;
    declare percent: number | null;
    declare description: string | null;
    declare status: number | null;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}


// Define model
Customer.init(
    {
        _uuid: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        codes: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        shopid: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        profiles: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        gender: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        first_name: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        last_name: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        phone: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        villages: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        districtid: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        types: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        percent: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        description: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        status: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 1,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        tableName: "tbl_customer",
        modelName: "Customer",
        timestamps: true, // Sequelize auto manages createdAt / updatedAt
    }
);

Customer.belongsTo(Districts, { foreignKey: "districtid",as: "district" });
export default Customer;