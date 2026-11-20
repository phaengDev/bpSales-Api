import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import Billsales from "./Billsales";
import Company from "./Company";
import Provinces from "./Provinces";
// Define the attributes interface
interface TransportationAttributes {
  _uuid: number;
  shopid?: number | null;
  codebill?: string | null;
  billsaleid?: number | null;
  companyid?: number | null;
  title?: Text | null;
  fullnames?: string | null;
  phone?: string | null;
  provinceid?: number | null;
  branch_name?: string | null;
  cod?: number | null;
  balance?: number | null;
  get_cod?: number | null;
  status_pay?: number | null;
  print?: number | null;
  notified?: number | null;
  status?: number | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

// Optional fields when creating a new Transportation
type TransportationCreationAttributes = Optional<TransportationAttributes, "_uuid">;
export class Transportation extends Model<TransportationAttributes, TransportationCreationAttributes>
  implements TransportationAttributes {
  declare _uuid: number;
  declare shopid: number | null;
  declare codebill: string | null;
  declare billsaleid: number | null;
  declare companyid: number | null;
  declare title: Text | null;
  declare fullnames: string | null;
  declare phone: string | null;
  declare provinceid: number | null;
  declare branch_name: string | null;
  declare cod: number | null; //== 1 ຈ່າຍແລ້ວ, 2 ຈ່າຍປາຍທາງ cod
  declare balance: number | null;
  declare get_cod: number | null;  //== 1 ຍັງບໍ່ໄດ້ຮັບເງິນ cod, 2 ໄດ້ຮັບເງິນ cod ແລ້ວ
  declare status_pay: number | null; //== 1 ຄ່າຝາກຈ່າຍຕົ້ນທາງ, 2 ຄ່າຝາກຈ່າຍປາຍທາງ
  declare print: number | null; //== 1 ຍັງບໍ່ໄດ້ພີມບິນ, 2 ພີມບິນແລ້ວ
  declare notified: number | null;  //== 1 ຍັງບໍ່ໄດ້ແຈ້ງລູກຄ້າ, 2 ແຈ້ງແລະສົ່ງບິນໃຫ້ລູກຄ້າແລ້ວ, 3 ລູກຄ້າຮັບເຄື່ອງແລໍ້ວ 
  declare status: number | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

// Define model
Transportation.init(
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
    codebill: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    billsaleid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    companyid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    fullnames: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    provinceid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    branch_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    cod: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    balance: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    get_cod: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    status_pay: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    print: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    notified: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "tbl_transportation",
    modelName: "Transportation",
    timestamps: true, // Sequelize auto manages createdAt / updatedAt
  }
);

Transportation.belongsTo(Company, { foreignKey: "companyid", as: "company" });
Transportation.belongsTo(Provinces, { foreignKey: "provinceid", as: "province" });
Transportation.belongsTo(Billsales, { foreignKey: "billsaleid", as: "billsale" });
Billsales.hasOne(Transportation, {
  foreignKey: "billsaleid",
  as: "transport"
});
export default Transportation;