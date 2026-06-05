const Feedback = require("../models/feedback");
const Booking = require("../models/booking");
const Garage = require("../models/garage");

// ==========================================
// SUBMIT FEEDBACK
// POST /api/feedback
// Only customer can submit
// ==========================================
const submitFeedback = async (req, res) => {
  try {
    const { booking_id, rating, comment } = req.body;

    if (!booking_id || !rating) {
      return res
        .status(400)
        .json({ message: "Booking and rating are required" });
    }

    // Check booking exists and is completed
    const booking = await Booking.findById(booking_id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status !== "completed") {
      return res
        .status(400)
        .json({ message: "Can only review completed bookings" });
    }

    // Check customer owns this booking
    if (booking.customer_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Check feedback already submitted
    const feedbackExists = await Feedback.findOne({ booking_id });
    if (feedbackExists) {
      return res
        .status(400)
        .json({ message: "Feedback already submitted for this booking" });
    }

    // Auto determine sentiment based on rating
    let sentiment = "neutral";
    if (rating >= 4) sentiment = "positive";
    if (rating <= 2) sentiment = "negative";

    const feedback = await Feedback.create({
      booking_id,
      customer_id: req.user._id,
      garage_id: booking.garage_id,
      rating,
      comment,
      sentiment,
    });

    // Update garage rating
    const allFeedbacks = await Feedback.find({ garage_id: booking.garage_id });
    const avgRating =
      allFeedbacks.reduce((sum, f) => sum + f.rating, 0) / allFeedbacks.length;

    await Garage.findByIdAndUpdate(booking.garage_id, {
      rating: avgRating.toFixed(1),
    });

    res.status(201).json({
      message: "Feedback submitted successfully",
      feedback,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==========================================
// GET GARAGE REVIEWS
// GET /api/feedback/garage/:garageId
// Public route
// ==========================================
const getGarageReviews = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ garage_id: req.params.garageId })
      .populate("customer_id", "full_name")
      .sort({ createdAt: -1 });

    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==========================================
// GET MY FEEDBACKS (customer)
// GET /api/feedback/my-feedbacks
// ==========================================
const getMyFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ customer_id: req.user._id })
      .populate("garage_id", "name city")
      .populate("booking_id", "service_type scheduled_date")
      .sort({ createdAt: -1 });

    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==========================================
// GET ALL FEEDBACKS (admin)
// GET /api/feedback/admin/all
// ==========================================
const adminGetAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate("customer_id", "full_name")
      .populate("garage_id", "name city")
      .sort({ createdAt: -1 });

    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  submitFeedback,
  getGarageReviews,
  getMyFeedbacks,
  adminGetAllFeedbacks,
};
