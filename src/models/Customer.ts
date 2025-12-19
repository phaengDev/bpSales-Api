import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import Districts from "./Districts";

// Define the attributes interface
interface CustomerAttributes {
    _uuid: number;
    codes?: string | null;
    profiles?: string | null;
    custName?: string | null;
    phones?: string | null;
    villages?: string | null;
    districtid?: number | null;
    types?: number | null;
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
    public _uuid!: number;
    public codes!: string | null;
    public profiles!: string | null;
    public custName!: string | null;
    public phones!: string | null;
    public villages!: string | null;
    public districtid!: number | null;
    public types!: number | null;
    public percent!: number | null;
    public description!: string | null;
    public status!: number | null;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
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
        profiles: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        custName: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        phones: {
            type: DataTypes.STRING(20),
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