const express = require("express");
const router = express.Router();

const {
  submitFeedback,
  getGarageReviews,
  getMyFeedbacks,
  adminGetAllFeedbacks,
} = require("../controllers/feedbackController");

const { protect } = require("../middleware/authMiddleware");
const { checkRole } = require("../middleware/roleMiddleware");

// Public routes
router.get("/garage/:garageId", getGarageReviews);

// Customer routes
router.post("/", protect, checkRole("customer"), submitFeedback);
router.get("/my-feedbacks", protect, checkRole("customer"), getMyFeedbacks);

// Admin routes
router.get("/admin/all", protect, checkRole("admin"), adminGetAllFeedbacks);

module.exports = router;
