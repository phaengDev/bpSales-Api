import { DataTypes, Model, Optional } from "sequelize";
import {sequelize} from "../config/database";
import Shops from "./Shops.Model";
// Define the attributes interface
interface UserAttributes {
  user_uuid: number;
  shopid?: number | null;
  // ID ຈາກ Facebook ຍາວເກີນ INT (ຮອດ 17 ຕົວເລກ) — ຕ້ອງເກັບເປັນ string
  facebookid?: string | null;
  userName?: string | null;
  phone?: string | null;
  password?: string | null;
  typeuser?: number | null;
  created?: number | null;
  updated?: number | null;
  deleted?: number | null;
  status?: number | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

// Optional fields when creating a new user
type UserCreationAttributes = Optional<UserAttributes, "user_uuid">;

export class Users extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes {
  declare user_uuid: number;
  declare shopid: number | null;
  declare facebookid: string | null;
  declare userName: string | null;
  declare phone: string | null;
  declare password: string | null;
  declare typeuser: number | null;
  declare created: number | null;
  declare updated: number | null;
  declare deleted: number | null;
  declare status: number | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

// Define model
Users.init(
  {
    user_uuid: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    shopid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    facebookid: {
      type: DataTypes.STRING(32),
      allowNull: true,
    },
    userName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    typeuser: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    created: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    updated: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    deleted: {
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
    tableName: "tbl_users",
    modelName: "Users",
    timestamps: true, // Sequelize auto manages createdAt / updatedAt
  }
);
// Export model
Users.belongsTo(Shops, { foreignKey: "shopid", as: "shop" });
export default Users;