// backend/routes/booking.js - UPDATED
const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const { authenticate, authorize } = require("../middleware/auth");
const { bookingSchema } = require("../validators/schema");
const validate = require("../middleware/validate");

// Create booking  only a CUSTOMER
router.post(
  "/",
  authenticate,
  authorize("CUSTOMER"),
  validate(bookingSchema),
  bookingController.createBooking
);

// Get all bookings CUSTOMER sees their own, PROVIDER sees theirs, ADMIN sees all
router.get(
  "/",
  authenticate,
  authorize("CUSTOMER", "ADMIN", "PROVIDER"),
  bookingController.getBookings
);

// Get booking by ID customer (own booking), provider (if theirs), or admin
router.get(
  "/:id",
  authenticate,
  authorize("CUSTOMER", "PROVIDER", "ADMIN"),
  bookingController.getBookingById
);

// Update booking customer can edit their booking before confirmed, provider can update status, admin always
router.put(
  "/:id",
  authenticate,
  authorize("CUSTOMER", "PROVIDER", "ADMIN"),
  bookingController.updateBooking
);

// Delete booking admin only
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  bookingController.deleteBooking
);

module.exports = router;
