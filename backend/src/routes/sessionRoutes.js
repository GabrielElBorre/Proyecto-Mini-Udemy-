import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { 
  getMySessions, 
  closeSession, 
  closeAllOtherSessions, 
  logout 
} from "../controllers/sessionController.js";

const router = express.Router();

// Todas las rutas requieren autenticación
router.get("/my-sessions", protect, getMySessions);
router.post("/close/:sessionId", protect, closeSession);
router.post("/close-all-others", protect, closeAllOtherSessions);
router.post("/logout", protect, logout);

export default router;

