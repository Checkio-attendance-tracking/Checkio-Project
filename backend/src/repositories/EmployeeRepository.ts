import { prisma } from "../config/database";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createAuditLog } from "../services/AuditLogService";

function deserializeWorkSchedule(raw: unknown): unknown {
  if (!raw || typeof raw !== "string") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

function serializeWorkSchedule(raw: unknown): string | undefined {
  if (!raw) return undefined;
  if (typeof raw === "string") return raw;
  try {
    return JSON.stringify(raw);
  } catch {
    return undefined;
  }
}

export class EmployeeRepository {
  async findAll(companyId: string) {
    const rows = await prisma.employee.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' }
    });
    return rows.map((r) => ({ ...r, workSchedule: deserializeWorkSchedule(r.workSchedule) }));
  }

  async findById(companyId: string, id: string) {
    const row = await prisma.employee.findFirst({
      where: { companyId, id },
      include: { user: true }
    });
    if (!row) return null;
    return { ...row, workSchedule: deserializeWorkSchedule(row.workSchedule) };
  }

  async findByDocument(companyId: string, documentId: string) {
    return prisma.employee.findFirst({
      where: { companyId, documentId }
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async create(companyId: string, data: any) {
    const { password, role, ...employeeData } = data;
    employeeData.workSchedule = serializeWorkSchedule(employeeData.workSchedule);

    return prisma.$transaction(async (tx) => {
      const employee = await tx.employee.create({
        data: {
          ...employeeData,
          company: { connect: { id: companyId } }
        }
      });

      if (password) {
        const passwordHash = await bcrypt.hash(password, 10);
        await tx.user.create({
          data: {
            companyId,
            name: `${employee.firstName} ${employee.lastName}`,
            email: employee.email,
            passwordHash,
            role: role || 'employee',
            employeeId: employee.id
          }
        });
      }

      return employee;
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async update(companyId: string, id: string, data: any, actorUserId?: string) {
    const { password, role, ...employeeData } = data;
    const hasWorkScheduleInPayload = Object.prototype.hasOwnProperty.call(data || {}, "workSchedule");
    employeeData.workSchedule = serializeWorkSchedule(employeeData.workSchedule);

    // Ensure belongs to company
    const exists = await this.findById(companyId, id);
    if (!exists) throw new Error("Employee not found");

    return prisma.$transaction(async (tx) => {
      const employee = await tx.employee.update({
        where: { id },
        data: employeeData
      });

      if (hasWorkScheduleInPayload && actorUserId) {
        await createAuditLog(tx, {
          companyId,
          userId: actorUserId,
          employeeId: employee.id,
          action: "EMPLOYEE_WORK_SCHEDULE_UPDATED",
          entity: "employee",
          entityId: employee.id,
          description: `Horario actualizado para ${employee.firstName} ${employee.lastName}`,
          metadata: { employeeId: employee.id },
        });
      }

      // Update user if exists
      const user = await tx.user.findUnique({
        where: { employeeId: id }
      });

      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const userData: any = {
          name: `${employee.firstName} ${employee.lastName}`,
          email: employee.email,
        };
        if (password) {
          userData.passwordHash = await bcrypt.hash(password, 10);
        }
        if (role) {
          userData.role = role;
        }
        await tx.user.update({
          where: { id: user.id },
          data: userData
        });
      } else if (password) {
        // Create user if not exists and password provided
        const passwordHash = await bcrypt.hash(password, 10);
        await tx.user.create({
          data: {
            companyId,
            name: `${employee.firstName} ${employee.lastName}`,
            email: employee.email,
            passwordHash,
            role: role || 'employee',
            employeeId: employee.id
          }
        });
      }

      return employee;
    });
  }

  async delete(companyId: string, id: string, actorUserId?: string) {
    const exists = await this.findById(companyId, id);
    if (!exists) throw new Error("Employee not found");

    return prisma.$transaction(async (tx) => {
      // Soft offboarding: preserve historical records and disable the employee.
      const employee = await tx.employee.update({
        where: { id },
        data: { status: "inactive" }
      });

      if (actorUserId) {
        await createAuditLog(tx, {
          companyId,
          userId: actorUserId,
          employeeId: employee.id,
          action: "EMPLOYEE_OFFBOARDED",
          entity: "employee",
          entityId: employee.id,
          description: `Baja de ${employee.firstName} ${employee.lastName}`,
          metadata: { employeeId: employee.id, newStatus: "inactive" },
        });
      }

      return employee;
    });
  }
}
