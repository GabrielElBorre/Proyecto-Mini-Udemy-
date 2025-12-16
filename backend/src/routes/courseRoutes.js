import express from "express";
import { 
  createCourse, 
  getCourses, 
  getCourseById, 
  getInstructorCourses,
  getCourseStudents,
  updateCourse, 
  deleteCourse 
} from "../controllers/courseController.js";
import { protect, instructorOnly, optionalAuth } from "../middleware/authMiddleware.js";
import { validateCourse } from "../middleware/validators.js";

const router = express.Router();

// Rutas públicas (con autenticación opcional para personalización)
router.get("/", optionalAuth, getCourses);
router.get("/my-courses", protect, getInstructorCourses); // Cualquier usuario puede ver sus cursos

// Rutas protegidas - cualquier usuario autenticado puede crear cursos
router.post("/", protect, validateCourse, createCourse);

// IMPORTANTE: Esta ruta debe ir ANTES de /:id para que no se confunda con un ID
router.get("/:courseId/students", protect, getCourseStudents); // Obtener estudiantes de un curso

// Rutas con parámetros dinámicos al final
router.get("/:id", optionalAuth, getCourseById);
router.put("/:id", protect, validateCourse, updateCourse);
router.delete("/:id", protect, deleteCourse);

export default router;