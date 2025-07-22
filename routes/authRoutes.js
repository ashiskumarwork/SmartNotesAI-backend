/**
 * routes/authRoutes.js
 * Routes for user authentication (register, login, get current user).
 */

import express from "express";
import { register, login, getMe } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Register new user
router.post("/register", register);
// Login user
router.post("/login", login);
// Get current user info (protected)
router.get("/me", authMiddleware, getMe);

export default router;
