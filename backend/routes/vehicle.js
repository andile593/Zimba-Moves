const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authenticate, authorize } = require('../middleware/auth');

// Get single vehicle by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: req.params.id },
      include: {
        provider: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true }
            }
          }
        }
      }
    });

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch vehicle', details: err.message });
  }
});

// Update vehicle
router.put('/:id', authenticate, authorize('PROVIDER', 'ADMIN'), async (req, res) => {
  try {
    const { type, capacity, weight, plate, baseRate, perKmRate } = req.body;
    
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: req.params.id },
      include: { provider: true }
    });

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    // Check authorization
    if (req.user.role !== 'ADMIN' && vehicle.provider.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Forbidden: You can only update your own vehicles' });
    }

    const updatedVehicle = await prisma.vehicle.update({
      where: { id: req.params.id },
      data: {
        ...(type && { type }),
        ...(capacity && { capacity }),
        ...(weight && { weight }),
        ...(plate && { plate }),
        ...(baseRate && { baseRate }),
        ...(perKmRate !== undefined && { perKmRate })
      }
    });

    res.json(updatedVehicle);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update vehicle', details: err.message });
  }
});

// Delete vehicle
router.delete('/:id', authenticate, authorize('PROVIDER', 'ADMIN'), async (req, res) => {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: req.params.id },
      include: { provider: true }
    });

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    // Check authorization
    if (req.user.role !== 'ADMIN' && vehicle.provider.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Forbidden: You can only delete your own vehicles' });
    }

    // Check if vehicle has active bookings
    const activeBookings = await prisma.booking.count({
      where: {
        vehicleId: req.params.id,
        status: { in: ['PENDING', 'CONFIRMED'] }
      }
    });

    if (activeBookings > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete vehicle with active bookings',
        activeBookings 
      });
    }

    await prisma.vehicle.delete({ where: { id: req.params.id } });

    res.json({ message: 'Vehicle deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete vehicle', details: err.message });
  }
});

module.exports = router;
