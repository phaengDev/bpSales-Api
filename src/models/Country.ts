import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
// Define the attributes interface
interface CountryAttributes {
  _uuid: number;
  names?: string | null;
  abbr?: string | null;
  icons?: string | null;
  genus?: string | null;
  status?: number | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

// Optional fields when creating a new Country
type CountryCreationAttributes = Optional<CountryAttributes, "_uuid">;

export class Country extends Model<CountryAttributes, CountryCreationAttributes>
  implements CountryAttributes {
  public _uuid!: number;
  public names!: string | null;
  public abbr!: string | null;
  public icons!: string | null;
  public genus!: string | null;
  public status!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Define model
Country.init(
  {
    _uuid: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    names: {
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
    tableName: "tbl_country",
    modelName: "Country",
    timestamps: true, // Sequelize auto manages createdAt / updatedAt
  }
);

export default Country;
