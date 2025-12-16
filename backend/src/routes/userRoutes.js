import express from "express";
import { register, login, getProfile, updateProfile, forgotPassword, resetPassword } from "../controllers/userController.js";
import { validateRegister, validateLogin } from "../middleware/validators.js";
import { authLimiter, passwordResetLimiter } from "../middleware/rateLimiter.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", authLimiter, validateRegister, register);
router.post("/login", authLimiter, validateLogin, login);
router.post("/forgot-password", passwordResetLimiter, forgotPassword);
router.post("/reset-password", passwordResetLimiter, resetPassword);
router.get("/me", protect, getProfile);
router.put("/me", protect, updateProfile);

export default router;