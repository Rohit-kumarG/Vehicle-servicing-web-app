const express = require("express");
const router = express.Router();

const {
  addVehicle,
  getMyVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
} = require("../controllers/vehiclecontroller");

const { protect } = require("../middleware/authMiddleware");
const { checkRole } = require("../middleware/roleMiddleware");

// All routes are protected and only for customers
router.post("/", protect, checkRole("customer"), addVehicle);
router.get("/", protect, checkRole("customer"), getMyVehicles);
router.get("/:id", protect, checkRole("customer"), getVehicleById);
router.put("/:id", protect, checkRole("customer"), updateVehicle);
router.delete("/:id", protect, checkRole("customer"), deleteVehicle);

module.exports = router;
