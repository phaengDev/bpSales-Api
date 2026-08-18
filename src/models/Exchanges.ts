import { DataTypes, Model, Optional } from "sequelize";
import {sequelize} from "../config/database";
import Country from "./Country";
// Define the attributes interface
interface ExchangesAttributes {
  _uuid: number;
  shopid?: number | null;
  countryid?: number | null;
  rate?: number | null;
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
  public countryid!: number | null;
  public rate!: number | null;
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
    countryid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    rate: {
      type: DataTypes.FLOAT,
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

Exchanges.belongsTo(Country, { foreignKey: "countryid", as: "country" });
Country.hasMany(Exchanges, { foreignKey: "countryid", as: "rates" });

export default Exchanges;
