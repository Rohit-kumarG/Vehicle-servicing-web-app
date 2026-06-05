const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { protect } = require("../middleware/authMiddleware");
const Message = require("../models/Message");
const Booking = require("../models/booking");
const Garage = require("../models/garage");

// GET messages for a specific booking
router.get("/:bookingId", protect, async (req, res) => {
  try {
    const messages = await Message.find({ booking_id: req.params.bookingId })
      .sort({ createdAt: 1 });
    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching messages" });
  }
});

// POST message
router.post("/", protect, async (req, res) => {
  try {
    const { booking_id, content } = req.body;
    if (!booking_id || !content) {
      return res.status(400).json({ success: false, message: "booking_id and content required" });
    }

    const booking = await Booking.findById(booking_id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    let receiver_id;
    if (req.user._id.toString() === booking.customer_id.toString()) {
      const garage = await Garage.findById(booking.garage_id);
      if (!garage) {
        return res.status(404).json({ success: false, message: "Garage associated with booking not found" });
      }
      receiver_id = garage.owner_id;
    } else {
      receiver_id = booking.customer_id;
    }

    const message = new Message({
      booking_id,
      sender_id: req.user._id,
      receiver_id,
      content,
    });

    await message.save();
    res.status(201).json({ success: true, data: message });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error sending message" });
  }
});

module.exports = router;
