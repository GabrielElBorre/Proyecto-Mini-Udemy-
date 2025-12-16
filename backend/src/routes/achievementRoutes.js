import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getUserAchievements,
  getAchievementProgress
} from "../controllers/achievementController.js";

const router = express.Router();

// Obtener logros del usuario
router.get("/", protect, getUserAchievements);

// Obtener progreso hacia logros
router.get("/progress", protect, getAchievementProgress);

export default router;

