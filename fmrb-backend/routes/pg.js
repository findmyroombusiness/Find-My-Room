const express = require("express");
const Pg = require("../models/Pg");
const jwt = require("jsonwebtoken");

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

// Create a new PG listing (user must be logged in)
router.post("/", auth, async (req, res) => {
  try {
    const pg = new Pg({ ...req.body, user: req.userId });
    await pg.save();
    res.status(201).json(pg);
  } catch (err) {
    res.status(500).json({ message: "Failed to create PG", error: err.message });
  }
});

// Get all PG listings (public)
router.get("/", async (req, res) => {
  try {
    const pgs = await Pg.find({ active: true }).populate("user", "name email").sort({ createdAt: -1 });
    res.json(pgs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch PGs", error: err.message });
  }
});

// Get a single PG by ID (public)
// Get all PGs for the logged-in user
router.get("/my/listings", auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const pgs = await Pg.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const total = await Pg.countDocuments({ user: req.userId });
    res.json({ listings: pgs, total });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user PGs", error: err.message });
  }
});

// Delete a PG (owner only)
router.delete("/:id", auth, async (req, res) => {
  try {
    const pg = await Pg.findById(req.params.id);
    if (!pg) return res.status(404).json({ message: "PG not found" });
    if (String(pg.user) !== String(req.userId)) return res.status(403).json({ message: "Not authorized" });
    await Pg.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete PG", error: err.message });
  }
});

// Get a single PG by ID (public)
const mongoose = require('mongoose');
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid PG id" });
    }
    const pg = await Pg.findById(req.params.id).populate("user", "name email");
    if (!pg) return res.status(404).json({ message: "PG not found" });
    res.json(pg);
  } catch (err) {
    console.error("Error fetching PG detail:", err);
    res.status(500).json({ message: "Failed to fetch PG", error: err.message });
  }
});

// Update a PG (owner only)
router.put("/:id", auth, async (req, res) => {
  try {
    const pg = await Pg.findById(req.params.id);
    if (!pg) return res.status(404).json({ message: "PG not found" });
    if (String(pg.user) !== String(req.userId)) return res.status(403).json({ message: "Not authorized" });
    const updated = await Pg.findByIdAndUpdate(req.params.id, { ...req.body }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update PG", error: err.message });
  }
});

// Toggle active/inactive for a PG (owner only)
router.patch("/:id/toggle", auth, async (req, res) => {
  try {
  const pg = await Pg.findById(req.params.id);
  if (!pg) return res.status(404).json({ message: "PG not found" });
  if (String(pg.user) !== String(req.userId)) return res.status(403).json({ message: "Not authorized" });
  const updated = await Pg.findByIdAndUpdate(req.params.id, { active: !pg.active }, { new: true });
  res.json({ message: "Toggled", active: updated.active });
  } catch (err) {
    res.status(500).json({ message: "Failed to toggle PG", error: err.message });
  }
});

module.exports = router;
