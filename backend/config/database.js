import { Sequelize } from "sequelize";

// Nyambungin db ke BE
const db = new Sequelize("db_inventaris", "root", "", {
  host: "34.46.219.217",
  dialect: "mysql",
});

export default db;