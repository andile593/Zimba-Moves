const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const providerController = require('../controllers/providerController');
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
router.get('/applications/pending', providerController.getPendingApplications);
router.post('/providers/:id/review', providerController.reviewApplication);
router.post('/providers/:id/inspection', providerController.scheduleInspection);
router.post('/providers/:id/request-documents', providerController.requestDocuments);

module.exports = router;