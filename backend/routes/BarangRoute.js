import express from "express";
import {
  getBarang,
  createBarang,
  getBarangById,
  updateBarang,
  deleteBarang,
  getBarangLog,
  clearBarangLog,
  exportBarangCSV
} from "../controller/BarangController.js";

const router = express.Router();

// Route tracking log harus di atas route dengan parameter :id
router.get('/log', getBarangLog);
router.delete('/log', clearBarangLog);
router.get('/export/csv', exportBarangCSV);

router.get("/", getBarang);
router.post("/", createBarang);
router.get("/:id", getBarangById);
router.put("/:id", updateBarang);
router.delete("/:id", deleteBarang);

export default router;