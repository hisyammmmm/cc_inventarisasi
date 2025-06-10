import express from "express";
import {
  getBarang,
  createBarang,
  getBarangById,
  updateBarang,
  deleteBarang,
} from "../controller/BarangController.js";

const router = express.Router();

// Semua route harus menggunakan verifyToken
router.get("/", getBarang);
router.post("/", createBarang);
router.get("/:id", getBarangById);
router.put("/:id", updateBarang);
router.delete("/:id", deleteBarang);

export default router;