const express = require("express");
const router = express.Router();

const {
  createBooking,
  getMyBookings,
  getGarageBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  adminGetAllBookings,
  payBooking,
} = require("../controllers/bookingController");

const { protect } = require("../middleware/authMiddleware");
const { checkRole } = require("../middleware/roleMiddleware");

// Customer routes
router.post("/", protect, checkRole("customer"), createBooking);
router.get("/my-bookings", protect, checkRole("customer"), getMyBookings);
router.put("/:id/cancel", protect, checkRole("customer"), cancelBooking);
router.put("/:id/pay", protect, checkRole("customer"), payBooking);

// Garage owner routes
router.get("/garage-bookings", protect, checkRole("garage"), getGarageBookings);
router.put("/:id/status", protect, checkRole("garage"), updateBookingStatus);

// Admin routes
router.get("/admin/all", protect, checkRole("admin"), adminGetAllBookings);

// Shared route
router.get("/:id", protect, getBookingById);

module.exports = router;
