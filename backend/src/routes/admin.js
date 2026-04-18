const express = require("express");
const router = express.Router();

const {
  getDashboardStats,
  getAllUsers,
  getUserById,
  deleteUser,
  getAllGarages,
  toggleGarageStatus,
  deleteGarage,
  getAllBookings,
} = require("../controllers/adminController");

const { protect } = require("../middleware/authMiddleware");
const { checkRole } = require("../middleware/roleMiddleware");

// All routes are admin only
router.use(protect, checkRole("admin"));

router.get("/stats", getDashboardStats);

router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.delete("/users/:id", deleteUser);

router.get("/garages", getAllGarages);
router.put("/garages/:id/status", toggleGarageStatus);
router.delete("/garages/:id", deleteGarage);

router.get("/bookings", getAllBookings);

module.exports = router;
