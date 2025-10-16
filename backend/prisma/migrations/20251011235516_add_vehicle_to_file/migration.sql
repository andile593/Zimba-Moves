-- AlterTable
ALTER TABLE "public"."File" ADD COLUMN     "vehicleId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."File" ADD CONSTRAINT "File_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "public"."Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
