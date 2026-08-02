import { DataTypes, Model, Optional } from "sequelize";
import {sequelize} from "../config/database";

// Define the attributes interface
interface ExchangesAttributes {
  _uuid: number;
  shopid?: number | null;
  abbr?: string | null;
  icons?: string | null;
  rate?: number | null;
  genus?: string | null;
  status?: number | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

// Optional fields when creating a new Exchanges
type ExchangesCreationAttributes = Optional<ExchangesAttributes, "_uuid">;

export class Exchanges extends Model<ExchangesAttributes, ExchangesCreationAttributes>
  implements ExchangesAttributes {
  public _uuid!: number;
  public shopid!: number | null;
  public abbr!: string | null;
  public icons!: string | null;
  public rate!: number | null;
  public genus!: string | null;
  public status!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Define model
Exchanges.init(
  {
    _uuid: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    shopid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    abbr: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    icons: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    rate: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    genus: {
      type: DataTypes.STRING(10),
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
    tableName: "tbl_exchange",
    modelName: "Exchanges",
    timestamps: true, // Sequelize auto manages createdAt / updatedAt
  }
);

export default Exchanges;