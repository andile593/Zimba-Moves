/*
  Warnings:

  - The values [HELPER] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `helpersRequired` on the `Quote` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."HelpersSource" AS ENUM ('PROVIDER', 'CUSTOMER');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."Role_new" AS ENUM ('CUSTOMER', 'PROVIDER', 'ADMIN');
ALTER TABLE "public"."User" ALTER COLUMN "role" TYPE "public"."Role_new" USING ("role"::text::"public"."Role_new");
ALTER TYPE "public"."Role" RENAME TO "Role_old";
ALTER TYPE "public"."Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
COMMIT;

-- AlterTable
ALTER TABLE "public"."Booking" ADD COLUMN     "helpersProvidedBy" "public"."HelpersSource" NOT NULL DEFAULT 'PROVIDER';

-- AlterTable
ALTER TABLE "public"."Quote" DROP COLUMN "helpersRequired",
ADD COLUMN     "helpersNeeded" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "public"."WebhookLog" (
    "id" TEXT NOT NULL,
    "gateway" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "headers" JSONB NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookLog_pkey" PRIMARY KEY ("id")
);
