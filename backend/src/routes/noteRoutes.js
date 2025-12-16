import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createOrUpdateNote,
  getNotes,
  deleteNote,
  searchNotes
} from "../controllers/noteController.js";

const router = express.Router();

// Buscar notas
router.get("/search", protect, searchNotes);

// Obtener notas
router.get("/course/:courseId", protect, getNotes);
router.get("/course/:courseId/lesson/:lessonId", protect, getNotes);

// Crear o actualizar nota
router.post("/course/:courseId", protect, createOrUpdateNote);
router.post("/course/:courseId/lesson/:lessonId", protect, createOrUpdateNote);

// Eliminar nota
router.delete("/:noteId", protect, deleteNote);

export default router;

