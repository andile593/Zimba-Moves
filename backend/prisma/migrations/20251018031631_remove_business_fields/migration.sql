/*
  Warnings:

  - The values [LICENSE] on the enum `FileCategory` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `businessName` on the `Provider` table. All the data in the column will be lost.
  - You are about to drop the column `businessType` on the `Provider` table. All the data in the column will be lost.
  - You are about to drop the column `taxNumber` on the `Provider` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."FileCategory_new" AS ENUM ('INSURANCE', 'BRANDING', 'EVIDENCE', 'PROFILE_PIC', 'ID_DOCUMENT', 'PROOF_OF_ADDRESS', 'VEHICLE_REGISTRATION', 'VEHICLE_LICENSE_DISK', 'OTHER');
ALTER TABLE "public"."File" ALTER COLUMN "category" TYPE "public"."FileCategory_new" USING ("category"::text::"public"."FileCategory_new");
ALTER TYPE "public"."FileCategory" RENAME TO "FileCategory_old";
ALTER TYPE "public"."FileCategory_new" RENAME TO "FileCategory";
DROP TYPE "public"."FileCategory_old";
COMMIT;

-- AlterTable
ALTER TABLE "public"."Provider" DROP COLUMN "businessName",
DROP COLUMN "businessType",
DROP COLUMN "taxNumber";
