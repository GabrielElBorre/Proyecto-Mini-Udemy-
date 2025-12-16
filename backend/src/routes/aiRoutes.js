import express from "express";
import { chat } from "../controllers/aiController.js";
import { generalLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// Ruta para el chat de IA (pública, pero con rate limiting)
router.post("/chat", generalLimiter, chat);

export default router;

