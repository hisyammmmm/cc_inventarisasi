// BarangController.js - Fixed for non-JWT version

import Barang from "../models/BarangModel.js";
import User from "../models/UserModel.js";
import BarangLog from '../models/BarangLogModel.js';
import { Op } from 'sequelize';
import { Parser as Json2csvParser } from 'json2csv';

// Mendapatkan daftar semua barang
export const getBarang = async (req, res) => {
  try {
    const data = await Barang.findAll({
      order: [['created_at', 'DESC']]
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Menambahkan barang baru - FIXED VERSION
export const createBarang = async (req, res) => {
  try {
    const { kode_barang, nama_barang, kategori, jumlah, satuan, kondisi, lokasi, keterangan, created_by, username } = req.body;

    // Validasi input required
    if (!kode_barang || !nama_barang || !kategori || !jumlah || !satuan || !kondisi || !lokasi) {
      return res.status(400).json({
        success: false,
        message: 'Semua field wajib harus diisi'
      });
    }

    // Deklarasikan created_by sebelum digunakan
    // const created_by = username || 'unknown';

    // Cek duplikasi kode_barang
    const existingBarang = await Barang.findOne({
      where: { kode_barang }
    });
    if (existingBarang) {
      return res.status(400).json({
        success: false,
        message: 'Kode barang sudah ada'
      });
    }

    const newBarang = await Barang.create({
      kode_barang,
      nama_barang,
      kategori,
      jumlah: parseInt(jumlah),
      satuan,
      kondisi,
      lokasi,
      keterangan: keterangan || null,
      created_by: created_by || null // <-- harus integer atau null
    });

    // Simpan log ke tabel BarangLog
    await BarangLog.create({
      barangId: newBarang.id,
      kode_barang: newBarang.kode_barang,
      nama_barang: newBarang.nama_barang,
      kategori: newBarang.kategori,
      jumlah: newBarang.jumlah,
      satuan: newBarang.satuan,
      kondisi: newBarang.kondisi,
      lokasi: newBarang.lokasi,
      keterangan: newBarang.keterangan,
      lastModifiedBy: username || 'unknown',
      lastModifiedAt: new Date(),
      lastAction: 'create'
    });

    res.status(201).json({
      success: true,
      message: 'Barang berhasil ditambahkan',
      data: newBarang
    });
  } catch (err) {
    console.error('Create barang error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error saat menambahkan barang',
      error: err.message 
    });
  }
};

// Alternative: Create barang dengan user ID dari localStorage
export const createBarangFromSession = async (req, res) => {
  try {
    const { kode_barang, nama_barang, kategori, jumlah, satuan, kondisi, lokasi, keterangan } = req.body;

    // Validasi input required
    if (!kode_barang || !nama_barang || !kategori || !jumlah || !satuan || !kondisi || !lokasi) {
      return res.status(400).json({
        success: false,
        message: 'Semua field wajib harus diisi'
      });
    }

    // Karena tidak pakai JWT, kita bisa:
    // 1. Set default user (misalnya admin)
    // 2. Atau ambil dari request body
    // 3. Atau buat endpoint khusus yang include user_id

    // Opsi 1: Default ke user ID 1 (admin)
    const created_by = 1; // atau bisa diambil dari req.body.user_id

    // Cek duplikasi kode_barang
    const existingBarang = await Barang.findOne({
      where: { kode_barang }
    });

    if (existingBarang) {
      return res.status(400).json({
        success: false,
        message: 'Kode barang sudah ada'
      });
    }

    const newBarang = await Barang.create({
      kode_barang,
      nama_barang,
      kategori,
      jumlah: parseInt(jumlah),
      satuan,
      kondisi,
      lokasi,
      keterangan: keterangan || null,
      created_by
    });

    res.status(201).json({
      success: true,
      message: 'Barang berhasil ditambahkan',
      data: newBarang
    });
  } catch (err) {
    console.error('Create barang error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error saat menambahkan barang',
      error: err.message 
    });
  }
};

// Mendapatkan barang berdasarkan ID
export const getBarangById = async (req, res) => {
  try {
    const barang = await Barang.findByPk(req.params.id);
    if (!barang) {
      return res.status(404).json({ 
        success: false,
        message: "Barang tidak ditemukan" 
      });
    }
    res.json({
      success: true,
      data: barang
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Memperbarui data barang berdasarkan ID
export const updateBarang = async (req, res) => {
  try {
    const { id } = req.params;
    const { kode_barang, nama_barang, kategori, jumlah, satuan, kondisi, lokasi, keterangan, username } = req.body;
    const barang = await Barang.findByPk(id);
    if (!barang) {
      return res.status(404).json({ 
        success: false,
        message: "Barang tidak ditemukan" 
      });
    }

    // Cek duplikasi kode_barang (exclude current item)
    if (kode_barang && kode_barang !== barang.kode_barang) {
      const existingBarang = await Barang.findOne({
        where: { kode_barang }
      });

      if (existingBarang) {
        return res.status(400).json({
          success: false,
          message: 'Kode barang sudah ada'
        });
      }
    }

    await barang.update({
      ...(kode_barang && { kode_barang }),
      ...(nama_barang && { nama_barang }),
      ...(kategori && { kategori }),
      ...(jumlah !== undefined && { jumlah: parseInt(jumlah) }),
      ...(satuan && { satuan }),
      ...(kondisi && { kondisi }),
      ...(lokasi && { lokasi }),
      ...(keterangan !== undefined && { keterangan }),
      updated_at: new Date()
    });

    // Simpan log ke tabel BarangLog
    await BarangLog.create({
      barangId: barang.id,
      kode_barang: barang.kode_barang,
      nama_barang: barang.nama_barang,
      kategori: barang.kategori,
      jumlah: barang.jumlah,
      satuan: barang.satuan,
      kondisi: barang.kondisi,
      lokasi: barang.lokasi,
      keterangan: barang.keterangan,
      lastModifiedBy: username || 'unknown',
      lastModifiedAt: new Date(),
      lastAction: 'edit'
    });

    res.json({
      success: true,
      message: 'Barang berhasil diperbarui',
      data: barang
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Menghapus barang berdasarkan ID
export const deleteBarang = async (req, res) => {
  try {
    const { id } = req.params;
    const { username } = req.body;
    const barang = await Barang.findByPk(id);
    if (!barang) {
      return res.status(404).json({ 
        success: false,
        message: "Barang tidak ditemukan" 
      });
    }

    // Simpan log ke tabel BarangLog sebelum hapus
    await BarangLog.create({
      barangId: barang.id,
      kode_barang: barang.kode_barang,
      nama_barang: barang.nama_barang,
      kategori: barang.kategori,
      jumlah: barang.jumlah,
      satuan: barang.satuan,
      kondisi: barang.kondisi,
      lokasi: barang.lokasi,
      keterangan: barang.keterangan,
      lastModifiedBy: username || 'unknown',
      lastModifiedAt: new Date(),
      lastAction: 'delete'
    });

    await barang.destroy();
    res.json({
      success: true,
      message: 'Barang berhasil dihapus',
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

export const getBarangLog = async (req, res) => {
  try {
    const logs = await BarangLog.findAll({
      order: [['lastModifiedAt', 'DESC']]
    });
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil log', error: err.message });
  }
};

export const clearBarangLog = async (req, res) => {
  try {
    await BarangLog.destroy({ where: {} });
    res.json({ success: true, message: 'Semua log barang berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal menghapus log', error: err.message });
  }
};

export const exportBarangCSV = async (req, res) => {
  try {
    const barang = await Barang.findAll();
    const fields = ['id', 'kode_barang', 'nama_barang', 'kategori', 'jumlah', 'satuan', 'kondisi', 'lokasi', 'keterangan'];
    const opts = { fields, withBOM: true };
    const parser = new Json2csvParser(opts);
    const csv = parser.parse(barang.map(b => b.toJSON()));
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="data-barang.csv"');
    res.status(200).end(csv);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal export CSV', error: err.message });
  }
};