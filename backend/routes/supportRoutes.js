
const express = require("express");
const router = express.Router();
const { authenticate, optionalAuth } = require("../middleware/auth");
const supportController = require("../controllers/supportController");

// Public route - anyone can submit (with or without authentication)
router.post("/contact", optionalAuth, supportController.createSupportRequest);

// authenticateed routes - require authentication
router.get("/my-requests", authenticate, supportController.getMySupportRequests);
router.get("/:id", authenticate, supportController.getSupportRequestById);

// Admin-only routes
router.get("/", authenticate, supportController.getSupportRequests);
router.patch("/:id/status", authenticate, supportController.updateSupportRequestStatus);
router.delete("/:id", authenticate, supportController.deleteSupportRequest);
router.get("/stats/overview", authenticate, supportController.getSupportStatistics);

// Optional: GET route to check if support is available
router.get("/status/check", (req, res) => {
  res.json({
    available: true,
    responseTime: "Within 24 hours",
    urgentContact: "+27 XX XXX XXXX",
  });
});

module.exports = router;





