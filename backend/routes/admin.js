const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

// All routes here → Admin only
router.use(authenticate, authorize('ADMIN'));

router.get('/users', adminController.getAllUsers);
router.put('/users/:id/ban', adminController.banUser);

router.get('/bookings', adminController.getAllBookings);
router.get('/quotes', adminController.getAllQuotes);
router.get('/complaints', adminController.getAllComplaints);
router.get('/analytics', adminController.getAnalytics);

router.post('/refunds/:bookingId', adminController.triggerRefund);
router.put('/files/:id/review', adminController.reviewFile);


module.exports = router;
