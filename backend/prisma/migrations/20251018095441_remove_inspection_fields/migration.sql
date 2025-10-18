/*
  Warnings:

  - You are about to drop the column `inspectionAddress` on the `Provider` table. All the data in the column will be lost.
  - You are about to drop the column `inspectionDate` on the `Provider` table. All the data in the column will be lost.
  - You are about to drop the column `inspectionNotes` on the `Provider` table. All the data in the column will be lost.
  - You are about to drop the column `inspectionRequested` on the `Provider` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Provider" DROP COLUMN "inspectionAddress",
DROP COLUMN "inspectionDate",
DROP COLUMN "inspectionNotes",
DROP COLUMN "inspectionRequested";
