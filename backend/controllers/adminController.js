const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { 
        id: true, 
        email: true, 
        phone: true,
        firstName: true,
        lastName: true,
        role: true, 
        status: true,
        createdAt: true 
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users', details: err.message });
  }
};

// Ban/deactivate user
exports.banUser = async (req, res) => {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      data: { status: 'SUSPENDED' }
    });
    res.json({ message: 'User banned successfully', user: updatedUser });
  } catch (err) {
    res.status(400).json({ error: 'Failed to ban user', details: err.message });
  }
};

// Get all bookings
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: { 
        customer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }, 
        provider: {
          select: {
            id: true,
            company: true,
            city: true
          }
        }, 
        vehicle: {
          select: {
            id: true,
            type: true,
            plate: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings', details: err.message });
  }
};

// Get all quotes
exports.getAllQuotes = async (req, res) => {
  try {
    const quotes = await prisma.quote.findMany({
      include: { 
        customer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }, 
        provider: {
          select: {
            id: true,
            company: true
          }
        }, 
        vehicle: {
          select: {
            id: true,
            type: true,
            plate: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(quotes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch quotes', details: err.message });
  }
};

// Get all complaints
exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await prisma.complaint.findMany({
      include: { 
        customer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }, 
        booking: {
          select: {
            id: true,
            pickup: true,
            dropoff: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch complaints', details: err.message });
  }
};

// Trigger refund (stub)
exports.triggerRefund = async (req, res) => {
  try {
    const bookingId = req.params.bookingId;

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    // TODO: integrate with payment provider
    res.json({ message: `Refund triggered for booking ${bookingId}` });
  } catch (err) {
    res.status(400).json({ error: 'Failed to trigger refund', details: err.message });
  }
};

// Approve or reject a file
exports.reviewFile = async (req, res) => {
  try {
    const { status } = req.body; // APPROVED or REJECTED
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updatedFile = await prisma.file.update({
      where: { id: req.params.id },
      data: { status }
    });

    res.json({ message: `File ${status.toLowerCase()}`, file: updatedFile });
  } catch (err) {
    res.status(400).json({ error: 'Failed to update file status', details: err.message });
  }
};

// Get analytics data
exports.getAnalytics = async (req, res) => {
  try {
    // Revenue by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const bookings = await prisma.booking.findMany({
      where: {
        createdAt: {
          gte: sixMonthsAgo
        },
        paymentStatus: 'PAID'
      },
      select: {
        createdAt: true,
        pricing: true
      }
    });

    // Group by month
    const revenueByMonth = {};
    bookings.forEach(booking => {
      const month = new Date(booking.createdAt).toLocaleString('en-US', { month: 'short' });
      const amount = typeof booking.pricing === 'object' ? booking.pricing.total : booking.pricing;
      
      if (!revenueByMonth[month]) {
        revenueByMonth[month] = 0;
      }
      revenueByMonth[month] += amount || 0;
    });

    const revenue = Object.keys(revenueByMonth).map(month => ({
      month,
      total: revenueByMonth[month]
    }));

    // Top providers by bookings
    const topProviders = await prisma.booking.groupBy({
      by: ['providerId'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 5
    });

    // Get provider names
    const topProvidersWithNames = await Promise.all(
      topProviders.map(async (item) => {
        const provider = await prisma.provider.findUnique({
          where: { id: item.providerId },
          select: { company: true }
        });
        return {
          provider: provider?.company || 'Unknown',
          bookings: item._count.id
        };
      })
    );

    res.json({ 
      revenue, 
      topProviders: topProvidersWithNames 
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ error: "Failed to load analytics", details: err.message });
  }
}
