import { prisma } from "../config/database";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

export class EmployeeRepository {
  async findAll(companyId: string) {
    return prisma.employee.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(companyId: string, id: string) {
    return prisma.employee.findFirst({
      where: { companyId, id },
      include: { user: true }
    });
  }

  async findByDocument(companyId: string, documentId: string) {
    return prisma.employee.findFirst({
      where: { companyId, documentId }
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async create(companyId: string, data: any) {
    const { password, role, ...employeeData } = data;

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
  async update(companyId: string, id: string, data: any) {
    const { password, role, ...employeeData } = data;

    // Ensure belongs to company
    const exists = await this.findById(companyId, id);
    if (!exists) throw new Error("Employee not found");

    return prisma.$transaction(async (tx) => {
      const employee = await tx.employee.update({
        where: { id },
        data: employeeData
      });

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

  async delete(companyId: string, id: string) {
    const exists = await this.findById(companyId, id);
    if (!exists) throw new Error("Employee not found");

    return prisma.$transaction(async (tx) => {
      // 1. Delete associated attendances
      await tx.attendance.deleteMany({
        where: { employeeId: id }
      });

      // 2. Delete associated user (credentials)
      await tx.user.deleteMany({
        where: { employeeId: id }
      });

      // 3. Delete employee
      return tx.employee.delete({
        where: { id }
      });
    });
  }
}
