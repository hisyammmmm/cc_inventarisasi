// BarangController.js

import Barang from "../models/BarangModel.js";

// Mendapatkan daftar semua barang
export const getBarang = async (req, res) => {
  try {
    const data = await Barang.findAll();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Menambahkan barang baru
// Menambahkan barang baru
export const createBarang = async (req, res) => {
  try {
    const { kode_barang, nama_barang, kategori, jumlah, satuan, kondisi, lokasi, keterangan } = req.body;

    // Ambil user_id dari request yang sudah didekodekan dalam middleware verifyToken
    const created_by = req.user_id; 

    const newBarang = await Barang.create({
      kode_barang,
      nama_barang,
      kategori,
      jumlah,
      satuan,
      kondisi,
      lokasi,
      keterangan,
      created_by // Menyimpan ID pengguna yang membuat barang
    });

    res.status(201).json({
      success: true,
      message: 'Barang added successfully',
      data: newBarang
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Mendapatkan barang berdasarkan ID
export const getBarangById = async (req, res) => {
  try {
    const barang = await Barang.findByPk(req.params.id);
    if (!barang) {
      return res.status(404).json({ message: "Barang not found" });
    }
    res.json(barang);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Memperbarui data barang berdasarkan ID
export const updateBarang = async (req, res) => {
  try {
    const { id } = req.params;
    const { kode_barang, nama_barang, kategori, jumlah, satuan, kondisi, lokasi, keterangan } = req.body;

    const barang = await Barang.findByPk(id);
    if (!barang) {
      return res.status(404).json({ message: "Barang not found" });
    }

    await barang.update({
      kode_barang,
      nama_barang,
      kategori,
      jumlah,
      satuan,
      kondisi,
      lokasi,
      keterangan
    });

    res.json({
      success: true,
      message: 'Barang updated successfully',
      data: barang
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Menghapus barang berdasarkan ID
export const deleteBarang = async (req, res) => {
  try {
    const barang = await Barang.findByPk(req.params.id);
    if (!barang) {
      return res.status(404).json({ message: "Barang not found" });
    }

    await barang.destroy();
    res.json({
      success: true,
      message: 'Barang deleted successfully',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
