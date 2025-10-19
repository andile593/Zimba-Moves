const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const fs = require("fs").promises;
const path = require("path");
const emailService = require("../services/emailService");

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

exports.createProviderApplication = async (req, res) => {
  try {
    if (req.user.role !== "PROVIDER") {
      return res
        .status(403)
        .json({ error: "Only users with PROVIDER role can apply" });
    }

    const {
      idNumber,
      bankName,
      accountNumber,
      accountHolder,
      address,
      city,
      region,
      country,
      postalCode,
      latitude,
      longitude,
      includeHelpers,
    } = req.body;

    // Check for existing application
    const existing = await prisma.provider.findUnique({
      where: { userId: req.user.userId },
    });

    if (existing) {
      return res.status(400).json({
        error: "Application already exists",
        status: existing.status,
      });
    }

    // Create provider application
    const provider = await prisma.provider.create({
      data: {
        userId: req.user.userId,
        status: "PENDING",
        idNumber,
        bankName,
        accountNumber,
        accountHolder,
        address,
        city,
        region,
        country: country || "South Africa",
        postalCode,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        includeHelpers: includeHelpers === true || includeHelpers === "true",
      },
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
    });

    // Send confirmation email
    await emailService.sendApplicationSubmitted(provider);

    res.status(201).json({
      message: "Application submitted successfully",
      provider,
    });
  } catch (err) {
    console.error("Error creating provider application:", err);
    res.status(400).json({
      error: "Failed to submit application",
      details: err.message,
    });
  }
};

// Admin: Review application
exports.reviewApplication = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ error: "Only admins can review applications" });
    }

    const { status, rejectionReason, adminNotes } = req.body;
    const providerId = req.params.id;

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const provider = await prisma.provider.update({
      where: { id: providerId },
      data: {
        status,
        rejectionReason: status === "REJECTED" ? rejectionReason : null,
        adminNotes,
        reviewedBy: req.user.userId,
        reviewedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Send email notification
    if (status === "APPROVED") {
      await emailService.sendApplicationApproved(provider);
    } else {
      await emailService.sendApplicationRejected(provider);
    }

    res.json({
      message: `Application ${status.toLowerCase()}`,
      provider,
    });
  } catch (err) {
    console.error("Error reviewing application:", err);
    res.status(400).json({
      error: "Failed to review application",
      details: err.message,
    });
  }
};

// Admin: Schedule inspection
exports.scheduleInspection = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ error: "Only admins can schedule inspections" });
    }

    const { inspectionDate, inspectionAddress, inspectionNotes } = req.body;
    const providerId = req.params.id;

    const provider = await prisma.provider.update({
      where: { id: providerId },
      data: {
        inspectionDate: new Date(inspectionDate),
        inspectionAddress,
        inspectionNotes,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Send email notification
    await emailService.sendInspectionScheduled(provider, inspectionDate);

    res.json({
      message: "Inspection scheduled",
      provider,
    });
  } catch (err) {
    res.status(400).json({
      error: "Failed to schedule inspection",
      details: err.message,
    });
  }
};

// Admin: Request additional documents
exports.requestDocuments = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ error: "Only admins can request documents" });
    }

    const { missingDocuments } = req.body;
    const providerId = req.params.id;

    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!provider) {
      return res.status(404).json({ error: "Provider not found" });
    }

    // Send email notification
    await emailService.sendDocumentsRequired(provider, missingDocuments);

    res.json({
      message: "Document request sent",
      provider,
    });
  } catch (err) {
    res.status(400).json({
      error: "Failed to request documents",
      details: err.message,
    });
  }
};

// Get all pending applications (Admin)
exports.getPendingApplications = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ error: "Only admins can view applications" });
    }

    const applications = await prisma.provider.findMany({
      where: { status: "PENDING" },
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
        files: {
          select: { id: true, category: true, status: true, createdAt: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(applications);
  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch applications",
      details: err.message,
    });
  }
};

exports.getProviders = async (req, res) => {
  try {
    const { userId, lat, lng, radius = 30 } = req.query;

    // Build where clause - only show APPROVED providers publicly
    const where = userId ? { userId } : { status: "APPROVED" };

    const providers = await prisma.provider.findMany({
      where,
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
        vehicles: {
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
        },
      },
    });

    // ... rest of the function (distance calculation, etc.)
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch providers", details: err.message });
  }
};

