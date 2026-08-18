import { DataTypes, Model, Optional } from "sequelize";
import {sequelize} from "../config/database";
import Districts from "./Districts";
// Define the attributes interface
interface ShopsAttributes {
  shop_uuid: number;
  logo?: string | null;
  shopName?: string | null;
  phone?: number | null;
  village?: string | null;
  districtid?: number | null;
  description?: string | null;
  status?: number | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

// Optional fields when creating a new Shops
type ShopsCreationAttributes = Optional<ShopsAttributes, "shop_uuid">;

export class Shops extends Model<ShopsAttributes, ShopsCreationAttributes>
  implements ShopsAttributes {
  public shop_uuid!: number;
  public logo!: string | null;
  public shopid!: number | null;
  public shopName!: string | null;
  public phone!: number | null;
  public village!: string | null;
  public districtid!: number | null;
  public description!: string | null;
  public status!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Define model
Shops.init(
  {
    shop_uuid: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    shopName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    phone: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    village: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    districtid: {
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
    tableName: "tbl_shops",
    modelName: "Shops",
    timestamps: true, // Sequelize auto manages createdAt / updatedAt
  }
);
Shops.belongsTo(Districts, { foreignKey: "districtid", as: "district" });
export default Shops;