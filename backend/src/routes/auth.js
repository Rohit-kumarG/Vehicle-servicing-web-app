const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  sendOTPCode,
  resetPassword,
  forgotPassword,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

// Public routes (no token needed)
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/send-otp", sendOTPCode);
router.post("/reset-password", resetPassword);

// Protected routes (token required)
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

module.exports = router;
