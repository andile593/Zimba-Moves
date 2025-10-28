const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const {
  initiateProviderPayout,
} = require("../controllers/paymentCardController");

/**
 * Process weekly payouts to providers
 * Should be run via cron job every Friday
 */
async function processWeeklyPayouts() {
  try {
    console.log("Starting weekly payout processing...");

    // Get all providers with completed, paid bookings
    const providers = await prisma.provider.findMany({
      where: {
        status: "APPROVED",
        paymentCards: {
          some: {
            isDefault: true,
          },
        },
      },
      include: {
        paymentCards: {
          where: { isDefault: true },
        },
      },
    });

    console.log(`Found ${providers.length} providers for payout`);

    for (const provider of providers) {
      try {
        // Calculate earnings from last week
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);

        const payments = await prisma.payment.findMany({
          where: {
            providerId: provider.id,
            status: "PAID",
            createdAt: {
              gte: lastWeek,
            },
            // Exclude already paid out amounts
            payouts: {
              none: {
                status: "COMPLETED",
              },
            },
          },
        });

        const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);

        if (totalAmount > 0) {
          console.log(
            `Processing payout for provider ${provider.id}: R${totalAmount}`
          );

          const result = await initiateProviderPayout(provider.id, totalAmount);

          if (result.success) {
            console.log(`✓ Payout successful for provider ${provider.id}`);

            // Update provider earnings
            await prisma.provider.update({
              where: { id: provider.id },
              data: {
                earnings: {
                  increment: totalAmount,
                },
              },
            });
          } else {
            console.error(
              `✗ Payout failed for provider ${provider.id}:`,
              result.error
            );
          }
        } else {
          console.log(`No earnings to pay out for provider ${provider.id}`);
        }
      } catch (error) {
        console.error(
          `Error processing payout for provider ${provider.id}:`,
          error
        );
      }
    }

    console.log("Weekly payout processing completed");
  } catch (error) {
    console.error("Fatal error in payout processing:", error);
  }
}

module.exports = { processWeeklyPayouts };

// If running directly
if (require.main === module) {
  processWeeklyPayouts()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
