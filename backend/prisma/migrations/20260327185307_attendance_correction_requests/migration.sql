/*
  Warnings:

  - You are about to drop the `work_schedule_change_requests` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "work_schedule_change_requests";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "attendance_correction_requests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "attendanceId" TEXT NOT NULL,
    "markType" TEXT NOT NULL,
    "requestedTime" TEXT NOT NULL,
    "previousTimeAtRequest" TEXT NOT NULL,
    "previousTimeApplied" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reason" TEXT NOT NULL,
    "reviewComment" TEXT,
    "reviewedByUserId" TEXT,
    "reviewedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "attendance_correction_requests_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "attendance_correction_requests_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "attendance_correction_requests_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "attendances" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "attendance_correction_requests_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "attendance_correction_requests_companyId_status_createdAt_idx" ON "attendance_correction_requests"("companyId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "attendance_correction_requests_employeeId_createdAt_idx" ON "attendance_correction_requests"("employeeId", "createdAt");

-- CreateIndex
CREATE INDEX "attendance_correction_requests_attendanceId_idx" ON "attendance_correction_requests"("attendanceId");
