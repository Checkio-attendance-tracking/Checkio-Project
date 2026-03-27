/*
  Warnings:

  - You are about to drop the column `previousTime` on the `work_schedule_change_requests` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_work_schedule_change_requests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "dayKey" TEXT NOT NULL,
    "mark" TEXT NOT NULL,
    "requestedTime" TEXT NOT NULL,
    "previousTimeAtRequest" TEXT,
    "previousTimeApplied" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reason" TEXT,
    "reviewComment" TEXT,
    "reviewedByUserId" TEXT,
    "reviewedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "work_schedule_change_requests_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "work_schedule_change_requests_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "work_schedule_change_requests_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_work_schedule_change_requests" ("companyId", "createdAt", "dayKey", "employeeId", "id", "mark", "reason", "requestedTime", "reviewComment", "reviewedAt", "reviewedByUserId", "status", "updatedAt") SELECT "companyId", "createdAt", "dayKey", "employeeId", "id", "mark", "reason", "requestedTime", "reviewComment", "reviewedAt", "reviewedByUserId", "status", "updatedAt" FROM "work_schedule_change_requests";
DROP TABLE "work_schedule_change_requests";
ALTER TABLE "new_work_schedule_change_requests" RENAME TO "work_schedule_change_requests";
CREATE INDEX "work_schedule_change_requests_companyId_status_createdAt_idx" ON "work_schedule_change_requests"("companyId", "status", "createdAt");
CREATE INDEX "work_schedule_change_requests_employeeId_createdAt_idx" ON "work_schedule_change_requests"("employeeId", "createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
