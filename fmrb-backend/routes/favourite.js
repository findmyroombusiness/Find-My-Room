
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Add a listing to favourites
router.post('/add', auth, async function(req, res) {
  const userId = req.userId;
  const { listingId } = req.body;
  if (!listingId) return res.status(400).json({ message: 'Missing listingId' });
  try {
    await User.findByIdAndUpdate(userId, { $addToSet: { favourites: listingId } });
    res.json({ message: 'Added to favourites' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add favourite', error: err.message });
  }
});

// Remove a listing from favourites
router.post('/remove', auth, async function(req, res) {
  const userId = req.userId;
  const { listingId } = req.body;
  if (!listingId) return res.status(400).json({ message: 'Missing listingId' });
  try {
    await User.findByIdAndUpdate(userId, { $pull: { favourites: listingId } });
    res.json({ message: 'Removed from favourites' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove favourite', error: err.message });
  }
});


// Get all favourites for logged-in user
router.get('/', auth, async function(req, res) {
  const userId = req.userId;
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const favIds = user.favourites || [];

    // Import all listing models
    const Flat = require('../models/Flat');
    const Hostel = require('../models/Hostel');
    const Pg = require('../models/Pg');
    const Room = require('../models/Room');
    const RoommateFlat = require('../models/RoommateFlat');
    const RoommateRoom = require('../models/RoommateRoom');

    // Query all collections for favourites
    let listings = [];
    listings.push(...await Flat.find({ _id: { $in: favIds }, active: true }).lean().exec());
    listings.push(...await Hostel.find({ _id: { $in: favIds }, active: true }).lean().exec());
    listings.push(...await Pg.find({ _id: { $in: favIds }, active: true }).lean().exec());
    listings.push(...await Room.find({ _id: { $in: favIds }, active: true }).lean().exec());
    listings.push(...await RoommateFlat.find({ _id: { $in: favIds }, active: true }).lean().exec());
    listings.push(...await RoommateRoom.find({ _id: { $in: favIds }, active: true }).lean().exec());

    // Add type to each listing for frontend navigation
    listings.forEach(l => {
      if (!l.type) {
        if (l.bhk) l.type = 'flat';
        else if (l.seater && l.breakfastTiming) l.type = 'hostel';
        else if (l.seater && !l.breakfastTiming) l.type = 'pg';
        else if (l.rooms && l.kitchen) l.type = 'room';
        else if (l.bhk && l.independent) l.type = 'roommateflat';
        else if (l.rooms && l.independent) l.type = 'roommateroom';
        else l.type = 'room';
      }
    });

    // Sort by createdAt descending (most recent first)
    listings = listings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const total = listings.length;
    const paginated = listings.slice(skip, skip + limit);
    res.json({ favourites: paginated, total });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get favourites', error: err.message });
  }
});

module.exports = router;
