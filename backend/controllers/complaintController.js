const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create complaint (CUSTOMER only, must own the booking)
exports.createComplaint = async (req, res) => {
  try {
    if (req.user.role !== 'CUSTOMER') {
      return res.status(403).json({ error: 'Only customers can create complaints' });
    }

    const { bookingId, plateNumber, issueTarget, description } = req.body;

    // Ensure booking exists and belongs to this customer
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.customerId !== req.user.userId) {
      return res.status(403).json({ error: 'Forbidden: You can only complain about your own booking' });
    }

    const complaint = await prisma.complaint.create({
      data: {
        customerId: req.user.userId,
        bookingId,
        plateNumber,
        issueTarget,
        description,
        status: 'OPEN'
      }
    });

    res.status(201).json(complaint);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create complaint', details: err.message });
  }
};

// Get all complaints (ADMIN only)
exports.getComplaints = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden: Admins only' });
    }

    const complaints = await prisma.complaint.findMany({
      include: { customer: true, booking: true }
    });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch complaints', details: err.message });
  }
};

// Get complaint by ID (CUSTOMER → own, ADMIN → any)
exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await prisma.complaint.findUnique({
      where: { id: req.params.id },
      include: { customer: true, booking: true }
    });

    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    if (
      req.user.role === 'CUSTOMER' &&
      complaint.customerId !== req.user.userId
    ) {
      return res.status(403).json({ error: 'Forbidden: Not your complaint' });
    }

    if (req.user.role !== 'CUSTOMER' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json(complaint);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch complaint', details: err.message });
  }
};

// Update complaint status (ADMIN only)
exports.updateComplaintStatus = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden: Admins only' });
    }

    const { status } = req.body; // e.g. UNDER_REVIEW, RESOLVED, REJECTED

    const updatedComplaint = await prisma.complaint.update({
      where: { id: req.params.id },
      data: { status }
    });

    res.json(updatedComplaint);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update complaint', details: err.message });
  }
};
