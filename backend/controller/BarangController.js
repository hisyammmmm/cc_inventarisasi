// BarangController.js - Fixed for non-JWT version

import Barang from "../models/BarangModel.js";
import User from "../models/UserModel.js";

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
    const { kode_barang, nama_barang, kategori, jumlah, satuan, kondisi, lokasi, keterangan, created_by } = req.body;

    // Validasi input required
    if (!kode_barang || !nama_barang || !kategori || !jumlah || !satuan || !kondisi || !lokasi) {
      return res.status(400).json({
        success: false,
        message: 'Semua field wajib harus diisi'
      });
    }

    // Validasi created_by - karena tidak pakai JWT, ambil dari request body
    if (!created_by) {
      return res.status(400).json({
        success: false,
        message: 'User ID (created_by) diperlukan'
      });
    }

    // Optional: Validasi apakah user exists
    const userExists = await User.findByPk(created_by);
    if (!userExists) {
      return res.status(400).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

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
      created_by: parseInt(created_by)
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
    const { kode_barang, nama_barang, kategori, jumlah, satuan, kondisi, lokasi, keterangan } = req.body;

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
    const barang = await Barang.findByPk(req.params.id);
    if (!barang) {
      return res.status(404).json({ 
        success: false,
        message: "Barang tidak ditemukan" 
      });
    }

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