import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

/**
 * ຮູບແບບບິນຂອງແຕ່ລະຮ້ານ — ເປັນຄ່າພື້ນຖານທີ່ທຸກເຄື່ອງໃນຮ້ານໃຊ້ຮ່ວມກັນ
 * (ເມື່ອກ່ອນເກັບຢູ່ localStorage ຂອງແຕ່ລະເຄື່ອງ)
 */
interface BillSettingsAttributes {
  _uuid: number;
  shopid?: number | null;
  paper?: string | null;
  fontScale?: string | null;
  copies?: number | null;
  margin?: number | null;
  showLogo?: number | null;
  showAddress?: number | null;
  showPhone?: number | null;
  showSeller?: number | null;
  showTax?: number | null;
  showQr?: number | null;
  autoPrint?: number | null;
  silentPrint?: number | null;
  footerText?: string | null;
  labelSize?: string | null;
  /** ໂລໂກ້ສະເພາະໃນບິນ — ວ່າງ = ໃຊ້ໂລໂກ້ຂອງຮ້ານ */
  logo?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

type BillSettingsCreationAttributes = Optional<BillSettingsAttributes, "_uuid">;

export class BillSettings extends Model<BillSettingsAttributes, BillSettingsCreationAttributes>
  implements BillSettingsAttributes {
  public _uuid!: number;
  public shopid!: number | null;
  public paper!: string | null;
  public fontScale!: string | null;
  public copies!: number | null;
  public margin!: number | null;
  public showLogo!: number | null;
  public showAddress!: number | null;
  public showPhone!: number | null;
  public showSeller!: number | null;
  public showTax!: number | null;
  public showQr!: number | null;
  public autoPrint!: number | null;
  public silentPrint!: number | null;
  public footerText!: string | null;
  public labelSize!: string | null;
  public logo!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

const flag = (defaultValue: number) => ({
  type: DataTypes.INTEGER,
  allowNull: true,
  defaultValue,
});

BillSettings.init(
  {
    _uuid: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    shopid: {
      type: DataTypes.INTEGER,
      allowNull: true,
      unique: true,
    },
    paper: {
      type: DataTypes.STRING(10),
      allowNull: true,
      defaultValue: "80mm",
    },
    fontScale: {
      type: DataTypes.STRING(5),
      allowNull: true,
      defaultValue: "md",
    },
    copies: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
    },
    margin: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 3,
    },
    showLogo: flag(1),
    showAddress: flag(1),
    showPhone: flag(1),
    showSeller: flag(1),
    showTax: flag(0),
    showQr: flag(0),
    autoPrint: flag(0),
    silentPrint: flag(1),
    footerText: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    labelSize: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: "100x150",
    },
    logo: {
      type: DataTypes.STRING(255),
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
    tableName: "tbl_bill_settings",
    modelName: "BillSettings",
    timestamps: true,
  }
);
BillSettings.sync().then(() => console.log("BillSettings table synced"));
export default BillSettings;
