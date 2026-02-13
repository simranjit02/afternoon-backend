import express from "express";
import mongoose from "mongoose";
import Inquiry from "../models/Inquiry.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = express.Router();

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === String(id);

// Submit contact form (public)
router.post("/", async (req, res) => {
  try {
    const { firstname, lastname, email, phone, textmessage } = req.body;
    if (!firstname || !email || !textmessage) {
      return res.status(400).json({
        message: "First name, email and message are required.",
      });
    }
    const inquiry = new Inquiry({
      firstname,
      lastname: lastname || "",
      email,
      phone: phone || "",
      textmessage,
    });
    await inquiry.save();
    res.status(201).json({ message: "Inquiry submitted successfully", id: inquiry._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// List all inquiries (admin only)
router.get("/", requireAdmin, async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single inquiry (admin only)
router.get("/:id", requireAdmin, async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: "Invalid inquiry id" });
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });
    res.json(inquiry);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to load inquiry" });
  }
});

// Update inquiry (admin only) – e.g. set reviewed
router.patch("/:id", requireAdmin, async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: "Invalid inquiry id" });
    const { reviewed } = req.body;
    const update = {};
    if (typeof reviewed === "boolean") update.reviewed = reviewed;
    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true }
    );
    if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });
    res.json(inquiry);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to update inquiry" });
  }
});

export default router;
