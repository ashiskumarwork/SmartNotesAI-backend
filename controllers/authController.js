/**
 * controllers/authController.js
 * Handles user registration, login, and getting current user info.
 */

import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "changeme_secret";

/**
 * Registers a new user.
 * Expects: { name, email, password } in req.body
 * Returns: { token, user }
 */
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "Email already registered." });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "7d",
    });
    res
      .status(201)
      .json({
        token,
        user: { name: user.name, email: user.email, id: user._id },
      });
  } catch (err) {
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
};

/**
 * Logs in a user.
 * Expects: { email, password } in req.body
 * Returns: { token, user }
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password." });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: "Invalid email or password." });
    }
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({
      token,
      user: { name: user.name, email: user.email, id: user._id },
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed. Please try again." });
  }
};

/**
 * Gets the current logged-in user's info (protected route).
 * Requires: authMiddleware to set req.user
 * Returns: { user }
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) return res.status(404).json({ error: "User not found." });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user info." });
  }
};
