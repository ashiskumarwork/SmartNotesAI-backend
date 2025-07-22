/**
 * routes/notesRoutes.js
 * Routes for note summarization, saving, and retrieval.
 */

import express from "express";
import {
  summarizeNotes,
  saveNote,
  getAllNotes,
} from "../controllers/notesController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/summarize - Summarize beautified notes using AI (protected)
router.post("/summarize", authMiddleware, summarizeNotes);

// POST /api/save - Save a note to the database (protected)
router.post("/save", authMiddleware, saveNote);

// GET /api/notes - Get all saved notes (public)
router.get("/notes", getAllNotes);

export default router;
