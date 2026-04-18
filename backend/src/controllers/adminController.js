const User = require("../models/User");
const Garage = require("../models/Garage");
const Booking = require("../models/Booking");
const Feedback = require("../models/Feedback");

// ==========================================
// GET DASHBOARD STATS
// GET /api/admin/stats
// ==========================================
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "customer" });
    const totalGarages = await Garage.countDocuments();
    const activeGarages = await Garage.countDocuments({ is_active: true });
    const totalBookings = await Booking.countDocuments();
    const completedBookings = await Booking.countDocuments({
      status: "completed",
    });
    const pendingBookings = await Booking.countDocuments({ status: "pending" });
    const cancelledBookings = await Booking.countDocuments({
      status: "cancelled",
    });
    const totalFeedbacks = await Feedback.countDocuments();

    res.status(200).json({
      users: {
        total: totalUsers,
      },
      garages: {
        total: totalGarages,
        active: activeGarages,
        inactive: totalGarages - activeGarages,
      },
      bookings: {
        total: totalBookings,
        completed: completedBookings,
        pending: pendingBookings,
        cancelled: cancelledBookings,
      },
      feedbacks: {
        total: totalFeedbacks,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==========================================
// GET ALL USERS
// GET /api/admin/users
// ==========================================
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==========================================
// GET SINGLE USER
// GET /api/admin/users/:id
// ==========================================
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==========================================
// DELETE USER
// DELETE /api/admin/users/:id
// ==========================================
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==========================================
// GET ALL GARAGES
// GET /api/admin/garages
// ==========================================
const getAllGarages = async (req, res) => {
  try {
    const garages = await Garage.find()
      .populate("owner_id", "full_name email phone")
      .sort({ createdAt: -1 });

    res.status(200).json(garages);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==========================================
// TOGGLE GARAGE STATUS
// PUT /api/admin/garages/:id/status
// ==========================================
const toggleGarageStatus = async (req, res) => {
  try {
    const garage = await Garage.findById(req.params.id);

    if (!garage) {
      return res.status(404).json({ message: "Garage not found" });
    }

    garage.is_active = !garage.is_active;
    await garage.save();

    res.status(200).json({
      message: `Garage ${garage.is_active ? "activated" : "deactivated"} successfully`,
      garage,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==========================================
// DELETE GARAGE
// DELETE /api/admin/garages/:id
// ==========================================
const deleteGarage = async (req, res) => {
  try {
    const garage = await Garage.findById(req.params.id);

    if (!garage) {
      return res.status(404).json({ message: "Garage not found" });
    }

    await Garage.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Garage deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==========================================
// GET ALL BOOKINGS
// GET /api/admin/bookings
// ==========================================
const getAllBookings = async (req, res) => {
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
  getDashboardStats,
  getAllUsers,
  getUserById,
  deleteUser,
  getAllGarages,
  toggleGarageStatus,
  deleteGarage,
  getAllBookings,
};
