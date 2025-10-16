/*
  Warnings:

  - You are about to drop the column `eventType` on the `PaymentEvent` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[gateway,gatewayRef]` on the table `PaymentEvent` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `type` to the `PaymentEvent` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."PaymentEvent_gateway_gatewayRef_idx";

-- DropIndex
DROP INDEX "public"."PaymentEvent_paymentId_idx";

-- AlterTable
ALTER TABLE "public"."Payment" ADD COLUMN     "gatewayReference" TEXT,
ADD COLUMN     "refundReference" TEXT;

-- AlterTable
ALTER TABLE "public"."PaymentEvent" DROP COLUMN "eventType",
ADD COLUMN     "type" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PaymentEvent_gateway_gatewayRef_key" ON "public"."PaymentEvent"("gateway", "gatewayRef");
