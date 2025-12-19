import { DataTypes, Model, Optional } from "sequelize";
import {sequelize} from "../config/database";

// Define the attributes interface
interface SizesAttributes {
  size_uuid: number;
  shopid?: number | null;
  sizeName?: string | null;
  status?: number | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

// Optional fields when creating a new Sizes
type SizesCreationAttributes = Optional<SizesAttributes, "size_uuid">;

export class Sizes extends Model<SizesAttributes, SizesCreationAttributes>
  implements SizesAttributes {
  public size_uuid!: number;
  public shopid!: number | null;
  public sizeName!: string | null;
  public status!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Define model
Sizes.init(
  {
    size_uuid: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    shopid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    sizeName: {
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
    tableName: "tbl_sizes",
    modelName: "Sizes",
    timestamps: true, // Sequelize auto manages createdAt / updatedAt
  }
);

export default Sizes;