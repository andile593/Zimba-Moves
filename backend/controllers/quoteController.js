const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();

// Function for distance calculation using Google Maps API
async function calculateDistance(pickup, dropoff) {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.warn('GOOGLE_MAPS_API_KEY not configured, using fallback calculation');
      // Fallback to random distance if API key not configured
      return {
        distance: Math.floor(Math.random() * 20) + 1,
        duration: Math.floor(Math.random() * 60) + 10,
        distanceText: 'Estimated',
        durationText: 'Estimated'
      };
    }

    const url = 'https://maps.googleapis.com/maps/api/distancematrix/json';
    
    const response = await axios.get(url, {
      params: {
        origins: pickup.trim(),
        destinations: dropoff.trim(),
        units: 'metric',
        key: apiKey
      }
    });

    const data = response.data;

    if (data.status === "OK" && data.rows[0]?.elements[0]?.status === "OK") {
      const element = data.rows[0].elements[0];
      
      return {
        distance: parseFloat((element.distance.value / 1000).toFixed(2)), // km
        duration: Math.round(element.duration.value / 60), // minutes
        distanceText: element.distance.text,
        durationText: element.duration.text
      };
    }
    
    throw new Error('Unable to calculate distance from Google Maps');
  } catch (error) {
    console.error('Distance calculation error:', error.message);
    // Fallback to estimated distance
    return {
      distance: Math.floor(Math.random() * 20) + 1,
      duration: Math.floor(Math.random() * 60) + 10,
      distanceText: 'Estimated',
      durationText: 'Estimated'
    };
  }
}

// Create quote (CUSTOMER only, checks vehicle availability)
exports.createQuote = async (req, res) => {
  try {
    if (req.user.role !== 'CUSTOMER') {
      return res.status(403).json({ error: 'Only customers can request quotes' });
    }

    const { 
      providerId, 
      vehicleId, 
      pickup, 
      dropoff, 
      moveType, 
      helpersNeeded, 
      dateTime,
      estimatedDistance,
      estimatedDuration,
      distanceText,
      durationText
    } = req.body;

    // Validate required fields
    if (!providerId || !vehicleId || !pickup || !dropoff || !moveType || !dateTime) {
      return res.status(400).json({ 
        error: 'Missing required fields: providerId, vehicleId, pickup, dropoff, moveType, dateTime' 
      });
    }

    // Ensure provider & vehicle exist
    const provider = await prisma.provider.findUnique({ 
      where: { id: providerId },
      include: { user: true }
    });
    
    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    const vehicle = await prisma.vehicle.findUnique({ 
      where: { id: vehicleId } 
    });
    
    if (!vehicle || vehicle.providerId !== providerId) {
      return res.status(404).json({ 
        error: 'Vehicle not found or not linked to provider' 
      });
    }

    const requestedDate = new Date(dateTime);

    // Validate date is in the future
    if (requestedDate < new Date()) {
      return res.status(400).json({ 
        error: 'Booking date must be in the future' 
      });
    }

    // Check vehicle availability (no overlapping bookings)
    const overlappingBooking = await prisma.booking.findFirst({
      where: {
        vehicleId,
        dateTime: requestedDate,
        status: {
          in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS']
        }
      }
    });

    if (overlappingBooking) {
      return res.status(400).json({ 
        error: 'Vehicle not available at the requested date/time' 
      });
    }

    // Calculate or use provided distance
    let distanceData;
    if (estimatedDistance && estimatedDistance > 0) {
      // Use distance provided from frontend (already calculated)
      distanceData = {
        distance: parseFloat(estimatedDistance),
        duration: estimatedDuration || 0,
        distanceText: distanceText || `${estimatedDistance} km`,
        durationText: durationText || 'Estimated'
      };
    } else {
      // Calculate distance server-side
      distanceData = await calculateDistance(pickup, dropoff);
    }

    // Pricing calculation based on vehicle rates
    const baseRate = parseFloat(vehicle.baseRate) || 0;
    const perKmRate = parseFloat(vehicle.perKmRate) || 0;
    const helperRate = 150; // R150 per helper as per frontend
    const helpers = parseInt(helpersNeeded) || 0;

    // Calculate base cost
    let instantEstimate = baseRate + (distanceData.distance * perKmRate) + (helpers * helperRate);

    // Apply move type complexity multiplier
    const complexityMultipliers = {
      APARTMENT: 1.0,
      OFFICE: 1.3,
      SINGLE_ITEM: 0.7,
      OTHER: 1.0,
    };

    const multiplier = complexityMultipliers[moveType] || 1.0;
    instantEstimate = instantEstimate * multiplier;

    // Round to 2 decimal places
    instantEstimate = Math.round(instantEstimate * 100) / 100;

    // Create the quote
    const quote = await prisma.quote.create({
      data: {
        customerId: req.user.userId,
        providerId,
        vehicleId,
        pickup,
        dropoff,
        moveType,
        helpersRequired: helpers,
        instantEstimate,
        status: 'DRAFT',
        dateTime: requestedDate,
        distance: distanceData.distance,
        duration: distanceData.duration,
        distanceText: distanceData.distanceText,
        durationText: distanceData.durationText
      },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        provider: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true
              }
            }
          }
        },
        vehicle: true
      }
    });

    res.status(201).json({
      ...quote,
      message: 'Quote created successfully'
    });
  } catch (err) {
    console.error('Create quote error:', err);
    res.status(400).json({ 
      error: 'Failed to create quote', 
      details: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
    });
  }
};

