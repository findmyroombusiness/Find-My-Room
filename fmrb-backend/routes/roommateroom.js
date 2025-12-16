const express = require("express");
const RoommateRoom = require("../models/RoommateRoom");
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

// Create a new roommate room listing (user must be logged in)
router.post("/", auth, async (req, res) => {
  try {
    const room = new RoommateRoom({ ...req.body, user: req.userId });
    await room.save();
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: "Failed to create roommate room", error: err.message });
  }
});

// Get all roommate room listings (public)
// Get all roommate room listings (public, paginated)
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const rooms = await RoommateRoom.find({ active: true })
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    res.json({ listings: rooms });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch roommate rooms", error: err.message });
  }
});

// Get a single roommate room by ID (public)
router.get("/:id", async (req, res) => {
  try {
    const room = await RoommateRoom.findById(req.params.id).populate("user", "name email");
    if (!room) return res.status(404).json({ message: "Roommate room not found" });
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch roommate room", error: err.message });
  }
});

// Get all roommate rooms for the logged-in user
router.get("/my/listings", auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const rooms = await RoommateRoom.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const total = await RoommateRoom.countDocuments({ user: req.userId });
    res.json({ listings: rooms, total });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user roommate rooms", error: err.message });
  }
});

// Delete a roommate room (owner only)
router.delete("/:id", auth, async (req, res) => {
  try {
    const room = await RoommateRoom.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Roommate room not found" });
    if (String(room.user) !== String(req.userId)) return res.status(403).json({ message: "Not authorized" });
    await RoommateRoom.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete roommate room", error: err.message });
  }
});

// Update a roommate room (owner only)
router.put("/:id", auth, async (req, res) => {
  try {
    const room = await RoommateRoom.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Roommate room not found" });
    if (String(room.user) !== String(req.userId)) return res.status(403).json({ message: "Not authorized" });
    const updated = await RoommateRoom.findByIdAndUpdate(req.params.id, { ...req.body }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update roommate room", error: err.message });
  }
});

// Toggle active/inactive for a roommate room (owner only)
router.patch("/:id/toggle", auth, async (req, res) => {
  try {
  const room = await RoommateRoom.findById(req.params.id);
  if (!room) return res.status(404).json({ message: "Roommate room not found" });
  if (String(room.user) !== String(req.userId)) return res.status(403).json({ message: "Not authorized" });
  const updated = await RoommateRoom.findByIdAndUpdate(req.params.id, { active: !room.active }, { new: true });
  res.json({ message: "Toggled", active: updated.active });
  } catch (err) {
    res.status(500).json({ message: "Failed to toggle roommate room", error: err.message });
  }
});

module.exports = router;
