const express = require("express");
const Hostel = require("../models/Hostel");
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

// Create a new hostel listing (user must be logged in)
router.post("/", auth, async (req, res) => {
  try {
    // Create hostel object with explicit field assignments
    const hostelData = {
      rent: req.body.rent,
      address: req.body.address,
      contact: req.body.contact,
      seater: req.body.seater,
      forWhom: req.body.forWhom,
      hostelTiming: req.body.hostelTiming || "12:00 AM to 12:00 AM",
      breakfastTiming: req.body.breakfastTiming || "12:00 AM to 12:00 AM",
      lunchTiming: req.body.lunchTiming || "12:00 AM to 12:00 AM",
      dinnerTiming: req.body.dinnerTiming || "12:00 AM to 12:00 AM",
      amenities: req.body.amenities,
      description: req.body.description,
      mapLink: req.body.mapLink,
      images: req.body.images,
      user: req.userId,
    };
    const hostel = new Hostel(hostelData);
    await hostel.save();
    res.status(201).json(hostel);
  } catch (err) {
    res.status(500).json({ message: "Failed to create hostel", error: err.message });
  }
});

// Get all hostel listings (public)
router.get("/", async (req, res) => {
  try {
    const hostels = await Hostel.find({ active: true }).populate("user", "name email").sort({ createdAt: -1 });
    res.json(hostels);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch hostels", error: err.message });
  }
});

// Get a single hostel by ID (public)
router.get("/:id", async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.params.id).populate("user", "name email");
    if (!hostel) return res.status(404).json({ message: "Hostel not found" });
    res.json(hostel);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch hostel", error: err.message });
  }
});

// Get all hostels for the logged-in user
router.get("/my/listings", auth, async (req, res) => {
  try {
    const hostels = await Hostel.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(hostels);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user hostels", error: err.message });
  }
});

// Delete a hostel (owner only)
router.delete("/:id", auth, async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.params.id);
    if (!hostel) return res.status(404).json({ message: "Hostel not found" });
    if (String(hostel.user) !== String(req.userId)) return res.status(403).json({ message: "Not authorized" });
    await Hostel.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete hostel", error: err.message });
  }
});


// Update hostel listing (PUT)
router.put('/:id', auth, async (req, res) => {
  try {
    const updateData = {
      rent: req.body.rent,
      address: req.body.address,
      contact: req.body.contact,
      seater: req.body.seater,
      forWhom: req.body.forWhom,
      hostelTiming: req.body.hostelTiming || "12:00 AM to 12:00 AM",
      breakfastTiming: req.body.breakfastTiming || "12:00 AM to 12:00 AM",
      lunchTiming: req.body.lunchTiming || "12:00 AM to 12:00 AM",
      dinnerTiming: req.body.dinnerTiming || "12:00 AM to 12:00 AM",
      amenities: req.body.amenities,
      description: req.body.description,
      mapLink: req.body.mapLink,
      images: req.body.images,
    };
    const hostel = await Hostel.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!hostel) return res.status(404).json({ message: "Hostel not found" });
    res.json(hostel);
  } catch (err) {
    res.status(500).json({ message: "Failed to update hostel", error: err.message });
  }
});

module.exports = router;

// Toggle active/inactive for a hostel (owner only)
router.patch("/:id/toggle", auth, async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.params.id);
    if (!hostel) return res.status(404).json({ message: "Hostel not found" });
    if (String(hostel.user) !== String(req.userId)) return res.status(403).json({ message: "Not authorized" });
    const updated = await Hostel.findByIdAndUpdate(
      req.params.id,
      { active: !hostel.active },
      { new: true }
    );
    res.json({ message: "Toggled", active: updated.active });
  } catch (err) {
    res.status(500).json({ message: "Failed to toggle hostel", error: err.message });
  }
});
