import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

/**
 * Register new user
 * POST /auth/register
 */
router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ message: "Email, password, and name are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      email,
      password: hashedPassword,
      name,
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    // Return user data and token (include role)
    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role || "user",
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Registration failed" });
  }
});

/**
 * Login user
 * POST /auth/login
 */
router.post("/login", async (req, res) => {
  
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Find user (normalize email to lowercase to match schema)
    const emailLower = (email || "").trim().toLowerCase();
    const user = await User.findOne({ email: emailLower }).lean();
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    if (user.isActive === false) {
      return res.status(401).json({ message: "Account is disabled" });
    }

    // Check password (user is plain object from .lean())
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    // Return user data and token; always include role from DB (admin dashboard checks user.role)
    const role = (user.role != null && String(user.role).trim()) ? String(user.role).trim() : "user";
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
});

/**
 * Get current user
 * GET /auth/me
 * Requires authentication
 */
router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const role = (user.role && String(user.role).toLowerCase()) === "admin" ? "admin" : "user";
    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role,
      },
    });
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
});

export default router;
