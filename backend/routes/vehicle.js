const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const { vehicleSchema } = require("../validators/schema");
const {
  addVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleById,
  getVehiclesByProvider,
} = require("../controllers/vehiclesController");
const validate = require("../middleware/validate");

// Get all vehicles for a provider (public)
router.get("/:id/vehicles", getVehiclesByProvider);

// Get single vehicle by ID (public)
router.get("/:id", getVehicleById);

// Add vehicle to provider (authenticated - provider owner only)
router.post(
  "/:id/vehicles",
  authenticate,
  validate(vehicleSchema),
  authorize("PROVIDER"),
  addVehicle
);

// Update vehicle (authenticated - owner or admin)
router.put("/:id", authenticate, updateVehicle);

// Delete vehicle (authenticated - owner or admin)
router.delete("/:id", authenticate, deleteVehicle);

module.exports = router;
