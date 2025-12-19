import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

export const sequelize = new Sequelize(
  process.env.DB_NAME!,
  process.env.DB_USERNAME!,
  process.env.DB_PASSWORD!,
  {
    host: process.env.DB_HOSTNAME,
    port: Number(process.env.DB_PORT),
    dialect: "mysql",
    timezone: process.env.TZ,
    logging: false,
  }
);
