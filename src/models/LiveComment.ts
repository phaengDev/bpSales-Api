import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import LiveSession from "./LiveSession";
import LiveProduct from "./LiveProduct";
// Define the attributes interface
interface LiveCommentAttributes {
  _uuid: number;
  liveid?: number | null;
  commentid?: string | null;       // id ຄອມເມັນຈາກ Facebook (ກັນຊ້ຳ)
  fb_userid?: string | null;
  customerName?: string | null;
  picture?: string | null;
  message?: string | null;
  is_cf?: number | null;           // 1=ເປັນຄອມເມັນ CF
  code?: string | null;            // ລະຫັດທີ່ອ່ານໄດ້
  quantity?: number | null;        // ຈຳນວນທີ່ອ່ານໄດ້
  liveproductid?: number | null;   // ຈັບຄູ່ກັບສິນຄ້າໄລ໌
  status?: number | null;          // 0=ທຳມະດາ, 1=CF ຈັບຄູ່ໄດ້, 2=ບໍ່ພົບລະຫັດ, 3=ເກີນຈຳກັດ, 4=ບັນທຶກອໍເດີແລ້ວ, 9=ຍົກເລີກ
  commentAt?: Date | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

// Optional fields when creating a new LiveComment
type LiveCommentCreationAttributes = Optional<LiveCommentAttributes, "_uuid">;

export class LiveComment extends Model<LiveCommentAttributes, LiveCommentCreationAttributes>
  implements LiveCommentAttributes {
  declare _uuid: number;
  declare liveid: number | null;
  declare commentid: string | null;
  declare fb_userid: string | null;
  declare customerName: string | null;
  declare picture: string | null;
  declare message: string | null;
  declare is_cf: number | null;
  declare code: string | null;
  declare quantity: number | null;
  declare liveproductid: number | null;
  declare status: number | null;
  declare commentAt: Date | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

// Define model
LiveComment.init(
  {
    _uuid: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
    },
    liveid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    commentid: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    fb_userid: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    customerName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    picture: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_cf: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    code: {
      type: DataTypes.STRING(6),
      allowNull: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    liveproductid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    commentAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
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
    tableName: "tbl_live_comment",
    modelName: "LiveComment",
    timestamps: true,
    indexes: [
      { name: "uq_live_comment", unique: true, fields: ["liveid", "commentid"] },
    ],
  }
);

LiveComment.belongsTo(LiveSession, { foreignKey: "liveid", as: "live" });
LiveSession.hasMany(LiveComment, { foreignKey: "liveid", as: "comments" });
LiveComment.belongsTo(LiveProduct, { foreignKey: "liveproductid", as: "liveProduct" });

export default LiveComment;
