const express = require("express");
const RoommateFlat = require("../models/RoommateFlat");
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

// Create a new roommate flat listing (user must be logged in)
router.post("/", auth, async (req, res) => {
  try {
    const flat = new RoommateFlat({ ...req.body, user: req.userId });
    await flat.save();
    res.status(201).json(flat);
  } catch (err) {
    res.status(500).json({ message: "Failed to create roommate flat", error: err.message });
  }
});

// Get all roommate flat listings (public)
// Get all roommate flat listings (public, paginated)
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const flats = await RoommateFlat.find({ active: true })
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    res.json({ listings: flats });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch roommate flats", error: err.message });
  }
});

// Get a single roommate flat by ID (public)
router.get("/:id", async (req, res) => {
  try {
    const flat = await RoommateFlat.findById(req.params.id).populate("user", "name email");
    if (!flat) return res.status(404).json({ message: "Roommate flat not found" });
    res.json(flat);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch roommate flat", error: err.message });
  }
});

// Get all roommate flats for the logged-in user
router.get("/my/listings", auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const flats = await RoommateFlat.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const total = await RoommateFlat.countDocuments({ user: req.userId });
    res.json({ listings: flats, total });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user roommate flats", error: err.message });
  }
});

// Delete a roommate flat (owner only)
router.delete("/:id", auth, async (req, res) => {
  try {
    const flat = await RoommateFlat.findById(req.params.id);
    if (!flat) return res.status(404).json({ message: "Roommate flat not found" });
    if (String(flat.user) !== String(req.userId)) return res.status(403).json({ message: "Not authorized" });
    await RoommateFlat.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete roommate flat", error: err.message });
  }
});

// Update a roommate flat (owner only)
router.put("/:id", auth, async (req, res) => {
  try {
    const flat = await RoommateFlat.findById(req.params.id);
    if (!flat) return res.status(404).json({ message: "Roommate flat not found" });
    if (String(flat.user) !== String(req.userId)) return res.status(403).json({ message: "Not authorized" });
    const updated = await RoommateFlat.findByIdAndUpdate(req.params.id, { ...req.body }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update roommate flat", error: err.message });
  }
});

// Toggle active/inactive for a roommate flat (owner only)
router.patch("/:id/toggle", auth, async (req, res) => {
  try {
    const flat = await RoommateFlat.findById(req.params.id);
    if (!flat) return res.status(404).json({ message: "Roommate flat not found" });
    if (String(flat.user) !== String(req.userId)) return res.status(403).json({ message: "Not authorized" });
    const updated = await RoommateFlat.findByIdAndUpdate(req.params.id, { active: !flat.active }, { new: true });
    res.json({ message: "Toggled", active: updated.active });
  } catch (err) {
    res.status(500).json({ message: "Failed to toggle roommate flat", error: err.message });
  }
});

module.exports = router;
