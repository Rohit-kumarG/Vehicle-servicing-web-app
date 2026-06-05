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
} = require("../controllers/garagecontroller");

const { protect } = require("../middleware/authMiddleware");
const { checkRole } = require("../middleware/roleMiddleware");

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

// Public routes
router.get("/", getAllGarages);
router.get("/:id", getGarageById);

module.exports = router;
