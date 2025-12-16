import express from "express";
import {
  createOrUpdateReview,
  getCourseReviews,
  getMyReview,
  deleteReview,
} from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/courses/:courseId", protect, createOrUpdateReview);
router.get("/courses/:courseId", getCourseReviews);
router.get("/courses/:courseId/my-review", protect, getMyReview);
router.delete("/:reviewId", protect, deleteReview);

export default router;