exports.createProvider = async (req, res) => {
  try {
    if (req.user.role !== "PROVIDER") {
      return res.status(403).json({
        error: "Only users with PROVIDER role can create provider profiles",
      });
    }

    const {
      includeHelpers,
      latitude,
      longitude,
      address,
      city,
      region,
      country,
      postalCode,
    } = req.body;

    // Prevent duplicate profile
    const existing = await prisma.provider.findUnique({
      where: { userId: req.user.userId },
    });
    if (existing) {
      return res.status(400).json({ error: "Provider profile already exists" });
    }

    // Build the data object only with provided fields
    const providerData = {
      userId: req.user.userId,
      includeHelpers: includeHelpers === true || includeHelpers === "true",
    };

    // Only add optional fields if they have values
    if (latitude !== undefined && latitude !== null && latitude !== "") {
      providerData.latitude = parseFloat(latitude);
    }
    if (longitude !== undefined && longitude !== null && longitude !== "") {
      providerData.longitude = parseFloat(longitude);
    }
    if (address && address.trim()) {
      providerData.address = address.trim();
    }
    if (city && city.trim()) {
      providerData.city = city.trim();
    }
    if (region && region.trim()) {
      providerData.region = region.trim();
    }
    if (country && country.trim()) {
      providerData.country = country.trim();
    } else {
      providerData.country = "South Africa";
    }
    if (postalCode && postalCode.trim()) {
      providerData.postalCode = postalCode.trim();
    }

    console.log("Creating provider with data:", providerData);

    const provider = await prisma.provider.create({
      data: providerData,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json(provider);
  } catch (err) {
    console.error("Error creating provider:", err);
    res.status(400).json({
      error: "Failed to create provider",
      details: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
};

exports.getMyProvider = async (req, res) => {
  try {
    const provider = await prisma.provider.findUnique({
      where: { userId: req.user.userId },
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
        vehicles: {},
        File: true,
      },
    });

    if (!provider) {
      return res.status(404).json({ error: "Provider profile not found" });
    }

    res.json(provider);
  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch provider profile",
      details: err.message,
    });
  }
};

exports.getProviderById = async (req, res) => {
  try {
    const provider = await prisma.provider.findUnique({
      where: { id: req.params.id },
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
        vehicles: {
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
        },
        File: true,
      },
    });

    if (!provider) return res.status(404).json({ error: "Provider not found" });

    res.json(provider);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch provider", details: err.message });
  }
};

// Update provider (only the owner or ADMIN)
exports.updateProvider = async (req, res) => {
  try {
    const provider = await prisma.provider.findUnique({
      where: { id: req.params.id },
    });

    if (!provider) return res.status(404).json({ error: "Provider not found" });

    if (req.user.role !== "ADMIN" && provider.userId !== req.user.userId) {
      return res.status(403).json({ error: "Forbidden: not your profile" });
    }

    const updatedProvider = await prisma.provider.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(updatedProvider);
  } catch (err) {
    res
      .status(400)
      .json({ error: "Failed to update provider", details: err.message });
  }
};

// Delete provider (ADMIN only)
exports.deleteProvider = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ error: "Only admins can delete providers" });
    }

    await prisma.provider.delete({ where: { id: req.params.id } });
    res.json({ message: "Provider deleted successfully" });
  } catch (err) {
    res
      .status(400)
      .json({ error: "Failed to delete provider", details: err.message });
  }
};

exports.searchProviders = async (req, res) => {
  try {
    const { q, type, vehicleType, priceMin, priceMax, location } = req.query;

    const where = {};

    // Search by company name or bio
    if (q) {
      where.OR = [
        { company: { contains: q, mode: "insensitive" } },
        { bio: { contains: q, mode: "insensitive" } },
      ];
    }

    // Filter by vehicle type
    if (vehicleType && vehicleType !== "all") {
      where.vehicles = {
        some: {
          type: vehicleType,
        },
      };
    }

    const providers = await prisma.provider.findMany({
      where,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        vehicles: true,
      },
    });

    // Filter by price range (if specified)
    let filtered = providers;
    if (priceMin || priceMax) {
      filtered = providers.filter((p) => {
        const baseRate = p.vehicles?.[0]?.baseRate || 0;
        if (priceMin && baseRate < parseFloat(priceMin)) return false;
        if (priceMax && baseRate > parseFloat(priceMax)) return false;
        return true;
      });
    }

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: "Search failed", details: err.message });
  }
};

exports.searchProvidersByLocation = async (req, res) => {
  try {
    const { city, region, lat, lng, radius = 30 } = req.query;

    let providers = await prisma.provider.findMany({
      where: {
        ...(city && { city: { contains: city, mode: "insensitive" } }),
        ...(region && { region: { contains: region, mode: "insensitive" } }),
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        vehicles: true,
      },
    });

    // If lat/lng provided, calculate distances and filter
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const maxRadius = parseFloat(radius);

      providers = providers
        .map((provider) => {
          if (!provider.latitude || !provider.longitude) {
            return { ...provider, distance: null };
          }

          const distance = calculateDistance(
            userLat,
            userLng,
            provider.latitude,
            provider.longitude
          );

          return {
            ...provider,
            distance: parseFloat(distance.toFixed(2)),
          };
        })
        .filter((p) => p.distance === null || p.distance <= maxRadius)
        .sort((a, b) => {
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          return a.distance - b.distance;
        });
    }

    res.json(providers);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to search providers", details: err.message });
  }
};

