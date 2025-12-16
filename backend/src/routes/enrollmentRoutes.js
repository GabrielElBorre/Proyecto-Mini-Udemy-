import express from "express";
import { enrollInCourse, getStudentCourses, updateProgress, getStudentStats } from "../controllers/enrollmentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, enrollInCourse);
router.get("/my-courses", protect, getStudentCourses);
router.get("/stats", protect, getStudentStats);
router.put("/progress", protect, updateProgress);

export default router;


