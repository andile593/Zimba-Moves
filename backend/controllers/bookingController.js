const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const notifications = require("../services/notificationService");

// Create a booking (CUSTOMER only)
exports.createBooking = async (req, res) => {
  try {
    if (req.user.role !== "CUSTOMER") {
      return res
        .status(403)
        .json({ error: "Only customers can create bookings" });
    }

    const {
      providerId,
      vehicleId,
      pickup,
      dropoff,
      moveType,
      dateTime,
      helpersRequired,
      helpersProvidedBy,
      pricing,
    } = req.body;

    const booking = await prisma.booking.create({
      data: {
        customerId: req.user.userId,
        providerId,
        vehicleId,
        pickup,
        dropoff,
        moveType,
        dateTime: new Date(dateTime),
        helpersRequired,
        helpersProvidedBy, 
        pricing,
      },
    });

    const customer = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });
    const provider = await prisma.provider.findUnique({
      where: { id: booking.providerId },
      include: { user: true },
    });

    notifications.notifyBookingCreated({ booking, customer, provider });

    res.status(201).json(booking);
  } catch (err) {
    res
      .status(400)
      .json({ error: "Failed to create booking", details: err.message });
  }
};

// Get all bookings (ADMIN → all, PROVIDER → own only)
exports.getBookings = async (req, res) => {
  try {
    let bookings;

    if (req.user.role === "ADMIN") {
      // Admin sees all bookings
      bookings = await prisma.booking.findMany({
        include: {
          customer: true,
          provider: { include: { user: true } },
          vehicle: true,
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (req.user.role === "PROVIDER") {
      // Provider sees their bookings
      const provider = await prisma.provider.findUnique({
        where: { userId: req.user.userId },
      });

      if (!provider) {
        return res.status(404).json({ error: "Provider profile not found" });
      }

      bookings = await prisma.booking.findMany({
        where: { providerId: provider.id },
        include: {
          customer: true,
          vehicle: true,
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (req.user.role === "CUSTOMER") {
      // Customer sees their own bookings
      bookings = await prisma.booking.findMany({
        where: { customerId: req.user.userId },
        include: {
          provider: {
            include: { user: true },
          },
          vehicle: true,
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.json(bookings);
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch bookings", details: err.message });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        provider: { include: { user: true } },
        vehicle: true,
      },
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Check authorization based on role
    if (req.user.role === "CUSTOMER") {
      if (booking.customerId !== req.user.userId) {
        return res.status(403).json({ error: "Forbidden: not your booking" });
      }
    } else if (req.user.role === "PROVIDER") {
      // Instead of a separate query, check if the provider's userId matches
      if (booking.provider?.userId !== req.user.userId) {
        return res.status(403).json({ error: "Forbidden: not your booking" });
      }
    }
    // ADMIN can access any booking (no check needed)

    res.json(booking);
  } catch (err) {
    console.error("Error fetching booking:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch booking", details: err.message });
  }
};

async function processProviderPayout(booking) {
  try {
    // Get provider with payment cards
    const provider = await prisma.provider.findUnique({
      where: { id: booking.providerId },
      include: {
        paymentCards: {
          where: { isDefault: true },
        },
      },
    });

    if (!provider?.paymentCards?.[0]?.recipientCode) {
      console.log("No default payment card for provider:", booking.providerId);
      return;
    }

    const defaultCard = provider.paymentCards[0];
    const amount = booking.pricing?.total || 0;

    // Take platform fee (e.g., 10%)
    const platformFeePercent = 0.1;
    const platformFee = amount * platformFeePercent;
    const providerAmount = amount - platformFee;

    // Initiate transfer via Paystack
    const transferResponse = await axios.post(
      "https://api.paystack.co/transfer",
      {
        source: "balance",
        amount: Math.round(providerAmount * 100), // Convert to cents
        recipient: defaultCard.recipientCode,
        reason: `Payout for booking ${booking.id}`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Payout initiated:", transferResponse.data.data);

    // Update provider earnings
    await prisma.provider.update({
      where: { id: booking.providerId },
      data: {
        earnings: {
          increment: providerAmount,
        },
      },
    });
  } catch (error) {
    console.error(
      "Payout processing error:",
      error.response?.data || error.message
    );
    // Don't throw - we don't want to block booking completion if payout fails
  }
}

// Update the updateBooking function to trigger payout when booking is completed:
exports.updateBooking = async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: { provider: true },
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Authorization checks...
    if (
      req.user.role === "CUSTOMER" &&
      booking.customerId !== req.user.userId
    ) {
      return res.status(403).json({ error: "Forbidden: not your booking" });
    }

    if (req.user.role === "PROVIDER") {
      const provider = await prisma.provider.findUnique({
        where: { userId: req.user.userId },
      });

      if (!provider || booking.providerId !== provider.id) {
        return res.status(403).json({ error: "Forbidden: not your booking" });
      }

      const allowedFields = ["status"];
      const updateData = {};

      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      }

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: "No valid fields to update" });
      }

      const updatedBooking = await prisma.booking.update({
        where: { id: req.params.id },
        data: updateData,
        include: {
          customer: true,
          provider: { include: { user: true } },
          vehicle: true,
        },
      });

      // Send notification if status changed
      if (updateData.status) {
        const customer = await prisma.user.findUnique({
          where: { id: booking.customerId },
        });

        if (updateData.status === "CONFIRMED") {
          notifications.notifyBookingConfirmed({
            booking: updatedBooking,
            customer,
          });
        } else if (updateData.status === "CANCELLED") {
          notifications.notifyBookingCancelled({
            booking: updatedBooking,
            customer,
          });
        } else if (updateData.status === "COMPLETED") {
          // NEW: Trigger automatic payout when booking is completed
          if (updatedBooking.paymentStatus === "PAID") {
            await processProviderPayout(updatedBooking);
          }
        }
      }

      return res.json(updatedBooking);
    }

    // ADMIN can update anything, CUSTOMER can update their booking details
    const updatedBooking = await prisma.booking.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        customer: true,
        provider: { include: { user: true } },
        vehicle: true,
      },
    });

    res.json(updatedBooking);
  } catch (err) {
    console.error("Error updating booking:", err);
    res
      .status(400)
      .json({ error: "Failed to update booking", details: err.message });
  }
};

// Delete booking (ADMIN only)
exports.deleteBooking = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Only admins can delete bookings" });
    }

    await prisma.booking.delete({ where: { id: req.params.id } });
    res.json({ message: "Booking deleted successfully" });
  } catch (err) {
    res
      .status(400)
      .json({ error: "Failed to delete booking", details: err.message });
  }
};
