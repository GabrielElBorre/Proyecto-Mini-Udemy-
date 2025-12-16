import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  toggleFollow,
  getFollowing,
  checkFollow,
  getFollowers
} from "../controllers/instructorFollowController.js";

const router = express.Router();

// Verificar si se sigue a un instructor
router.get("/check/:instructorId", protect, checkFollow);

// Seguir/dejar de seguir
router.post("/:instructorId", protect, toggleFollow);

// Obtener instructores seguidos
router.get("/following", protect, getFollowing);

// Obtener seguidores (solo para el instructor)
router.get("/followers/:instructorId", protect, getFollowers);

export default router;

