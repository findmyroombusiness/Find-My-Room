const mongoose = require("mongoose");

const FlatSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  images: [String],
  rent: { type: Number, required: true },
  address: { type: String, required: true },
  contact: { type: String, required: true },
  bhk: { type: String, required: true },
  furnishing: { type: String, required: true },
  forWhom: { type: String, required: true },
  independent: { type: String, required: true },
  electricitybill: { type: String, required: true },
  waterbill: { type: String, required: true },
  food: { type: String, required: true },
  washrooms: { type: String, required: true },
  description: { type: String },
  mapLink: { type: String },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Flat", FlatSchema);
