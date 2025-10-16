const express = require('express');
const router = express.Router();
const quoteController = require('../controllers/quoteController');
const distanceController = require('../controllers/distanceController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { quoteSchema } = require('../validators/schema');

// Calculate distance using Google Maps API (public endpoint for quote form)
router.post(
  '/calculate-distance',
  distanceController.calculateDistance
);

// Create a quote (only customers)
router.post(
  '/',
  authenticate,
  authorize('CUSTOMER'),
  validate(quoteSchema),
  quoteController.createQuote
);

// Get all quotes (ADMIN sees all, CUSTOMER sees own, PROVIDER sees theirs)
router.get(
  '/',
  authenticate,
  authorize('ADMIN', 'CUSTOMER', 'PROVIDER'),
  quoteController.getQuotes
);

// Get a single quote by ID
router.get(
  '/:id',
  authenticate,
  authorize('ADMIN', 'CUSTOMER', 'PROVIDER'),
  quoteController.getQuoteById
);

// Update quote status (PROVIDER and ADMIN only)
router.patch(
  '/:id/status',
  authenticate,
  authorize('ADMIN', 'PROVIDER'),
  quoteController.updateQuoteStatus
);

module.exports = router;