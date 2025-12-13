const mongoose = require("mongoose");

const HostelSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  images: [String],
  rent: { type: Number, required: true },
  address: { type: String, required: true },
  contact: { type: String, required: true },
  seater: { type: Number, required: true },
  forWhom: { type: String, required: true },
  breakfastTiming: { type: String, required: true },
  lunchTiming: { type: String, required: true },
  dinnerTiming: { type: String, required: true },
  hostelTiming: { type: String, required: true },
  amenities: [String],
  description: { type: String },
  mapLink: { type: String },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Hostel", HostelSchema);
