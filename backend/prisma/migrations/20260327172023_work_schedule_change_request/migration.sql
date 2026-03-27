-- CreateTable
CREATE TABLE "work_schedule_change_requests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "dayKey" TEXT NOT NULL,
    "mark" TEXT NOT NULL,
    "requestedTime" TEXT NOT NULL,
    "previousTime" TEXT,
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

-- CreateIndex
CREATE INDEX "work_schedule_change_requests_companyId_status_createdAt_idx" ON "work_schedule_change_requests"("companyId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "work_schedule_change_requests_employeeId_createdAt_idx" ON "work_schedule_change_requests"("employeeId", "createdAt");
