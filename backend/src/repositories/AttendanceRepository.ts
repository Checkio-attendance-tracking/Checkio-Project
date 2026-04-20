import { prisma } from "../config/database";
import { Prisma } from "@prisma/client";
import { startOfDay, endOfDay } from "date-fns";

export class AttendanceRepository {
  async findByDate(companyId: string, employeeId: string, date: Date) {
    const start = startOfDay(date);
    const end = endOfDay(date);

    return prisma.attendance.findFirst({
      where: {
        companyId,
        employeeId,
        date: {
          gte: start,
          lte: end
        }
      }
    });
  }

  async findByDateRange(companyId: string, employeeId: string, start: Date, end: Date) {
    return prisma.attendance.findFirst({
      where: {
        companyId,
        employeeId,
        date: { gte: start, lte: end }
      }
    });
  }

  async findLatestOpenByEmployee(companyId: string, employeeId: string) {
    return prisma.attendance.findFirst({
      where: {
        companyId,
        employeeId,
        checkIn: { not: null },
        checkOut: null
      },
      orderBy: { date: 'desc' }
    });
  }

  async findById(companyId: string, id: string) {
    return prisma.attendance.findFirst({
      where: { id, companyId },
      include: { employee: true }
    });
  }

  async findAllByEmployee(companyId: string, employeeId: string, month?: { start: Date; end: Date }) {
    return prisma.attendance.findMany({
      where: {
        companyId,
        employeeId,
        ...(month ? { date: { gte: month.start, lte: month.end } } : {}),
      },
      include: { employee: true },
      orderBy: { date: 'desc' }
    });
  }

  async findAllByCompany(companyId: string, date?: Date, employeeId?: string, month?: { start: Date; end: Date }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { companyId };
    if (date) {
      where.date = {
        gte: startOfDay(date),
        lte: endOfDay(date)
      };
    } else if (month) {
      where.date = {
        gte: month.start,
        lte: month.end
      };
    }
    if (employeeId) {
      where.employeeId = employeeId;
    }
    
    return prisma.attendance.findMany({
      where,
      include: { employee: true },
      orderBy: { date: 'desc' }
    });
  }

  async create(companyId: string, data: Omit<Prisma.AttendanceUncheckedCreateInput, 'companyId'>) {
    return prisma.attendance.create({
      data: {
        ...data,
        companyId
      }
    });
  }

  async update(id: string, data: Prisma.AttendanceUncheckedUpdateInput, companyId?: string) {
    if (companyId) {
      const record = await prisma.attendance.findFirst({
        where: { id, companyId }
      });
      if (!record) throw new Error("Attendance record not found");
    }

    return prisma.attendance.update({
      where: { id },
      data
    });
  }

  async delete(companyId: string, id: string) {
    const record = await prisma.attendance.findFirst({
      where: { id, companyId }
    });
    if (!record) throw new Error("Attendance record not found");

    return prisma.attendance.delete({ where: { id } });
  }
}
