import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  toggleFavorite,
  getFavorites,
  checkFavorite
} from "../controllers/favoriteController.js";

const router = express.Router();

// Verificar si un curso es favorito
router.get("/check/:courseId", protect, checkFavorite);

// Agregar/quitar favorito
router.post("/:courseId", protect, toggleFavorite);

// Obtener favoritos del usuario
router.get("/", protect, getFavorites);

export default router;

