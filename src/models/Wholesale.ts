import { DataTypes, Model, Optional } from "sequelize";
import {sequelize} from "../config/database";

// Define the attributes interface
interface WholesaleAttributes {
  price_uuid: number;
  productid?: number | null;
  typeName?: string | null;
  prices?: string | null;
  status?: number | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

// Optional fields when creating a new Wholesale
type WholesaleCreationAttributes = Optional<WholesaleAttributes, "price_uuid">;

export class Wholesale extends Model<WholesaleAttributes, WholesaleCreationAttributes>
  implements WholesaleAttributes {
  public price_uuid!: number;
  public productid!: number | null;
  public typeName!: string | null;
  public prices!: string | null;
  public status!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Define model
Wholesale.init(
  {
    price_uuid: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    productid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    typeName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    prices: {
      type: DataTypes.DECIMAL(10, 2),
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
    tableName: "tbl_wholesale",
    modelName: "Wholesale",
    timestamps: true, // Sequelize auto manages createdAt / updatedAt
  }
);

export default Wholesale;