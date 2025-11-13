import { PrismaClient } from "@prisma/client";
import { createProviderPayout } from "../controllers/paymentCardController.js";

const prisma = new PrismaClient();

export async function processWeeklyPayouts() {
  try {
    console.log("Starting weekly payout processing...");

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
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);

        const payments = await prisma.payment.findMany({
          where: {
            providerId: provider.id,
            status: "PAID",
            createdAt: {
              gte: lastWeek,
            },
          },
          include: {
            payouts: {
              where: {
                status: { in: ['COMPLETED', 'PROCESSING', 'PENDING'] }
              }
            }
          }
        });

        // Filter out payments that already have payouts
        const unpaidPayments = payments.filter(p => p.payouts.length === 0);
        const totalAmount = unpaidPayments.reduce((sum, p) => sum + p.amount, 0);

        if (totalAmount > 0) {
          console.log(
            `Processing payout for provider ${provider.id}: R${totalAmount}`
          );

          const result = await createProviderPayout(
            provider.id, 
            totalAmount,
            `Weekly payout - ${unpaidPayments.length} payments`
          );

          if (result.success) {
            console.log(`✓ Payout successful for provider ${provider.id}`);

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

// If running directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  processWeeklyPayouts()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}