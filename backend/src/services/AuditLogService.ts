import { Prisma } from "@prisma/client";

export type AuditEntry = {
  companyId: string;
  userId?: string;
  employeeId?: string;
  action: string;
  entity: string;
  entityId?: string;
  description?: string;
  metadata?: Record<string, unknown>;
};

export async function createAuditLog(tx: Prisma.TransactionClient, entry: AuditEntry) {
  await tx.auditLog.create({
    data: {
      companyId: entry.companyId,
      userId: entry.userId,
      employeeId: entry.employeeId,
      action: entry.action,
      entity: entry.entity,
      entityId: entry.entityId,
      description: entry.description,
      metadata: entry.metadata ? JSON.stringify(entry.metadata) : undefined,
    },
  });
}
