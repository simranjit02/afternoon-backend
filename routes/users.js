import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = express.Router();

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id;
}

/** Strip password from user object for API responses */
function toSafeUser(user) {
  if (!user) return null;
  const u = user.toObject ? user.toObject() : { ...user };
  delete u.password;
  return u;
}

/**
 * List all users (admin only). Excludes password.
 * GET /users
 */
router.get("/", requireAdmin, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).lean();
    const safe = users.map((u) => {
      const { password, ...rest } = u;
      return rest;
    });
    res.json(safe);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Get one user by id (admin only).
 * GET /users/:id
 */
router.get("/:id", requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) return res.status(404).json({ message: "User not found" });
    const { password, ...rest } = user;
    res.json(rest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Create user (admin only). Body: name, email, password, role?, isActive?
 * POST /users
 */
router.post("/", requireAdmin, async (req, res) => {
  try {
    const { name, email, password, role = "user", isActive = true } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }
    const emailLower = String(email).trim().toLowerCase();
    const existing = await User.findOne({ email: emailLower });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      name: String(name).trim(),
      email: emailLower,
      password: hashedPassword,
      role: role === "admin" ? "admin" : "user",
      isActive: !!isActive,
    });
    await newUser.save();
    const u = newUser.toObject();
    delete u.password;
    res.status(201).json(u);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Update user (admin only). Body: role?, isActive?, name?
 * PATCH /users/:id
 */
router.patch("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }
    const { role, isActive, name } = req.body;
    const update = {};
    if (role !== undefined) update.role = role === "admin" ? "admin" : "user";
    if (isActive !== undefined) update.isActive = !!isActive;
    if (name !== undefined) update.name = String(name).trim();
    const user = await User.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, runValidators: true }
    ).lean();
    if (!user) return res.status(404).json({ message: "User not found" });
    const { password: _, ...safe } = user;
    res.json(safe);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to update user" });
  }
});

/**
 * Delete user (admin only). Prevent deleting self.
 * DELETE /users/:id
 */
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const targetId = req.params.id;
    if (userId === targetId) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }
    const user = await User.findByIdAndDelete(targetId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
