import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import Products from "./Products";
import Users from "./Users";
// Define the attributes interface
interface ImportedAttributes {
  import_uuid: number;
  productid?: number | null;
  sell_price_old?: number | null;
  sell_price?: number | null;
  discount?: number | null;
  buy_price_old?: number | null;
  buy_price?: number | null;
  quantity_old?: number | null;
  quantity?: number | null;
  descripiton?: string | null;
  types?: number | null;
  status?: number | null;
  createbyid?: number | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

// Optional fields when creating a new Imported
type ImportedCreationAttributes = Optional<ImportedAttributes, "import_uuid">;

export class Imported extends Model<ImportedAttributes, ImportedCreationAttributes>
  implements ImportedAttributes {
  public import_uuid!: number;
  public productid!: number | null;
  public sell_price_old!: number | null;
  public sell_price!: number | null;
  public discount!: number | null;
  public buy_price_old!: number | null;
  public buy_price!: number | null;
  public quantity_old!: number | null;
  public quantity!: number | null;
  public descripiton!: string | null;
  public types!: number | null;
  public status!: number | null;
  public createbyid!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Define model
Imported.init(
  {
    import_uuid: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    productid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    sell_price_old: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    sell_price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    discount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    buy_price_old: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    buy_price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    quantity_old: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    descripiton: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    types: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
    },
    createbyid: {
      type: DataTypes.INTEGER,
      allowNull: true,
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
    tableName: "tbl_imported",
    modelName: "Imported",
    timestamps: true, // Sequelize auto manages createdAt / updatedAt
  }
);
Imported.belongsTo(Products, { foreignKey: 'productid', as: 'product' });
Imported.belongsTo(Users, { foreignKey: 'createbyid', as: 'user' });
export default Imported;