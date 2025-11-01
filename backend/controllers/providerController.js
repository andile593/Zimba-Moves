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
        paymentCards: {
          orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        },
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

// backend/controllers/providerController.js

exports.updateProvider = async (req, res, next) => {
  try {
    const provider = await prisma.provider.findUnique({
      where: { id: req.params.id },
    });

    if (!provider) throw new ApiError(404, "Provider does not exist");

    if (req.user.role !== "ADMIN" && provider.userId !== req.user.userId)
      throw new ApiError(403, "Forbidden: Can't edit this profile");

    // Filter out undefined values and prepare update data
    const updateData = {};
    const allowedFields = [
      "bio",
      "includeHelpers",
      "latitude",
      "longitude",
      "address",
      "city",
      "region",
      "country",
      "postalCode",
      "bankName",
      "accountHolder",
      "accountNumber",
      "idNumber",
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        // Convert string booleans to actual booleans
        if (field === "includeHelpers") {
          updateData[field] =
            req.body[field] === true || req.body[field] === "true";
        }
        // Convert numeric strings to numbers for lat/lng
        else if (field === "latitude" || field === "longitude") {
          const value = parseFloat(req.body[field]);
          if (!isNaN(value)) {
            updateData[field] = value;
          }
        }
        // Handle regular fields - allow empty strings to clear fields
        else {
          updateData[field] = req.body[field];
        }
      }
    }

    const updatedProvider = await prisma.provider.update({
      where: { id: req.params.id },
      data: updateData,
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
        paymentCards: {
          orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        },
      },
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

    
    let normalizedPath = req.file.path
      .replace(/\\/g, '/')       .replace(/^\.\//, '')
      .replace(/^\/+/, ''); 
    
   
    if (normalizedPath.startsWith('uploads/')) {
      normalizedPath = normalizedPath.substring('uploads/'.length);
    }
    
    console.log('Original file path:', req.file.path);
    console.log('Normalized path for DB:', normalizedPath);

    const file = await prisma.file.create({
      data: {
        url: normalizedPath, 
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

    
    const filePath = path.join(process.cwd(), 'uploads', file.url);
    
    console.log('Attempting to delete file at:', filePath);
    
    // Delete file from filesystem
    try {
      await fs.unlink(filePath);
      console.log('File deleted successfully from filesystem');
    } catch (fsErr) {
      console.error("Failed to delete file from filesystem:", fsErr);
      
    }

    await prisma.file.delete({ where: { id: fileId } });

    res.json({ message: "File deleted successfully" });
  } catch (err) {
    next(err);
  }
};

exports.getMyEarnings = async (req, res) => {
  try {
    // Ensure user is a provider
    if (req.user.role !== "PROVIDER") {
      return res
        .status(403)
        .json({ error: "Only providers can access earnings" });
    }

    // Get provider profile
    const provider = await prisma.provider.findUnique({
      where: { userId: req.user.userId },
    });

    if (!provider) {
      return res.status(404).json({ error: "Provider profile not found" });
    }

    // Get all payments for this provider
    const payments = await prisma.payment.findMany({
      where: {
        providerId: provider.id,
      },
      include: {
        booking: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate total earnings
    const total = payments
      .filter((p) => p.status === "PAID")
      .reduce((sum, p) => sum + p.amount, 0);

    // Calculate pending earnings
    const pending = payments
      .filter((p) => p.status === "PENDING")
      .reduce((sum, p) => sum + p.amount, 0);

    // Calculate completed earnings
    const completed = total; // Same as total for now

    // Get this month's earnings
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const thisMonth = payments
      .filter(
        (p) => p.status === "PAID" && new Date(p.createdAt) >= firstDayOfMonth
      )
      .reduce((sum, p) => sum + p.amount, 0);

    // Get last month's earnings
    const firstDayOfLastMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );
    const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const lastMonth = payments
      .filter((p) => {
        const date = new Date(p.createdAt);
        return (
          p.status === "PAID" &&
          date >= firstDayOfLastMonth &&
          date <= lastDayOfLastMonth
        );
      })
      .reduce((sum, p) => sum + p.amount, 0);

    // Calculate growth percentage
    const growth =
      lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;

    // Get recent payouts (group by week or similar logic)
    const recentPayouts = await generateRecentPayouts(provider.id);

    // Calculate next payout date (every Friday)
    const nextPayout = getNextFriday();

    res.json({
      total,
      pending,
      completed,
      thisMonth,
      lastMonth,
      growth,
      nextPayout,
      recentPayouts,
    });
  } catch (err) {
    console.error("Error fetching earnings:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch earnings", details: err.message });
  }
};

async function generateRecentPayouts(providerId) {
  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

  const payments = await prisma.payment.findMany({
    where: {
      providerId,
      status: "PAID",
      createdAt: {
        gte: fourWeeksAgo,
      },
    },
    include: {
      booking: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Group payments by week
  const payoutMap = new Map();

  payments.forEach((payment) => {
    const date = new Date(payment.createdAt);
    const friday = getLastFriday(date);
    const weekKey = friday.toISOString().split("T")[0];

    if (!payoutMap.has(weekKey)) {
      payoutMap.set(weekKey, {
        id: weekKey,
        date: weekKey,
        amount: 0,
        bookings: 0,
        status: "Completed",
      });
    }

    const payout = payoutMap.get(weekKey);
    payout.amount += payment.amount;
    payout.bookings += 1;
  });

  // Convert map to array and sort by date descending
  return Array.from(payoutMap.values())
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10); // Return last 10 payouts
}

function getLastFriday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day >= 5 ? day - 5 : day + 2; // Friday is 5
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Helper: Get next Friday date
 */
function getNextFriday() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysUntilFriday = (5 - dayOfWeek + 7) % 7 || 7; // Friday is 5

  const nextFriday = new Date(today);
  nextFriday.setDate(today.getDate() + daysUntilFriday);

  return nextFriday.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
