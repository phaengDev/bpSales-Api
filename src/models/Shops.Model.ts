import { DataTypes, Model, Optional } from "sequelize";
import {sequelize} from "../config/database";
import Districts from "./Districts";
// Define the attributes interface
interface ShopsAttributes {
  shop_uuid: number;
  logo?: string | null;
  shopName?: string | null;
  phone?: string | null;
  email?: string | null;
  village?: string | null;
  districtid?: number | null;
  /** ເລກປະຈຳຕົວຜູ້ເສຍອາກອນ — ສະແດງຢູ່ຫົວບິນ */
  taxNumber?: string | null;
  description?: string | null;
  bank_qr?: string | null;
  status?: number | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

// Optional fields when creating a new Shops
type ShopsCreationAttributes = Optional<ShopsAttributes, "shop_uuid">;

export class Shops extends Model<ShopsAttributes, ShopsCreationAttributes>
  implements ShopsAttributes {
  declare shop_uuid: number;
  declare logo: string | null;
  declare shopid: number | null;
  declare shopName: string | null;
  declare phone: string | null;
  declare email: string | null;
  declare village: string | null;
  declare districtid: number | null;
  declare taxNumber: string | null;
  declare description: string | null;
  declare bank_qr: string | null;
  declare status: number | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
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
    logo: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    bank_qr: {
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
    village: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    districtid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    taxNumber: {
      type: DataTypes.STRING(50),
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