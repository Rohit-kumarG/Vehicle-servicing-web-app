const mongoose = require("mongoose");

const garageSchema = new mongoose.Schema(
  {
    owner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: null,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    area: {
      type: String,
      required: true,
    },
    latitude: {
      type: Number,
      default: null,
    },
    longitude: {
      type: Number,
      default: null,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      default: null,
    },
    services_offered: {
      type: [String],
      default: [],
    },
    cnic: {
      type: String,
      default: null,
    },
    google_maps_link: {
      type: String,
      default: null,
    },
    operating_hours: {
      type: Map,
      of: {
        open: String,
        close: String,
      },
      default: {},
    },
    rating: {
      type: Number,
      default: 0,
    },
    total_bookings: {
      type: Number,
      default: 0,
    },
    average_wait_time: {
      type: Number,
      default: 0,
    },
    is_active: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Garage = mongoose.model("Garage", garageSchema);

module.exports = Garage;
