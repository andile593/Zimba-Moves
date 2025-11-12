
const express = require("express");
const router = express.Router();
const { authenticate, optionalAuth } = require("../middleware/auth");
const supportController = require("../controllers/supportController");

router.post("/contact", optionalAuth, supportController.createSupportRequest);

router.get("/my-requests", authenticate, supportController.getMySupportRequests);
router.get("/:id", authenticate, supportController.getSupportRequestById);

router.get("/", authenticate, supportController.getSupportRequests);
router.patch("/:id/status", authenticate, supportController.updateSupportRequestStatus);
router.delete("/:id", authenticate, supportController.deleteSupportRequest);
router.get("/stats/overview", authenticate, supportController.getSupportStatistics);

module.exports = router;





