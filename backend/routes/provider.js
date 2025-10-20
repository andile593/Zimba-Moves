const express = require("express");
const router = express.Router();
const providerController = require("../controllers/providerController");
const { authenticate, authorize } = require("../middleware/auth");
const { providerSchema, vehicleSchema } = require("../validators/schema");
const validate = require("../middleware/validate");
const upload = require("../middleware/upload");

// Public routes
router.get("/", providerController.getProviders);
router.get("/search/location", providerController.searchProvidersByLocation);
router.get("/:id", providerController.getProviderById);

// Provider routes - require authentication
router.get(
  "/me/profile",
  authenticate,
  authorize("PROVIDER"),
  providerController.getMyProvider
);

// Application routes
router.post(
  "/application",
  authenticate,
  authorize("PROVIDER"),
  providerController.createProviderApplication
);

// Regular provider creation (deprecated - use /application instead)
router.post(
  "/",
  authenticate,
  authorize("PROVIDER"),
  validate(providerSchema),
  providerController.createProvider
);

// Provider update/delete
router.put(
  "/:id",
  authenticate,
  authorize("PROVIDER", "ADMIN"),
  providerController.updateProvider
);
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  providerController.deleteProvider
);

// Vehicle routes
router.post(
  "/:id/vehicles",
  authenticate,
  authorize("PROVIDER"),
  validate(vehicleSchema),
  providerController.addVehicle
);
router.get(
  "/:id/vehicles",
  authenticate,
  authorize("PROVIDER", "ADMIN"),
  providerController.getVehiclesByProvider
);

// File upload routes
router.post(
  "/:id/files",
  authenticate,
  upload.single("file"),
  providerController.uploadProviderFile
);
router.get("/:id/files", authenticate, providerController.getProviderFiles);
router.delete(
  "/:id/files/:fileId",
  authenticate,
  providerController.deleteProviderFile
);

module.exports = router;
