/*
  Warnings:

  - The values [INSURANCE,VEHICLE_REGISTRATION,VEHICLE_LICENSE_DISK] on the enum `FileCategory` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FileCategory_new" AS ENUM ('BRANDING', 'EVIDENCE', 'PROFILE_PIC', 'ID_DOCUMENT', 'PROOF_OF_ADDRESS', 'VEHICLE_REGISTRATION_CERT', 'DRIVERS_LICENSE', 'OTHER');
ALTER TABLE "File" ALTER COLUMN "category" TYPE "FileCategory_new" USING ("category"::text::"FileCategory_new");
ALTER TYPE "FileCategory" RENAME TO "FileCategory_old";
ALTER TYPE "FileCategory_new" RENAME TO "FileCategory";
DROP TYPE "public"."FileCategory_old";
COMMIT;

-- CreateTable
CREATE TABLE "PasswordReset" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PasswordReset" ADD CONSTRAINT "PasswordReset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
