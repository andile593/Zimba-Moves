-- CreateIndex
CREATE INDEX "Booking_customerId_idx" ON "public"."Booking"("customerId");

-- CreateIndex
CREATE INDEX "Booking_providerId_idx" ON "public"."Booking"("providerId");

-- CreateIndex
CREATE INDEX "Booking_vehicleId_idx" ON "public"."Booking"("vehicleId");

-- CreateIndex
CREATE INDEX "Booking_dateTime_idx" ON "public"."Booking"("dateTime");

-- CreateIndex
CREATE INDEX "Booking_status_idx" ON "public"."Booking"("status");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "public"."Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_gatewayReference_idx" ON "public"."Payment"("gatewayReference");
