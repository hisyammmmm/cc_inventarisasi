import { DataTypes } from 'sequelize';
import db from '../config/database.js';

const BarangLog = db.define('BarangLog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  barangId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  kode_barang: DataTypes.STRING,
  nama_barang: DataTypes.STRING,
  kategori: DataTypes.STRING,
  jumlah: DataTypes.INTEGER,
  satuan: DataTypes.STRING,
  kondisi: DataTypes.STRING,
  lokasi: DataTypes.STRING,
  keterangan: DataTypes.STRING,
  lastModifiedBy: DataTypes.STRING,
  lastModifiedAt: DataTypes.DATE,
  lastAction: DataTypes.STRING
}, {
  tableName: 'BarangLogs',
  timestamps: false
});

export default BarangLog;
