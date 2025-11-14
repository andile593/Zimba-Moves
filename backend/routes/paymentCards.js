const express = require("express");
const router = express.Router({ mergeParams: true }); // Keep mergeParams!
const paymentCardController = require("../controllers/paymentCardController");
const { authenticate, authorize } = require("../middleware/auth");

router.use(authenticate);

// Get all payouts for this provider
router.get(
  "/payouts",
  authorize("PROVIDER", "ADMIN"),
  paymentCardController.getProviderPayouts
);

// Get all payment cards
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

module.exports = router;