const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentsController');
const webhookLogger = require('../middleware/webhookLogger');
const { authenticate, authorize } = require('../middleware/auth');
const { payLimiter, refundLimiter } = require('../middleware/rateLimiters');


// Paystack webhook - must use raw body
router.post(
  '/webhooks/paystack',
  express.raw({ type: 'application/json' }),
  webhookLogger('paystack'),
  paymentController.paystackWebhook
);


// Initiate payment (customer only, rate limited)
router.post(
  '/:bookingId/pay',
  authenticate,
  authorize('CUSTOMER'),
  payLimiter,
  paymentController.initiatePayment
);

// Verify payment (customer or admin)
router.get(
  '/:id/verify',
  authenticate,
  authorize('CUSTOMER', 'ADMIN'),
  paymentController.verifyPayment
);

// Initiate refund (admin only, rate limited)
router.post(
  '/:paymentId/refund',
  authenticate,
  authorize('ADMIN'),
  refundLimiter,
  paymentController.initiateRefund
);

// Check refund status (admin or provider)
router.get(
  '/:paymentId/refund-status',
  authenticate,
  authorize('ADMIN', 'PROVIDER'),
  paymentController.checkRefundStatus
);

module.exports = router;