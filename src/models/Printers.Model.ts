import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import Users from "./Users.Model";

/** ວິທີເຊື່ອມຕໍ່ປຣີນເຕີ — ຕ້ອງກົງກັບຝັ່ງໜ້າເວັບ (printerDevices.ts) */
export type PrinterLink = "system" | "usb" | "bluetooth" | "network";
/** ໜ້າທີ່ຂອງປຣີນເຕີ — ບິນ / ສະຕິກເກີ / ໃບຄົວ */
export type PrinterPurpose = "receipt" | "label" | "kitchen";

interface PrintersAttributes {
  _uuid: number;
  shopid?: number | null;
  /** ຜູກສະເພາະຜູ້ໃຊ້ຄົນນີ້ — null = ທັງຮ້ານໃຊ້ຮ່ວມກັນ */
  user_uuid?: number | null;
  printerName?: string | null;
  link?: PrinterLink | null;
  /** ຊື່ຈິງທີ່ຕິດຕັ້ງໃນເຄື່ອງ (Windows) ຫຼື ຊື່ອຸປະກອນ */
  deviceName?: string | null;
  /** network = IP:port, usb = vendorId:productId, bluetooth = deviceId */
  address?: string | null;
  purpose?: PrinterPurpose | null;
  paper?: string | null;
  copies?: number | null;
  /** 1 = ໃຊ້ເປັນຄ່າຫຼັກຂອງໜ້າທີ່ນີ້ */
  isDefault?: number | null;
  status?: number | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

type PrintersCreationAttributes = Optional<PrintersAttributes, "_uuid">;

export class Printers extends Model<PrintersAttributes, PrintersCreationAttributes>
  implements PrintersAttributes {
  public _uuid!: number;
  public shopid!: number | null;
  public user_uuid!: number | null;
  public printerName!: string | null;
  public link!: PrinterLink | null;
  public deviceName!: string | null;
  public address!: string | null;
  public purpose!: PrinterPurpose | null;
  public paper!: string | null;
  public copies!: number | null;
  public isDefault!: number | null;
  public status!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Printers.init(
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
    user_uuid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    printerName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    link: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: "system",
    },
    deviceName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    purpose: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: "receipt",
    },
    paper: {
      type: DataTypes.STRING(10),
      allowNull: true,
      defaultValue: "80mm",
    },
    copies: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
    },
    isDefault: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
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
    tableName: "tbl_printers",
    modelName: "Printers",
    timestamps: true,
  }
);
Printers.sync();

Printers.belongsTo(Users, { foreignKey: "user_uuid", as: "user" });

export default Printers;
