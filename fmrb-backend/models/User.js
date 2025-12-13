const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: { type: String },
  picture: { type: String },
  favourites: [{ type: mongoose.Schema.Types.ObjectId }], // Array of favourited listing IDs
});

module.exports = mongoose.model("User", UserSchema);
