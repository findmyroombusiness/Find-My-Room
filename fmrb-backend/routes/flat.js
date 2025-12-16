const express = require("express");
const Flat = require("../models/Flat");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Middleware to verify JWT and set req.userId
function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token" });
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// Create a new flat listing (user must be logged in)
router.post("/", auth, async (req, res) => {
  try {
    // No type coercion, let Mongoose handle as string (like Room)
    const flat = new Flat({ ...req.body, user: req.userId });
    await flat.save();
    res.status(201).json(flat);
  } catch (err) {
    res.status(500).json({ message: "Failed to create flat", error: err.message });
  }
});

// Get all flat listings (public)
router.get("/", async (req, res) => {
  try {
    const flats = await Flat.find({ active: true }).populate("user", "name email").sort({ createdAt: -1 });
    res.json(flats);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch flats", error: err.message });
  }
});

// Get a single flat by ID (public)
router.get("/:id", async (req, res) => {
  try {
    const flat = await Flat.findById(req.params.id).populate("user", "name email");
    if (!flat) return res.status(404).json({ message: "Flat not found" });
    res.json(flat);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch flat", error: err.message });
  }
});

// Get all flats for the logged-in user
router.get("/my/listings", auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const flats = await Flat.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const total = await Flat.countDocuments({ user: req.userId });
    res.json({ listings: flats, total });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user flats", error: err.message });
  }
});

// Delete a flat (owner only)
router.delete("/:id", auth, async (req, res) => {
  try {
    console.log("[DELETE /api/flats/:id] Searching for flat with _id:", req.params.id);
    const flat = await Flat.findById(req.params.id);
    if (!flat) {
      console.log("[DELETE /api/flats/:id] Flat not found for _id:", req.params.id);
      return res.status(404).json({ message: "Flat not found" });
    }
    if (String(flat.user) !== String(req.userId)) return res.status(403).json({ message: "Not authorized" });
    await Flat.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete flat", error: err.message });
  }
});

// Update a flat (owner only)
router.put("/:id", auth, async (req, res) => {
  try {
    // No type coercion, let Mongoose handle as string (like Room)
    console.log("[PUT /api/flats/:id] Searching for flat with _id:", req.params.id);
    const flat = await Flat.findById(req.params.id);
    if (!flat) {
      console.log("[PUT /api/flats/:id] Flat not found for _id:", req.params.id);
      return res.status(404).json({ message: "Flat not found" });
    }
    if (String(flat.user) !== String(req.userId)) return res.status(403).json({ message: "Not authorized" });
    const updated = await Flat.findByIdAndUpdate(req.params.id, { ...req.body }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update flat", error: err.message });
  }
});

// Toggle active/inactive for a flat (owner only)
router.patch("/:id/toggle", auth, async (req, res) => {
  try {
  const flat = await Flat.findById(req.params.id);
  if (!flat) return res.status(404).json({ message: "Flat not found" });
  if (String(flat.user) !== String(req.userId)) return res.status(403).json({ message: "Not authorized" });
  const updated = await Flat.findByIdAndUpdate(req.params.id, { active: !flat.active }, { new: true });
  res.json({ message: "Toggled", active: updated.active });
  } catch (err) {
    res.status(500).json({ message: "Failed to toggle flat", error: err.message });
  }
});

module.exports = router;
