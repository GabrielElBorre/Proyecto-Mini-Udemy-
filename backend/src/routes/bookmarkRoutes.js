import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createBookmark,
  getBookmarks,
  deleteBookmark
} from "../controllers/bookmarkController.js";

const router = express.Router();

// Obtener bookmarks
router.get("/course/:courseId", protect, getBookmarks);
router.get("/course/:courseId/lesson/:lessonId", protect, getBookmarks);

// Crear bookmark
router.post("/course/:courseId/lesson/:lessonId", protect, createBookmark);

// Eliminar bookmark
router.delete("/:bookmarkId", protect, deleteBookmark);

export default router;

