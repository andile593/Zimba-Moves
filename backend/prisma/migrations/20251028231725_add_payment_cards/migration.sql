-- AlterTable
ALTER TABLE "PaymentCard" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "recipientCode" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "PaymentCard_isDefault_idx" ON "PaymentCard"("isDefault");
