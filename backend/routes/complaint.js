const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const { authenticate, authorize } = require('../middleware/auth');
const { complaintSchema } = require('../validators/schema');
const validate = require('../middleware/validate');
// Customer submits complaint
router.post('/', authenticate, authorize('CUSTOMER'), validate(complaintSchema), complaintController.createComplaint);

// Admin-only: view + update complaints
router.get('/', authenticate, authorize('ADMIN'), complaintController.getComplaints);
router.get('/:id', authenticate, authorize('ADMIN'), complaintController.getComplaintById);
router.put('/:id', authenticate, authorize('ADMIN'), complaintController.updateComplaintStatus);

module.exports = router;
