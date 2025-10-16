/*
  Warnings:

  - You are about to drop the column `userId` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `bio` on the `Provider` table. All the data in the column will be lost.
  - You are about to drop the column `company` on the `Provider` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."File" DROP CONSTRAINT "File_userId_fkey";

-- AlterTable
ALTER TABLE "public"."File" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "public"."Provider" DROP COLUMN "bio",
DROP COLUMN "company";
