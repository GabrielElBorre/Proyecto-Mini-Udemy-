import express from "express";
import {
  getCategories,
  getCategoryById,
  createCategory,
} from "../controllers/categoryController.js";

const router = express.Router();

// Rutas públicas
router.get("/", getCategories);
router.get("/:id", getCategoryById);

// Ruta para crear (puedes agregar middleware de admin más adelante)
router.post("/", createCategory);

export default router;


