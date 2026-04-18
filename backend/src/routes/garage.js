const express = require("express");
const router = express.Router();

const {
  createGarage,
  getAllGarages,
  getGarageById,
  getMyGarage,
  updateGarage,
  adminGetAllGarages,
  toggleGarageStatus,
} = require("../controllers/garageController");

const { protect } = require("../middleware/authMiddleware");
const { checkRole } = require("../middleware/roleMiddleware");

// Public routes
router.get("/", getAllGarages);
router.get("/:id", getGarageById);

// Garage owner routes
router.post("/", protect, checkRole("garage"), createGarage);
router.get("/owner/my-garage", protect, checkRole("garage"), getMyGarage);
router.put("/:id", protect, checkRole("garage"), updateGarage);

// Admin routes
router.get("/admin/all", protect, checkRole("admin"), adminGetAllGarages);
router.put(
  "/admin/:id/status",
  protect,
  checkRole("admin"),
  toggleGarageStatus,
);

module.exports = router;
