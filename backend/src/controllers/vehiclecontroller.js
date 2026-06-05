const Vehicle = require("../models/vehicle");

// ==========================================
// ADD VEHICLE
// POST /api/vehicles
// Only customer can add
// ==========================================
const addVehicle = async (req, res) => {
  try {
    const { make, model, year, registration_number } = req.body;

    if (!make || !model || !year || !registration_number) {
      return res
        .status(400)
        .json({ message: "Please fill all required fields" });
    }

    // Check if registration number already exists
    const vehicleExists = await Vehicle.findOne({ registration_number });
    if (vehicleExists) {
      return res
        .status(400)
        .json({ message: "Vehicle with this registration already exists" });
    }

    const vehicle = await Vehicle.create({
      customer_id: req.user._id,
      make,
      model,
      year,
      registration_number,
    });

    res.status(201).json({
      message: "Vehicle added successfully",
      vehicle,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==========================================
// GET MY VEHICLES
// GET /api/vehicles
// ==========================================
const getMyVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ customer_id: req.user._id });
    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==========================================
// GET SINGLE VEHICLE
// GET /api/vehicles/:id
// ==========================================
const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // Make sure customer owns this vehicle
    if (vehicle.customer_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.status(200).json(vehicle);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==========================================
// UPDATE VEHICLE
// PUT /api/vehicles/:id
// ==========================================
const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    if (vehicle.customer_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );

    res.status(200).json({
      message: "Vehicle updated successfully",
      vehicle: updatedVehicle,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==========================================
// DELETE VEHICLE
// DELETE /api/vehicles/:id
// ==========================================
const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    if (vehicle.customer_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Vehicle.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Vehicle deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  addVehicle,
  getMyVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
};
