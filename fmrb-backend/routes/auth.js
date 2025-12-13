const express = require("express");
const router = express.Router();
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


// Google login route
router.post("/google-login", async (req, res) => {
  try {
    const { token } = req.body; // ID token from frontend
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
    // Create access and refresh tokens
    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    // Set tokens as httpOnly cookies
    res.cookie("session", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    // Respond with token and user data
    res.status(200).json({ token: accessToken, user });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
});

// Refresh token endpoint
router.post("/refresh-token", async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }
    let payload;
    try {
      payload = jwt.verify(refreshToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }
    // Issue new access token
    const accessToken = jwt.sign({ id: payload.id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });
    res.cookie("session", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    res.status(200).json({ token: accessToken });
  } catch (err) {
    res.status(401).json({ message: "Failed to refresh token", error: err.message });
  }
});

// Logout route: clear cookie
router.post("/logout", (req, res) => {
  res.clearCookie("session", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.json({ message: "Logged out" });
});
module.exports = router;
