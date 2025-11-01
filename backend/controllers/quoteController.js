
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();
const { calculatePrice, validatePricingInputs } = require('../utils/pricingCalculator');

// Function for distance calculation using Google Maps API
async function calculateDistance(pickup, dropoff) {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.warn('GOOGLE_MAPS_API_KEY not configured, using fallback calculation');
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
        distance: parseFloat((element.distance.value / 1000).toFixed(2)),
        duration: Math.round(element.duration.value / 60),
        distanceText: element.distance.text,
        durationText: element.duration.text
      };
    }
    
    throw new Error('Unable to calculate distance from Google Maps');
  } catch (error) {
    console.error('Distance calculation error:', error.message);
    return {
      distance: Math.floor(Math.random() * 20) + 1,
      duration: Math.floor(Math.random() * 60) + 10,
      distanceText: 'Estimated',
      durationText: 'Estimated'
    };
  }
}

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

    if (!providerId || !vehicleId || !pickup || !dropoff || !moveType || !dateTime) {
      return res.status(400).json({ 
        error: 'Missing required fields: providerId, vehicleId, pickup, dropoff, moveType, dateTime' 
      });
    }

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

    if (requestedDate < new Date()) {
      return res.status(400).json({ 
        error: 'Booking date must be in the future' 
      });
    }

    // Check vehicle availability
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
      distanceData = {
        distance: parseFloat(estimatedDistance),
        duration: estimatedDuration || 0,
        distanceText: distanceText || `${estimatedDistance} km`,
        durationText: durationText || 'Estimated'
      };
    } else {
      distanceData = await calculateDistance(pickup, dropoff);
    }

    
    const baseRate = parseFloat(vehicle.baseRate) || 250;
    const perKmRate = parseFloat(vehicle.perKmRate) || 0;
    const loadFee = parseFloat(vehicle.loadFee) || 150;
    const helpersCount = parseInt(helpersNeeded) || 0;
    
    // Validate pricing inputs
    const validation = validatePricingInputs({
      distance: distanceData.distance,
      perKmRate,
      baseRate,
      loadFee
    });

    if (!validation.valid) {
      return res.status(400).json({ 
        error: 'Invalid pricing parameters',
        details: validation.errors 
      });
    }

    const pricing = calculatePrice({
      distance: distanceData.distance,
      baseRate: baseRate,
      perKmRate: perKmRate,
      loadFee: loadFee,
      moveType: moveType
    });

    // Log pricing breakdown for debugging
    console.log('RAS Pricing Breakdown:', {
      vehicleId,
      baseRate: pricing.baseRate,
      distanceCost: pricing.distanceCost,
      loadFee: pricing.loadFee,
      helpersCost: pricing.helpersCost, 
      helpersCount, 
      subtotal: pricing.subtotal,
      multiplier: pricing.complexityMultiplier,
      total: pricing.total,
      minimumApplied: pricing.minimumApplied
    });

    // Create the quote with detailed pricing
    const quote = await prisma.quote.create({
      data: {
        customerId: req.user.userId,
        providerId,
        vehicleId,
        pickup,
        dropoff,
        moveType,
        helpersRequired: helpersCount,
        instantEstimate: pricing.total,
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

    // Include pricing breakdown in response
    res.status(201).json({
      ...quote,
      pricingBreakdown: {
        baseRate: pricing.baseRate,
        distanceCost: pricing.distanceCost,
        loadFee: pricing.loadFee,
        helpersCost: 0,
        subtotal: pricing.subtotal,
        complexityMultiplier: pricing.complexityMultiplier,
        total: pricing.total,
        minimumApplied: pricing.minimumApplied,
        formula: `R${pricing.baseRate} (base) + R${pricing.distanceCost} (${distanceData.distance}km) + R${pricing.loadFee} (load) × ${pricing.complexityMultiplier} (${moveType}) = R${pricing.total}${helpersCount > 0 ? ` | ${helpersCount} helper(s) included` : ''}`
      },
      message: 'Quote created successfully using RAS Logistics Pricing Model'
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

    if (req.user.role === 'CUSTOMER') {
      whereClause.customerId = req.user.userId;
    }
    else if (req.user.role === 'PROVIDER') {
      const provider = await prisma.provider.findUnique({
        where: { userId: req.user.userId }
      });
      
      if (!provider) {
        return res.status(404).json({ error: 'Provider profile not found' });
      }
      
      whereClause.providerId = provider.id;
    }

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

// Get quote by ID
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

    res.json(quote);
  } catch (err) {
    console.error('Get quote by ID error:', err);
    res.status(500).json({ 
      error: 'Failed to fetch quote', 
      details: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
    });
  }
};

// Update quote status
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