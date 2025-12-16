const express = require("express");
const router = express.Router();
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google login route
router.post("/google-login", async (req, res) => {
  try {
    const { token } = req.body; // Google ID token
    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    // Verify Google ID token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Find or create user
    let user = await User.findOne({ googleId });
    if (!user) {
      user = new User({ googleId, email, name, picture });
      await user.save();
    }

    // Create JWT (ACCESS TOKEN ONLY)
    const accessToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "365d" } // recommended
    );

    // Send token to frontend (NO COOKIES)
    res.status(200).json({ token: accessToken, user });

  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
});

// Logout (frontend clears token)
router.post("/logout", (req, res) => {
  res.json({ message: "Logged out" });
});

module.exports = router;
