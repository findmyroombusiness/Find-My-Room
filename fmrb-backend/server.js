const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

// Routes
const authRoute = require("./routes/auth"); // auth.js
const roomRoute = require("./routes/room");
const flatRoute = require("./routes/flat");
const hostelRoutes = require("./routes/hostel");
const pgRoutes = require("./routes/pg");
const roommateRoomRoute = require("./routes/roommateroom");
const roommateFlatRoute = require("./routes/roommateflat");
const favouriteRoute = require("./routes/favourite");

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS setup: allow local dev and deployed frontend
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://find-my-room.onrender.com"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.options("*", cors());

// ✅ COOP / COEP headers for window.postMessage and cross-origin safety
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});

// Routes
app.use("/api/auth", authRoute);
app.use("/api/rooms", roomRoute);
app.use("/api/roommaterooms", roommateRoomRoute);
app.use("/api/flats", flatRoute);
app.use("/api/hostels", hostelRoutes);
app.use("/api/pgs", pgRoutes);
app.use("/api/roommateflats", roommateFlatRoute);
app.use("/api/favourites", favouriteRoute);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  dbName: "fmrb",
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.error("MongoDB connection error:", err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
