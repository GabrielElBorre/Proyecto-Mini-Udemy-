import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createQuestion,
  getQuestions,
  answerQuestion,
  voteQuestion,
  voteAnswer,
  deleteQuestion
} from "../controllers/questionController.js";

const router = express.Router();

// Obtener preguntas
router.get("/course/:courseId", getQuestions);
router.get("/course/:courseId/lesson/:lessonId", getQuestions);

// Crear pregunta
router.post("/course/:courseId", protect, createQuestion);
router.post("/course/:courseId/lesson/:lessonId", protect, createQuestion);

// Responder pregunta
router.post("/:questionId/answer", protect, answerQuestion);

// Votar pregunta
router.post("/:questionId/vote", protect, voteQuestion);

// Votar respuesta
router.post("/:questionId/answer/:answerId/vote", protect, voteAnswer);

// Eliminar pregunta
router.delete("/:questionId", protect, deleteQuestion);

export default router;

