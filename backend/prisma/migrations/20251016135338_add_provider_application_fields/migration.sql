-- CreateEnum
CREATE TYPE "public"."ProviderStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."FileCategory" ADD VALUE 'ID_DOCUMENT';
ALTER TYPE "public"."FileCategory" ADD VALUE 'PROOF_OF_ADDRESS';
ALTER TYPE "public"."FileCategory" ADD VALUE 'VEHICLE_REGISTRATION';
ALTER TYPE "public"."FileCategory" ADD VALUE 'VEHICLE_LICENSE_DISK';

-- AlterTable
ALTER TABLE "public"."Provider" ADD COLUMN     "accountHolder" TEXT,
ADD COLUMN     "accountNumber" TEXT,
ADD COLUMN     "adminNotes" TEXT,
ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "businessName" TEXT,
ADD COLUMN     "businessType" TEXT,
ADD COLUMN     "idNumber" TEXT,
ADD COLUMN     "inspectionAddress" TEXT,
ADD COLUMN     "inspectionDate" TIMESTAMP(3),
ADD COLUMN     "inspectionNotes" TEXT,
ADD COLUMN     "inspectionRequested" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedBy" TEXT,
ADD COLUMN     "status" "public"."ProviderStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "taxNumber" TEXT;
