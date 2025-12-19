import { DataTypes, Model, Optional } from "sequelize";
import {sequelize} from "../config/database";
import Shops from "./Shops";
// Define the attributes interface
interface UserAttributes {
  user_uuid: number;
  shopid?: number | null;
  userName?: string | null;
  phones?: string | null;
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
  public user_uuid!: number;
  public shopid!: number | null;
  public userName!: string | null;
  public phones!: string | null;
  public password!: string | null;
  public typeuser?: number | null;
  public created?: number | null;
  public updated?: number | null;
  public deleted?: number | null;
  public status!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
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
    userName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    phones: {
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