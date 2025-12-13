const mongoose = require("mongoose");

const PgSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  images: [String],
  rent: { type: Number, required: true },
  address: { type: String, required: true },
  contact: { type: String, required: true },
  seater: { type: Number },
  rooms: { type: Number },
  furnishing: { type: String },
  forWhom: { type: String },
  cooking: { type: String },
  electricitybill: { type: String },
  waterbill: { type: String },
  food: { type: String },
  washroom: { type: String },
  kitchen: { type: String },
  timing: { type: String },
  description: { type: String },
  mapLink: { type: String },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Pg", PgSchema);
