/**
 * middleware/authMiddleware.js
 * Middleware to protect routes by verifying JWT token.
 */

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "changeme_secret";

/**
 * Checks for JWT in Authorization header and verifies it.
 * If valid, attaches user info to req.user and calls next().
 * If invalid, returns 401 Unauthorized.
 */
export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided." });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
};
