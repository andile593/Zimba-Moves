const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const fs = require("fs").promises;
const path = require("path");
const emailService = require("../services/emailService");
const ApiError = require("../utils/ApiError");

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

exports.createProviderApplication = async (req, res, next) => {
  try {
    if (req.user.role !== "PROVIDER")
      throw new ApiError(403, "Only providers can apply");

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

    if (existing) throw new ApiError(400, "Application already exists");

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
    try {
      await emailService.sendApplicationSubmitted(provider);
    } catch (emailErr) {
      console.error("Failed to send application email:", emailErr);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      message: "Application submitted successfully",
      provider,
    });
  } catch (err) {
    next(err);
  }
};

exports.reviewApplication = async (req, res, next) => {
  try {
    if (req.user.role !== "ADMIN") {
      throw new ApiError(403, "Only admins can review applications");
    }

    const { status, rejectionReason, adminNotes } = req.body;
    const providerId = req.params.id;

    if (!["APPROVED", "REJECTED"].includes(status))
      throw new ApiError(400, "Invalid status. Must be APPROVED or REJECTED");

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
    try {
      if (status === "APPROVED") {
        await emailService.sendApplicationApproved(provider);
      } else {
        await emailService.sendApplicationRejected(provider);
      }
    } catch (emailErr) {
      console.error("Failed to send review email:", emailErr);
    }

    res.json({
      message: `Application ${status.toLowerCase()}`,
      provider,
    });
  } catch (err) {
    next(err);
  }
};

exports.scheduleInspection = async (req, res, next) => {
  try {
    if (req.user.role !== "ADMIN")
      throw new ApiError(403, "Only admins can schedule inspections");

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
    try {
      await emailService.sendInspectionScheduled(provider, inspectionDate);
    } catch (emailErr) {
      console.error("Failed to send inspection email:", emailErr);
    }

    res.json({
      message: "Inspection scheduled",
      provider,
    });
  } catch (err) {
    next(err);
  }
};

exports.requestDocuments = async (req, res, next) => {
  try {
    if (req.user.role !== "ADMIN")
      throw new ApiError(403, "Only admins can request documents");

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

    if (!provider) throw new ApiError(404, "Provider does not exist");

    // Send email notification
    try {
      await emailService.sendDocumentsRequired(provider, missingDocuments);
    } catch (emailErr) {
      console.error("Failed to send documents request email:", emailErr);
    }

    res.json({
      message: "Document request sent",
      provider,
    });
  } catch (err) {
    next(err);
  }
};

exports.getPendingApplications = async (req, res, next) => {
  try {
    if (req.user.role !== "ADMIN")
      throw new ApiError(403, "Only admins can view applications");

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
          select: {
            id: true,
            category: true,
            status: true,
            createdAt: true,
            url: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(applications);
  } catch (err) {
    next(err);
  }
};

exports.getProviders = async (req, res, next) => {
  try {
    const { userId, lat, lng, radius = 30 } = req.query;

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

    // If location params provided, filter by distance
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const maxRadius = parseFloat(radius);

      const providersWithDistance = providers
        .map((provider) => {
          // Skip providers without location
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
          // Providers without location go to the end
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          return a.distance - b.distance;
        });

      return res.json(providersWithDistance);
    }

    res.json(providers);
  } catch (err) {
    next(err);
  }
};

exports.createProvider = async (req, res, next) => {
  try {
    if (req.user.role !== "PROVIDER")
      throw new ApiError(403, "Only providers can create a profile");

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
    if (existing) throw new ApiError(400, "Provider profile already exists");

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
    next(err);
  }
};

exports.getMyProvider = async (req, res, next) => {
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
        files: true,
      },
    });

    if (!provider) throw new ApiError(404, "Provider does not exist");

    res.json(provider);
  } catch (err) {
    next(err);
  }
};

exports.getProviderById = async (req, res, next) => {
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
        files: true,
      },
    });

    if (!provider) throw new ApiError(404, "Provider does not exist");

    res.json(provider);
  } catch (err) {
    next(err);
  }
};

exports.updateProvider = async (req, res, next) => {
  try {
    const provider = await prisma.provider.findUnique({
      where: { id: req.params.id },
    });

    if (!provider) throw new ApiError(404, "Provider does not exist");

    if (req.user.role !== "ADMIN" && provider.userId !== req.user.userId)
      throw new ApiError(403, "Forbidden: Can't edit this profile");

    const updatedProvider = await prisma.provider.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(updatedProvider);
  } catch (err) {
    next(err);
  }
};

exports.deleteProvider = async (req, res, next) => {
  try {
    if (req.user.role !== "ADMIN")
      throw new ApiError(403, "Only Admins can delete providers");

    await prisma.provider.delete({ where: { id: req.params.id } });
    res.json({ message: "Provider deleted successfully" });
  } catch (err) {
    next(err);
  }
};

exports.searchProviders = async (req, res, next) => {
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
    next(err);
  }
};

exports.searchProvidersByLocation = async (req, res, next) => {
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
    next(err);
  }
};

exports.uploadProviderFile = async (req, res, next) => {
  try {
    const providerId = req.params.id;

    if (!req.file) throw new ApiError(400, "No file uploaded");

    // Ensure provider exists
    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      await fs.unlink(req.file.path);
      throw new ApiError(404, "Provider does not exist");
    }

    // Check authorization
    if (req.user.role !== "ADMIN" && provider.userId !== req.user.userId) {
      await fs.unlink(req.file.path);
      throw new ApiError(403, "You can only upload files to your own profile");
    }

    const category = req.body.category?.toUpperCase() || "OTHER";

    const validCategories = [
      "BRANDING",
      "PROFILE_PIC",
      "ID_DOCUMENT",
      "PROOF_OF_ADDRESS",
      "VEHICLE_REGISTRATION_CERT",
      "DRIVERS_LICENSE",
      "EVIDENCE",
      "OTHER",
    ];

    if (!validCategories.includes(category)) {
      await fs.unlink(req.file.path);
      throw new ApiError(400, "Invalid category");
    }

    const vehicleId = req.body.vehicleId || null;

    // If vehicleId is provided, verify it belongs to this provider
    if (vehicleId) {
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: vehicleId },
      });

      if (!vehicle || vehicle.providerId !== providerId) {
        await fs.unlink(req.file.path);
        throw new ApiError(400, "Invalid vehicle ID");
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
    next(err);
  }
};

exports.getProviderFiles = async (req, res, next) => {
  try {
    const providerId = req.params.id;

    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
    });
    if (!provider) throw new ApiError(404, "Provider doesn't exist");

    // Only provider owner or admin can view files
    if (req.user.role !== "ADMIN" && provider.userId !== req.user.userId)
      throw new ApiError(403, "Forbidden");

    const files = await prisma.file.findMany({
      where: { providerId: providerId },
      orderBy: { createdAt: "desc" },
    });

    res.json(files);
  } catch (err) {
    next(err);
  }
};

exports.deleteProviderFile = async (req, res, next) => {
  try {
    const { id, fileId } = req.params;

    const file = await prisma.file.findUnique({
      where: { id: fileId },
      include: { provider: true },
    });

    if (!file) throw new ApiError(404, "File does not exist");

    if (file.providerId !== id)
      throw new ApiError(400, "File does not belong to this provider");

    // Check authorization
    if (req.user.role !== "ADMIN" && file.provider.userId !== req.user.userId)
      throw new ApiError(403, "Forbidden");

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
    next(err);
  }
};