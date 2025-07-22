/**
 * models/Notes.js
 * Mongoose schema and model for storing notes in MongoDB.
 */

import mongoose from "mongoose";

const NotesSchema = new mongoose.Schema({
  rawText: { type: String, required: true },
  beautifiedText: { type: String, required: true },
  summaryText: { type: String, required: true },
  takeaways: { type: [String], required: true },
  createdAt: { type: Date, default: Date.now },
});

const Notes = mongoose.model("Notes", NotesSchema);
export default Notes;
