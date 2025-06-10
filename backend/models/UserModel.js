import { DataTypes } from "sequelize";
import db from "../config/database.js";

const User = db.define("users", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM("admin", "user"),
    allowNull: false,
    defaultValue: "user",
  },
  // TAMBAHKAN field lastLogin jika ingin menggunakannya
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  freezeTableName: true,
  timestamps: false,
  tableName: "users",
});

// Sync tabel users dengan MySQL
db.sync().then(() => console.log("MySQL: users table synced"));

export default User;