import { DataTypes, Model, Optional } from "sequelize";
import {sequelize} from "../config/database";
import Country from "./Country";
import Shops from "./Shops";
import Users from "./Users";
// Define the attributes interface
interface BillsalesAttributes {
  bill_uuid: number;
  billcode?: string | null;
  billno?: string | null;
  shopid?: number | null;
  customerid?: number | null;
  balanceSale?: number | null;
  balanceTotal?: number | null;
  taxBalance?: number | null;
  discount?: number | null;
  countryid?: number | null;
  rate?: number | null;
  balance_payable?: number | null;
  getCash?: number | null;
  getTransfer?: number | null;
  balance_pays?: number | null;
  refund?: number | null;
  typesale?: number | null;
  status?: number | null;
  description?: string | null;
  statusoff?: number | null;
  createby?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

// Optional fields when creating a new Billsales
type BillsalesCreationAttributes = Optional<BillsalesAttributes, "bill_uuid">;

export class Billsales extends Model<BillsalesAttributes, BillsalesCreationAttributes>
  implements BillsalesAttributes {
  public bill_uuid!: number;
  public billcode!: string | null;
  public billno!: string | null;
  public shopid!: number | null;
  public customerid!: number | null;
  public balanceSale!: number | null;
  public balanceTotal!: number | null;
  public taxBalance!: number | null;
  public discount!: number | null;
  public countryid!: number | null;
  public rate!: number | null;
  public balance_payable!: number | null;
  public getCash!: number | null;
  public getTransfer!: number | null;
  public balance_pays!: number | null;
  public refund!: number | null;
  public typesale!: number | null;
  public status!: number | null;
  public description!: string | null;
  public statusoff!: number | null;
  public createby!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Define model
Billsales.init(
  {
    bill_uuid: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    billcode: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    billno: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    shopid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    customerid: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
    },
    balanceSale: {
      type: DataTypes.DECIMAL(13, 2),
      allowNull: true,
    },
    balanceTotal: {
      type: DataTypes.DECIMAL(13, 2),
      allowNull: true,
    },
    taxBalance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    discount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    countryid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    rate: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    balance_payable: {
      type: DataTypes.DECIMAL(13, 2),
      allowNull: true,
    },
    getCash: {
      type: DataTypes.DECIMAL(13, 2),
      allowNull: true,
    },
    getTransfer: {
      type: DataTypes.DECIMAL(13, 2),
      allowNull: true,
    },
    balance_pays: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    refund: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    typesale: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    statusoff: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
    },
    createby: {
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
    tableName: "tbl_billsales",
    modelName: "Billsales",
    timestamps: true, // Sequelize auto manages createdAt / updatedAt
  }
);

// export 
Billsales.belongsTo(Country, { foreignKey: "countryid", as: "country" });
Billsales.belongsTo(Shops, { foreignKey: "shopid", as: "shop" });
Billsales.belongsTo(Users, { foreignKey: "createby", as: "user" });
export default Billsales;