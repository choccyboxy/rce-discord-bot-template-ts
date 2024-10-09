import { Sequelize } from "sequelize";
import "dotenv/config";

const sequelize = new Sequelize(
  //@ts-ignore
  process.env.DATABASE_NAME,
  process.env.DATABASE_USER,
  process.env.DATABASE_PASSWORD,
  {
    host: process.env.DATABASE_HOST,
    dialect: "postgres",
    logging: false,
  }
);

export default sequelize;
