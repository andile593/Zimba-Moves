/*
  Warnings:

  - You are about to drop the column `helpersProvidedBy` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `helpersNeeded` on the `Quote` table. All the data in the column will be lost.
  - You are about to drop the column `helpersIncluded` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the `Helper` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Booking" DROP CONSTRAINT "Booking_helperId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Helper" DROP CONSTRAINT "Helper_providerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Helper" DROP CONSTRAINT "Helper_userId_fkey";

-- AlterTable
ALTER TABLE "public"."Booking" DROP COLUMN "helpersProvidedBy";

-- AlterTable
ALTER TABLE "public"."Provider" ADD COLUMN     "includeHelpers" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."Quote" DROP COLUMN "helpersNeeded",
ADD COLUMN     "helpersRequired" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."Vehicle" DROP COLUMN "helpersIncluded";

-- DropTable
DROP TABLE "public"."Helper";

-- DropEnum
DROP TYPE "public"."HelpersSource";
