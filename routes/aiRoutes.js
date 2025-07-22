/**
 * routes/aiRoutes.js
 * Routes for AI-powered endpoints (beautification).
 */

import express from "express";
import { beautifyNotes } from "../controllers/aiController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/beautify - Beautify raw notes using AI (protected)
router.post("/beautify", authMiddleware, beautifyNotes);

export default router;
