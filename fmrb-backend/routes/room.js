
const express = require("express");
const Room = require("../models/Room");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Get all roommate listings (public)
router.get("/roommate/all", async (req, res) => {
  try {
    const rooms = await Room.find({ type: "roommate" }).populate("user", "name email").sort({ createdAt: -1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch roommate rooms", error: err.message });
  }
});

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

// Create a new room listing (user must be logged in)
router.post("/", auth, async (req, res) => {
  try {
    const room = new Room({ ...req.body, user: req.userId });
    await room.save();
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: "Failed to create room", error: err.message });
  }
});

// Get all room listings (public)
router.get("/", async (req, res) => {
  try {
    const rooms = await Room.find({ active: true }).populate("user", "name email").sort({ createdAt: -1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch rooms", error: err.message });
  }
});

// Get a single room by ID (public)
router.get("/:id", async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate("user", "name email");
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch room", error: err.message });
  }
});

// Get all rooms for the logged-in user
router.get("/my/listings", auth, async (req, res) => {
  try {
    const rooms = await Room.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user rooms", error: err.message });
  }
});

// Update a room (owner only)
router.put("/:id", auth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });
    if (String(room.user) !== String(req.userId)) return res.status(403).json({ message: "Not authorized" });
    const updated = await Room.findByIdAndUpdate(req.params.id, { ...req.body }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update room", error: err.message });
  }
});

// Delete a room (owner only)
router.delete("/:id", auth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });
    if (String(room.user) !== String(req.userId)) return res.status(403).json({ message: "Not authorized" });
    await Room.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete room", error: err.message });
  }
});

module.exports = router;

// Toggle active/inactive for a room (owner only)
router.patch("/:id/toggle", auth, async (req, res) => {
  try {
  const room = await Room.findById(req.params.id);
  if (!room) return res.status(404).json({ message: "Room not found" });
  if (String(room.user) !== String(req.userId)) return res.status(403).json({ message: "Not authorized" });
  const updated = await Room.findByIdAndUpdate(req.params.id, { active: !room.active }, { new: true });
  res.json({ message: "Toggled", active: updated.active });
  } catch (err) {
    res.status(500).json({ message: "Failed to toggle room", error: err.message });
  }
});
