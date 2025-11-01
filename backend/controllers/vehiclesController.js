const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const fs = require("fs").promises;
const ApiError = require("../utils/ApiError");

exports.addVehicle = async (req, res, next) => {
  try {
    const providerId = req.params.id;
    const {
      make,
      model,
      year,
      color,
      type,
      capacity,
      weight,
      plate,
      baseRate,
      perKmRate,
      loadFee,
    } = req.body;

    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
    });
    if (!provider) throw new ApiError(404, "Provider not found");

    if (provider.userId !== req.user.userId)
      throw new ApiError(403, "You can only add vehicles to your own profile");

    const existingVehicle = await prisma.vehicle.findUnique({
      where: { plate: plate.toUpperCase() },
    });
    if (existingVehicle)
      throw new ApiError(400, "A vehicle with this plate already exists");

    if (baseRate !== undefined) updateData.baseRate = parseFloat(baseRate);
    if (perKmRate !== undefined) updateData.perKmRate = parseFloat(perKmRate);
    if (loadFee !== undefined) updateData.loadFee = parseFloat(loadFee);

    const vehicle = await prisma.vehicle.create({
      data: {
        providerId,
        make,
        model,
        year: parseInt(year),
        color,
        type,
        capacity: parseFloat(capacity),
        weight: parseFloat(weight),
        plate: plate.toUpperCase(),
        baseRate: parseFloat(baseRate),
        perKmRate: parseFloat(perKmRate || 0),
        loadFee: parseFloat(loadFee),
      },
    });

    res.status(201).json(vehicle);
  } catch (err) {
    next(err);
  }
};

// Update vehicle
exports.updateVehicle = async (req, res) => {
  try {
    const vehicleId = req.params.id;
    const {
      make,
      model,
      year,
      color,
      type,
      capacity,
      weight,
      plate,
      baseRate,
      perKmRate,
      loadFee,
    } = req.body;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: { provider: true },
    });

    if (!vehicle) throw new ApiError(404, "Vehicle not found");

    // Check authorization
    if (
      req.user.role !== "ADMIN" &&
      vehicle.provider.userId !== req.user.userId
    )
      throw new ApiError(
        403,
        "Forbidden: You can only update your own vehicles!"
      );

    // If plate is being changed, check if new plate already exists
    if (plate && plate.toUpperCase() !== vehicle.plate) {
      const existingVehicle = await prisma.vehicle.findUnique({
        where: { plate: plate.toUpperCase() },
      });

      if (existingVehicle)
        throw new ApiError(400, "A vehicle with this plate already exists");
    }

    // Build update data object
    const updateData = {};

    if (make !== undefined) updateData.make = make;
    if (model !== undefined) updateData.model = model;
    if (year !== undefined) updateData.year = parseInt(year);
    if (color !== undefined) updateData.color = color;
    if (type !== undefined) updateData.type = type;
    if (capacity !== undefined) updateData.capacity = parseFloat(capacity);
    if (weight !== undefined) updateData.weight = parseFloat(weight);
    if (plate !== undefined) updateData.plate = plate.toUpperCase();
    if (baseRate !== undefined) updateData.baseRate = parseFloat(baseRate);
    if (perKmRate !== undefined) updateData.perKmRate = parseFloat(perKmRate);
    if (loadFee !== undefined) updateData.loadFee = parseFloat(loadFee);

    
    const updatedVehicle = await prisma.vehicle.update({
      where: { id: vehicleId },
      data: updateData,
      include: {
        files: {
          where: {
            category: "BRANDING",
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    res.json(updatedVehicle);
  } catch (err) {
    next(err);
  }
};

// Delete vehicle
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicleId = req.params.id;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: {
        provider: true,
        files: true,
      },
    });

    if (!vehicle) throw new ApiError(404, "Vehicle not found");

    // Check authorization
    if (
      req.user.role !== "ADMIN" &&
      vehicle.provider.userId !== req.user.userId
    )
      throw new ApiError(
        403,
        "Forbidden: You can only delete your own vehicles"
      );

    // Delete associated files from filesystem
    for (const file of vehicle.files) {
      try {
        await fs.unlink(file.url);
      } catch (fsErr) {
        console.error("Failed to delete file from filesystem:", fsErr);
      }
    }

    // Delete the vehicle (this will cascade delete files from DB due to Prisma relations)
    await prisma.vehicle.delete({
      where: { id: vehicleId },
    });

    res.json({ message: "Vehicle deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// Get single vehicle by ID
exports.getVehicleById = async (req, res) => {
  try {
    const vehicleId = req.params.id;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: {
        provider: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        files: {
          where: {
            category: "BRANDING",
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!vehicle) throw new ApiError(404, "Vehicle not found");

    res.json(vehicle);
  } catch (err) {
    next(err);
  }
};

exports.getVehiclesByProvider = async (req, res) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { providerId: req.params.id },
      include: {
        files: {
          where: {
            category: "BRANDING",
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });
    res.json(vehicles);
  } catch (err) {
    next(err);
  }
};
