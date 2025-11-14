const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const providerController = require('../controllers/providerController');
const paymentCardController = require('../controllers/paymentCardController')
const { authenticate, authorize } = require('../middleware/auth');

// All routes here → Admin only
router.use(authenticate, authorize('ADMIN'));

// User management
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/ban', adminController.banUser);

// Bookings, quotes, complaints
router.get('/bookings', adminController.getAllBookings);
router.get('/quotes', adminController.getAllQuotes);
router.get('/complaints', adminController.getAllComplaints);
router.get('/analytics', adminController.getAnalytics);

// Payments and refunds
router.post('/refunds/:bookingId', adminController.triggerRefund);
router.put('/files/:id/review', adminController.reviewFile);

// Provider Application Management
router.get('/applications/pending', authenticate, authorize('ADMIN'), providerController.getPendingApplications);
router.post('/providers/:id/review', authenticate, authorize('ADMIN'), providerController.reviewApplication);
router.post('/providers/:id/inspection', authenticate, authorize('ADMIN'), providerController.scheduleInspection);
router.post('/providers/:id/documents', authenticate, authorize('ADMIN'), providerController.requestDocuments);
// In admin.js
router.post(
  "/providers/:providerId/payout",
  authorize("ADMIN"),
  paymentCardController.initiateProviderPayout
);

module.exports = router;