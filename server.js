import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import notesRoutes from "./routes/notesRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "";

// Log every incoming request for debugging
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

// Global middleware
app.use(
  cors({
    origin: [process.env.FRONTEND_URL || "https://your-vercel-site.vercel.app"],
    credentials: true,
  })
);
app.use(express.json());

// Mount API routes
app.use("/api", notesRoutes);
app.use("/api", aiRoutes);
app.use("/api/auth", authRoutes);

// Health check/root endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AI Notes Beautifier & Summarizer Backend is running.",
  });
});

// Global error handler (always send a JSON error response)
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(500).json({
    error: "An unexpected server error occurred. Please try again later.",
  });
});

// Connect to MongoDB and start server
mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });
