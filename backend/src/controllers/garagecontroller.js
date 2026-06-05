const Garage = require("../models/garage");

// ==========================================
// CREATE GARAGE
// POST /api/garages
// Only garage role can create
// ==========================================
const createGarage = async (req, res) => {
  try {
    const {
      name,
      description,
      address,
      city,
      area,
      phone,
      email,
      services_offered,
      cnic,
      google_maps_link,
      operating_hours,
      latitude,
      longitude,
    } = req.body;

    if (!name || !address || !city || !area || !phone) {
      return res
        .status(400)
        .json({ message: "Please fill all required fields" });
    }

    // Check if garage owner already has a garage
    const garageExists = await Garage.findOne({ owner_id: req.user._id });
    if (garageExists) {
      return res
        .status(400)
        .json({ message: "You already have a garage registered" });
    }

    const garage = await Garage.create({
      owner_id: req.user._id,
      name,
      description,
      address,
      city,
      area,
      phone,
      email,
      services_offered: services_offered || [],
      cnic,
      google_maps_link,
      operating_hours: operating_hours || {},
      latitude,
      longitude,
    });

    res.status(201).json({
      message: "Garage created successfully",
      garage,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==========================================
// GET ALL GARAGES
// GET /api/garages
// Public route - customers can see all
// ==========================================
const getAllGarages = async (req, res) => {
  try {
    const { city, area, service } = req.query;

    let filter = { is_active: true };

    if (city) filter.city = { $regex: city, $options: "i" };
    if (area) filter.area = { $regex: area, $options: "i" };
    if (service) filter.services_offered = { $in: [service] };

    const garages = await Garage.find(filter)
      .populate("owner_id", "full_name phone")
      .sort({ rating: -1 });

    res.status(200).json(garages);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==========================================
// GET SINGLE GARAGE
// GET /api/garages/:id
// Public route
// ==========================================
const getGarageById = async (req, res) => {
  try {
    const garage = await Garage.findById(req.params.id).populate(
      "owner_id",
      "full_name phone",
    );

    if (!garage) {
      return res.status(404).json({ message: "Garage not found" });
    }

    res.status(200).json(garage);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==========================================
// GET MY GARAGE (for garage owner)
// GET /api/garages/my-garage
// ==========================================
const getMyGarage = async (req, res) => {
  try {
    const garage = await Garage.findOne({ owner_id: req.user._id });

    if (!garage) {
      return res
        .status(404)
        .json({ message: "No garage found for this account" });
    }

    res.status(200).json(garage);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==========================================
// UPDATE GARAGE
// PUT /api/garages/:id
// Only garage owner can update
// ==========================================
const updateGarage = async (req, res) => {
  try {
    const garage = await Garage.findById(req.params.id);

    if (!garage) {
      return res.status(404).json({ message: "Garage not found" });
    }

    // Make sure logged in user owns this garage
    if (garage.owner_id.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this garage" });
    }

    const updatedGarage = await Garage.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );

    res.status(200).json({
      message: "Garage updated successfully",
      garage: updatedGarage,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==========================================
// ADMIN - GET ALL GARAGES INCLUDING INACTIVE
// GET /api/garages/admin/all
// ==========================================
const adminGetAllGarages = async (req, res) => {
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
// ADMIN - ACTIVATE OR DEACTIVATE GARAGE
// PUT /api/garages/admin/:id/status
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

module.exports = {
  createGarage,
  getAllGarages,
  getGarageById,
  getMyGarage,
  updateGarage,
  adminGetAllGarages,
  toggleGarageStatus,
};