// Add vehicle (only owner provider)
exports.addVehicle = async (req, res) => {
  try {
    const {
      type,
      capacity,
      weight,
      plate,
      baseRate,
      perKmRate,
      helpersIncluded,
    } = req.body;
    const providerId = req.params.id;

    console.log("Backend received:", req.body, "ProviderID:", req.params.id);

    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
    });
    if (!provider) return res.status(404).json({ error: "Provider not found" });

    if (provider.userId !== req.user.userId) {
      return res.status(403).json({
        error: "Forbidden: You can only add vehicles to your own profile",
      });
    }

    const existingVehicle = await prisma.vehicle.findUnique({
      where: { plate: req.body.plate },
    });
    if (existingVehicle) {
      return res
        .status(400)
        .json({ error: "A vehicle with this plate already exists" });
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        providerId,
        type,
        capacity,
        weight,
        plate,
        baseRate,
        perKmRate,
      },
    });

    res.status(201).json(vehicle);
  } catch (err) {
    console.log(err);
    res
      .status(400)
      .json({ error: "Failed to add vehicle", details: err.message });
  }
};

// Get all vehicles for a provider (public)
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
    res
      .status(500)
      .json({ error: "Failed to fetch vehicles", details: err.message });
  }
};

// Upload provider file (license, insurance, branding, KYC documents)
exports.uploadProviderFile = async (req, res) => {
  try {
    const providerId = req.params.id;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Ensure provider exists
    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
    });
    if (!provider) {
      await fs.unlink(req.file.path);
      return res.status(404).json({ error: "Provider not found" });
    }

    // Check authorization
    if (req.user.role !== "ADMIN" && provider.userId !== req.user.userId) {
      await fs.unlink(req.file.path);
      return res.status(403).json({
        error: "Forbidden: You can only upload files to your own profile",
      });
    }

    // Validate category - UPDATED to include KYC document types
    const category = req.body.category?.toUpperCase() || "OTHER";
    const validCategories = [
      "LICENSE",
      "BRANDING",
      "PROFILE_PIC",
      "ID_DOCUMENT",
      "PROOF_OF_ADDRESS",
      "VEHICLE_REGISTRATION",
      "LICENSE",
      "OTHER",
    ];

    if (!validCategories.includes(category)) {
      await fs.unlink(req.file.path);
      return res.status(400).json({
        error: "Invalid category",
        validCategories,
      });
    }

    // Get vehicleId from request body if provided
    const vehicleId = req.body.vehicleId || null;

    // If vehicleId is provided, verify it belongs to this provider
    if (vehicleId) {
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: vehicleId },
      });

      if (!vehicle || vehicle.providerId !== providerId) {
        await fs.unlink(req.file.path);
        return res.status(400).json({ error: "Invalid vehicle ID" });
      }
    }

    const fileType = req.file.mimetype.startsWith("image/")
      ? "IMAGE"
      : "DOCUMENT";

    // Save file metadata in DB
    const file = await prisma.file.create({
      data: {
        url: req.file.path,
        type: fileType,
        category: category,
        providerId: providerId,
        vehicleId: vehicleId,
        status: "PENDING",
      },
    });

    res.status(201).json({
      message: "File uploaded successfully",
      file: {
        id: file.id,
        url: file.url,
        type: file.type,
        category: file.category,
        vehicleId: file.vehicleId,
        status: file.status,
        createdAt: file.createdAt,
      },
    });
  } catch (err) {
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkErr) {
        console.error("Failed to delete file after error:", unlinkErr);
      }
    }
    console.error("Upload error:", err);
    res
      .status(400)
      .json({ error: "Failed to upload file", details: err.message });
  }
};

// Get all files for a provider
exports.getProviderFiles = async (req, res) => {
  try {
    const providerId = req.params.id;

    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
    });
    if (!provider) {
      return res.status(404).json({ error: "Provider not found" });
    }

    // Only provider owner or admin can view files
    if (req.user.role !== "ADMIN" && provider.userId !== req.user.userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const files = await prisma.file.findMany({
      where: { providerId: providerId },
      orderBy: { createdAt: "desc" },
    });

    res.json(files);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch files", details: err.message });
  }
};

// Delete a file
exports.deleteProviderFile = async (req, res) => {
  try {
    const { id, fileId } = req.params;

    const file = await prisma.file.findUnique({
      where: { id: fileId },
      include: { provider: true },
    });

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    if (file.providerId !== id) {
      return res
        .status(400)
        .json({ error: "File does not belong to this provider" });
    }

    // Check authorization
    if (req.user.role !== "ADMIN" && file.provider.userId !== req.user.userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Delete file from filesystem
    try {
      await fs.unlink(file.url);
    } catch (fsErr) {
      console.error("Failed to delete file from filesystem:", fsErr);
    }

    // Delete from database
    await prisma.file.delete({ where: { id: fileId } });

    res.json({ message: "File deleted successfully" });
  } catch (err) {
    res
      .status(400)
      .json({ error: "Failed to delete file", details: err.message });
  }
};