// Get all quotes (filtered by role)
exports.getQuotes = async (req, res) => {
  try {
    let whereClause = {};

    // CUSTOMER: see only their own quotes
    if (req.user.role === 'CUSTOMER') {
      whereClause.customerId = req.user.userId;
    }
    // PROVIDER: see quotes related to them
    else if (req.user.role === 'PROVIDER') {
      const provider = await prisma.provider.findUnique({
        where: { userId: req.user.userId }
      });
      
      if (!provider) {
        return res.status(404).json({ error: 'Provider profile not found' });
      }
      
      whereClause.providerId = provider.id;
    }
    // ADMIN: see all quotes (no filter)

    const quotes = await prisma.quote.findMany({
      where: whereClause,
      include: { 
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        provider: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true
              }
            }
          }
        },
        vehicle: true 
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(quotes);
  } catch (err) {
    console.error('Get quotes error:', err);
    res.status(500).json({ 
      error: 'Failed to fetch quotes', 
      details: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
    });
  }
};

// Get quote by ID (CUSTOMER → own, PROVIDER → theirs, ADMIN → any)
exports.getQuoteById = async (req, res) => {
  try {
    const quote = await prisma.quote.findUnique({
      where: { id: req.params.id },
      include: { 
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        provider: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true
              }
            }
          }
        },
        vehicle: true 
      }
    });

    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    // Check authorization
    if (req.user.role === 'CUSTOMER' && quote.customerId !== req.user.userId) {
      return res.status(403).json({ error: 'Forbidden: Not your quote' });
    }

    if (req.user.role === 'PROVIDER') {
      const provider = await prisma.provider.findUnique({
        where: { userId: req.user.userId }
      });
      
      if (!provider || quote.providerId !== provider.id) {
        return res.status(403).json({ error: 'Forbidden: Not your quote' });
      }
    }

    // ADMIN can access any quote

    res.json(quote);
  } catch (err) {
    console.error('Get quote by ID error:', err);
    res.status(500).json({ 
      error: 'Failed to fetch quote', 
      details: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
    });
  }
};

// Update quote status (for providers and admins)
exports.updateQuoteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    const quote = await prisma.quote.findUnique({
      where: { id }
    });

    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    // Authorization check
    if (req.user.role === 'PROVIDER') {
      const provider = await prisma.provider.findUnique({
        where: { userId: req.user.userId }
      });
      
      if (!provider || quote.providerId !== provider.id) {
        return res.status(403).json({ error: 'Forbidden: Not your quote' });
      }
    }

    const updatedQuote = await prisma.quote.update({
      where: { id },
      data: { status },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        provider: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true
              }
            }
          }
        },
        vehicle: true
      }
    });

    res.json({
      ...updatedQuote,
      message: 'Quote status updated successfully'
    });
  } catch (err) {
    console.error('Update quote status error:', err);
    res.status(400).json({ 
      error: 'Failed to update quote status', 
      details: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
    });
  }
};