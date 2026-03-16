-- AlterTable
ALTER TABLE "attendances" ADD COLUMN "deviceCheckIn" TEXT;
ALTER TABLE "attendances" ADD COLUMN "deviceCheckOut" TEXT;
ALTER TABLE "attendances" ADD COLUMN "deviceLunchEnd" TEXT;
ALTER TABLE "attendances" ADD COLUMN "deviceLunchStart" TEXT;
ALTER TABLE "attendances" ADD COLUMN "ipCheckIn" TEXT;
ALTER TABLE "attendances" ADD COLUMN "ipCheckOut" TEXT;
ALTER TABLE "attendances" ADD COLUMN "ipLunchEnd" TEXT;
ALTER TABLE "attendances" ADD COLUMN "ipLunchStart" TEXT;
ALTER TABLE "attendances" ADD COLUMN "osCheckIn" TEXT;
ALTER TABLE "attendances" ADD COLUMN "osCheckOut" TEXT;
ALTER TABLE "attendances" ADD COLUMN "osLunchEnd" TEXT;
ALTER TABLE "attendances" ADD COLUMN "osLunchStart" TEXT;
ALTER TABLE "attendances" ADD COLUMN "userAgentCheckIn" TEXT;
ALTER TABLE "attendances" ADD COLUMN "userAgentCheckOut" TEXT;
ALTER TABLE "attendances" ADD COLUMN "userAgentLunchEnd" TEXT;
ALTER TABLE "attendances" ADD COLUMN "userAgentLunchStart" TEXT;

-- AlterTable
ALTER TABLE "employees" ADD COLUMN "workSchedule" TEXT;

-- CreateIndex
CREATE INDEX "attendances_companyId_date_idx" ON "attendances"("companyId", "date");

-- CreateIndex
CREATE INDEX "attendances_companyId_employeeId_date_idx" ON "attendances"("companyId", "employeeId", "date");
