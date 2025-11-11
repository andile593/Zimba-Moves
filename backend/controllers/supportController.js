const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendSupportContactEmail } = require('../services/emailService');

// Create support request (PUBLIC - anyone can contact support)
exports.createSupportRequest = async (req, res) => {
  try {
    console.log('📥 Received support request:', JSON.stringify(req.body, null, 2));

    const { subject, message } = req.body;

    // Validation
    if (!subject || subject.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: 'Subject is required' 
      });
    }

    if (!message || message.trim().length < 10) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: 'Message must be at least 10 characters' 
      });
    }

    if (subject.length > 200) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: 'Subject must be less than 200 characters' 
      });
    }

    if (message.length > 5000) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: 'Message must be less than 5000 characters' 
      });
    }

    // Get user info if authenticated, otherwise use guest
    const userInfo = {
      name: req.user 
        ? `${req.user.firstName} ${req.user.lastName}`
        : 'Guest User',
      email: req.user?.email || null,
      userId: req.user?.userId || null,
      role: req.user?.role || 'GUEST'
    };

    console.log('👤 User info:', userInfo);

    // Save support request to database (optional - for tracking)
    const supportRequest = await prisma.supportRequest.create({
      data: {
        userId: userInfo.userId,
        subject: subject.trim(),
        message: message.trim(),
        status: 'OPEN',
        userEmail: userInfo.email,
        userName: userInfo.name,
      }
    });

    console.log('💾 Support request saved to DB:', supportRequest.id);

    // Prepare email data
    const emailData = {
      subject: subject.trim(),
      message: message.trim(),
    };

    // Send emails (to admin and confirmation to user)
    console.log('📧 Sending support emails...');
    const emailResult = await sendSupportContactEmail(emailData, userInfo);

    if (!emailResult.success) {
      console.error('⚠️ Email failed but request saved:', emailResult.error);
      // Still return success since we saved to DB
      return res.status(200).json({
        success: true,
        message: 'Your inquiry has been saved. Our team will review it soon.',
        requestId: supportRequest.id,
        emailSent: false
      });
    }

    console.log('✅ Support request created and emails sent');

    res.status(201).json({
      success: true,
      message: 'Your inquiry has been sent successfully. We\'ll get back to you soon!',
      requestId: supportRequest.id,
      emailSent: true
    });

  } catch (err) {
    console.error('❌ Error creating support request:', err);
    res.status(500).json({ 
      error: 'Failed to create support request', 
      details: err.message 
    });
  }
};

// Get all support requests (ADMIN only)
exports.getSupportRequests = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden: Admins only' });
    }

    const { status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const where = status ? { status } : {};

    const [supportRequests, total] = await Promise.all([
      prisma.supportRequest.findMany({
        where,
        include: { 
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.supportRequest.count({ where })
    ]);

    res.json({
      data: supportRequests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (err) {
    console.error('❌ Error fetching support requests:', err);
    res.status(500).json({ 
      error: 'Failed to fetch support requests', 
      details: err.message 
    });
  }
};

// Get support request by ID (ADMIN or request owner)
exports.getSupportRequestById = async (req, res) => {
  try {
    const supportRequest = await prisma.supportRequest.findUnique({
      where: { id: req.params.id },
      include: { 
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        }
      }
    });

    if (!supportRequest) {
      return res.status(404).json({ error: 'Support request not found' });
    }

    // Check permissions: admin or owner
    if (req.user.role !== 'ADMIN' && supportRequest.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Forbidden: Not your support request' });
    }

    res.json(supportRequest);

  } catch (err) {
    console.error('❌ Error fetching support request:', err);
    res.status(500).json({ 
      error: 'Failed to fetch support request', 
      details: err.message 
    });
  }
};

// Get user's own support requests
exports.getMySupportRequests = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const supportRequests = await prisma.supportRequest.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(supportRequests);

  } catch (err) {
    console.error('❌ Error fetching user support requests:', err);
    res.status(500).json({ 
      error: 'Failed to fetch your support requests', 
      details: err.message 
    });
  }
};

// Update support request status (ADMIN only)
exports.updateSupportRequestStatus = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden: Admins only' });
    }

    const { status, adminNotes } = req.body;

    // Validate status
    const validStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status',
        details: `Status must be one of: ${validStatuses.join(', ')}` 
      });
    }

    const updatedRequest = await prisma.supportRequest.update({
      where: { id: req.params.id },
      data: { 
        status,
        adminNotes: adminNotes || undefined,
        resolvedAt: status === 'RESOLVED' || status === 'CLOSED' ? new Date() : undefined,
        resolvedBy: status === 'RESOLVED' || status === 'CLOSED' ? req.user.userId : undefined
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    console.log('✅ Support request status updated:', updatedRequest.id, '→', status);

    res.json(updatedRequest);

  } catch (err) {
    console.error('❌ Error updating support request:', err);
    res.status(400).json({ 
      error: 'Failed to update support request', 
      details: err.message 
    });
  }
};

// Delete support request (ADMIN only)
exports.deleteSupportRequest = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden: Admins only' });
    }

    await prisma.supportRequest.delete({
      where: { id: req.params.id }
    });

    console.log('🗑️ Support request deleted:', req.params.id);

    res.json({ 
      success: true,
      message: 'Support request deleted successfully' 
    });

  } catch (err) {
    console.error('❌ Error deleting support request:', err);
    res.status(400).json({ 
      error: 'Failed to delete support request', 
      details: err.message 
    });
  }
};

// Get support statistics (ADMIN only)
exports.getSupportStatistics = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden: Admins only' });
    }

    const [
      totalRequests,
      openRequests,
      inProgressRequests,
      resolvedRequests,
      closedRequests,
      avgResolutionTime
    ] = await Promise.all([
      prisma.supportRequest.count(),
      prisma.supportRequest.count({ where: { status: 'OPEN' } }),
      prisma.supportRequest.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.supportRequest.count({ where: { status: 'RESOLVED' } }),
      prisma.supportRequest.count({ where: { status: 'CLOSED' } }),
      prisma.supportRequest.aggregate({
        where: { 
          status: { in: ['RESOLVED', 'CLOSED'] },
          resolvedAt: { not: null }
        },
        _avg: {
          // This would need a computed field in Prisma
          // For now, we'll fetch and calculate manually
        }
      })
    ]);

    res.json({
      total: totalRequests,
      byStatus: {
        open: openRequests,
        inProgress: inProgressRequests,
        resolved: resolvedRequests,
        closed: closedRequests
      },
      activeRequests: openRequests + inProgressRequests,
      completedRequests: resolvedRequests + closedRequests
    });

  } catch (err) {
    console.error('❌ Error fetching support statistics:', err);
    res.status(500).json({ 
      error: 'Failed to fetch statistics', 
      details: err.message 
    });
  }
};