import { DataTypes, Model, Optional } from "sequelize";
import {sequelize} from "../config/database";

// Define the attributes interface
interface UnitsAttributes {
  unit_uuid: number;
  shopid?: number | null;
  unitName?: string | null;
  relationship?: number | null;
  status?: number | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

// Optional fields when creating a new Units
type UnitsCreationAttributes = Optional<UnitsAttributes, "unit_uuid">;

export class Units extends Model<UnitsAttributes, UnitsCreationAttributes>
  implements UnitsAttributes {
  public unit_uuid!: number;
  public shopid!: number | null;
  public unitName!: string | null;
  public relationship!: number | null;
  public status!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Define model
Units.init(
  {
    unit_uuid: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    shopid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    unitName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    relationship: {
      type: DataTypes.INTEGER,
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
    tableName: "tbl_units",
    modelName: "Units",
    timestamps: true, // Sequelize auto manages createdAt / updatedAt
  }
);

export default Units;