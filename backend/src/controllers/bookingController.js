const Booking = require("../models/Booking");
const Garage = require("../models/Garage");
const Notification = require("../models/Notification");
// ==========================================
// CREATE BOOKING
// POST /api/bookings
// Only customer can book
// ==========================================
const createBooking = async (req, res) => {
  try {
    const {
      garage_id,
      vehicle_id,
      service_type,
      service_description,
      scheduled_date,
      scheduled_time,
      notes,
    } = req.body;

    if (!garage_id || !service_type || !scheduled_date || !scheduled_time) {
      return res
        .status(400)
        .json({ message: "Please fill all required fields" });
    }

    // Check if garage exists and is active
    const garage = await Garage.findById(garage_id);
    if (!garage || !garage.is_active) {
      return res
        .status(404)
        .json({ message: "Garage not found or not active" });
    }

    const booking = await Booking.create({
      customer_id: req.user._id,
      garage_id,
      vehicle_id: vehicle_id || null,
      service_type,
      service_description,
      scheduled_date,
      scheduled_time,
      notes,
    });

    // Update total bookings count in garage
    await Garage.findByIdAndUpdate(garage_id, {
      $inc: { total_bookings: 1 },
    });
    // Notify garage owner
    await Notification.create({
      user_id: garage.owner_id,
      title: "New Booking Received",
      message: `New booking for ${service_type} on ${scheduled_date}`,
      type: "booking",
    });

    // Notify customer
    await Notification.create({
      user_id: req.user._id,
      title: "Booking Confirmed",
      message: `Your booking for ${service_type} on ${scheduled_date} has been created`,
      type: "booking",
    });
    res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==========================================
// GET MY BOOKINGS (customer)
// GET /api/bookings/my-bookings
// ==========================================
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ customer_id: req.user._id })
      .populate("garage_id", "name address city phone")
      .populate("vehicle_id", "make model year registration_number")
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==========================================
// GET GARAGE BOOKINGS (garage owner)
// GET /api/bookings/garage-bookings
// ==========================================
const getGarageBookings = async (req, res) => {
  try {
    // Find garage owned by this user
    const garage = await Garage.findOne({ owner_id: req.user._id });
    if (!garage) {
      return res
        .status(404)
        .json({ message: "No garage found for this account" });
    }

    const bookings = await Booking.find({ garage_id: garage._id })
      .populate("customer_id", "full_name phone")
      .populate("vehicle_id", "make model year registration_number")
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==========================================
// GET SINGLE BOOKING
// GET /api/bookings/:id
// ==========================================
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("garage_id", "name address city phone")
      .populate("customer_id", "full_name phone")
      .populate("vehicle_id", "make model year registration_number");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==========================================
// UPDATE BOOKING STATUS (garage owner)
// PUT /api/bookings/:id/status
// ==========================================
const updateBookingStatus = async (req, res) => {
  try {
    const { status, estimated_cost, actual_cost, notes } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Find garage by owner
    const garage = await Garage.findOne({ owner_id: req.user._id });
    if (!garage) {
      return res.status(404).json({ message: "No garage found for this user" });
    }

    // Debug check - remove after fixing
    console.log("Garage ID:", garage._id.toString());
    console.log("Booking Garage ID:", booking.garage_id.toString());

    // Check if booking belongs to this garage
    if (garage._id.toString() !== booking.garage_id.toString()) {
      return res.status(403).json({
        message: "Not authorized",
        garage_id: garage._id,
        booking_garage_id: booking.garage_id,
      });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        status,
        estimated_cost: estimated_cost || booking.estimated_cost,
        actual_cost: actual_cost || booking.actual_cost,
        notes: notes || booking.notes,
      },
      { new: true },
    );
    const Notification = require("../models/Notification");

    // Notify customer about status change
    await Notification.create({
      user_id: booking.customer_id,
      title: "Booking Status Updated",
      message: `Your booking for ${booking.service_type} is now ${status}`,
      type: "booking",
    });
    res.status(200).json({
      message: "Booking status updated successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==========================================
// CANCEL BOOKING (customer)
// PUT /api/bookings/:id/cancel
// ==========================================
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Make sure customer owns this booking
    if (booking.customer_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Can only cancel pending or confirmed bookings
    if (!["pending", "confirmed"].includes(booking.status)) {
      return res.status(400).json({ message: "Cannot cancel this booking" });
    }

    booking.status = "cancelled";
    await booking.save();

    res.status(200).json({
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==========================================
// ADMIN GET ALL BOOKINGS
// GET /api/bookings/admin/all
// ==========================================
const adminGetAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("customer_id", "full_name phone")
      .populate("garage_id", "name city")
      .populate("vehicle_id", "make model year")
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getGarageBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  adminGetAllBookings,
};
