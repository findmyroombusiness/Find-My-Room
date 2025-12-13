const jwt = require("jsonwebtoken");

function handleTokenExpiration(err, req, res, next) {
  if (err.name === "TokenExpiredError") {
    // Clear the session cookie
    res.clearCookie("session", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    // Redirect the user to the login page
    return res.status(401).json({
      message: "Session expired. Please log in again.",
      redirect: "/",
    });
  }

  next(err);
}

module.exports = handleTokenExpiration;