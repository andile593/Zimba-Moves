const express = require("express");
const router = express.Router({ mergeParams: true });
const paymentCardController = require("../controllers/paymentCardController");
const { authenticate, authorize } = require("../middleware/auth");

// All routes require authentication
router.use(authenticate);

// Get all payment cards for a provider
router.get(
  "/",
  authorize("PROVIDER", "ADMIN"),
  paymentCardController.getPaymentCards
);

// Add a new payment card
router.post(
  "/",
  authorize("PROVIDER", "ADMIN"),
  paymentCardController.addPaymentCard
);

// Set card as default
router.put(
  "/:cardId/default",
  authorize("PROVIDER", "ADMIN"),
  paymentCardController.setDefaultCard
);

// Delete a payment card
router.delete(
  "/:cardId",
  authorize("PROVIDER", "ADMIN"),
  paymentCardController.deletePaymentCard
);

// Admin: Initiate payout
router.post(
  "/payout",
  authorize("ADMIN"),
  paymentCardController.initiateProviderPayout
);

module.exports = router;
