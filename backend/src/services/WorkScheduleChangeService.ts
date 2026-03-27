import { prisma } from "../config/database";

type MarkType = "checkIn" | "lunchStart" | "lunchEnd" | "checkOut";

function peruHHMMFromDate(d: Date): string {
  const utcMinutes = d.getUTCHours() * 60 + d.getUTCMinutes();
  let peruMinutes = utcMinutes - 5 * 60;
  peruMinutes = ((peruMinutes % (24 * 60)) + (24 * 60)) % (24 * 60);
  const hh = String(Math.floor(peruMinutes / 60)).padStart(2, "0");
  const mm = String(peruMinutes % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

function toPeruISOString(attendanceDate: Date, hhmm: string): Date {
  const [hh, mm] = hhmm.split(":").map((v) => Number(v));
  if (Number.isNaN(hh) || Number.isNaN(mm)) throw new Error("Invalid time format");
  const y = attendanceDate.getUTCFullYear();
  const m = attendanceDate.getUTCMonth();
  const d = attendanceDate.getUTCDate();
  const utcMs = Date.UTC(y, m, d, hh + 5, mm, 0, 0);
  return new Date(utcMs);
}

function peruMinutesFromDate(d: Date): number {
  const utcMinutes = d.getUTCHours() * 60 + d.getUTCMinutes();
  let peruMinutes = utcMinutes - 5 * 60;
  peruMinutes = ((peruMinutes % (24 * 60)) + (24 * 60)) % (24 * 60);
  return peruMinutes;
}

function validateSequence(times: { checkIn?: Date | null; lunchStart?: Date | null; lunchEnd?: Date | null; checkOut?: Date | null }) {
  const order: Array<["checkIn" | "lunchStart" | "lunchEnd" | "checkOut", Date]> = [];
  if (times.checkIn) order.push(["checkIn", times.checkIn]);
  if (times.lunchStart) order.push(["lunchStart", times.lunchStart]);
  if (times.lunchEnd) order.push(["lunchEnd", times.lunchEnd]);
  if (times.checkOut) order.push(["checkOut", times.checkOut]);

  if (order.length <= 1) return;

  let prev = peruMinutesFromDate(order[0]![1]);
  for (let i = 1; i < order.length; i++) {
    let cur = peruMinutesFromDate(order[i]![1]);
    while (cur < prev) cur += 24 * 60;
    if (cur < prev) {
      throw new Error("La corrección genera una secuencia inválida");
    }
    prev = cur;
  }
}

export class AttendanceCorrectionService {
  async createRequest(
    companyId: string,
    employeeId: string,
    data: { date: string; markType: MarkType; requestedTime: string; reason: string }
  ) {
    const start = new Date(`${data.date}T00:00:00.000Z`);
    const end = new Date(`${data.date}T23:59:59.999Z`);

    const attendance = await prisma.attendance.findFirst({
      where: { companyId, employeeId, date: { gte: start, lte: end } },
      select: { id: true, date: true, checkIn: true, lunchStart: true, lunchEnd: true, checkOut: true },
    });
    if (!attendance) throw new Error("No existe una marcación para ese día");

    const current = attendance[data.markType];
    if (!current) throw new Error("No existe esa marcación para corregir");

    const existing = await prisma.attendanceCorrectionRequest.findFirst({
      where: {
        companyId,
        employeeId,
        attendanceId: attendance.id,
        markType: data.markType,
        status: "pending",
      },
      select: { id: true },
    });

    if (existing) {
      return prisma.attendanceCorrectionRequest.update({
        where: { id: existing.id },
        data: {
          requestedTime: data.requestedTime,
          previousTimeAtRequest: peruHHMMFromDate(current),
          reason: data.reason,
        },
        include: {
          attendance: { select: { date: true } },
        },
      });
    }

    return prisma.attendanceCorrectionRequest.create({
      data: {
        companyId,
        employeeId,
        attendanceId: attendance.id,
        markType: data.markType,
        requestedTime: data.requestedTime,
        previousTimeAtRequest: peruHHMMFromDate(current),
        reason: data.reason,
        status: "pending",
      },
      include: {
        attendance: { select: { date: true } },
      },
    });
  }

  async listMyRequests(companyId: string, employeeId: string) {
    return prisma.attendanceCorrectionRequest.findMany({
      where: { companyId, employeeId },
      orderBy: { createdAt: "desc" },
      include: {
        attendance: { select: { date: true } },
        reviewedByUser: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async listCompanyRequests(companyId: string, status?: "pending" | "approved" | "rejected") {
    return prisma.attendanceCorrectionRequest.findMany({
      where: { companyId, ...(status ? { status } : {}) },
      orderBy: { createdAt: "desc" },
      include: {
        attendance: { select: { date: true } },
        employee: { select: { id: true, firstName: true, lastName: true, email: true } },
        reviewedByUser: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async approve(companyId: string, reviewerUserId: string, requestId: string, comment?: string) {
    return prisma.$transaction(async (tx) => {
      const request = await tx.attendanceCorrectionRequest.findFirst({
        where: { id: requestId, companyId },
      });
      if (!request) throw new Error("Request not found");
      if (request.status !== "pending") throw new Error("Request already reviewed");

      const attendance = await tx.attendance.findFirst({
        where: { id: request.attendanceId, companyId, employeeId: request.employeeId },
        select: { id: true, date: true, checkIn: true, lunchStart: true, lunchEnd: true, checkOut: true },
      });
      if (!attendance) throw new Error("Attendance record not found");

      const mark = request.markType as MarkType;
      const current = attendance[mark];
      if (!current) throw new Error("No existe esa marcación para corregir");

      const updatedDate = toPeruISOString(attendance.date, request.requestedTime);
      validateSequence({
        checkIn: mark === "checkIn" ? updatedDate : attendance.checkIn,
        lunchStart: mark === "lunchStart" ? updatedDate : attendance.lunchStart,
        lunchEnd: mark === "lunchEnd" ? updatedDate : attendance.lunchEnd,
        checkOut: mark === "checkOut" ? updatedDate : attendance.checkOut,
      });
      await tx.attendance.update({
        where: { id: attendance.id },
        data: { [mark]: updatedDate },
      });

      return tx.attendanceCorrectionRequest.update({
        where: { id: request.id },
        data: {
          status: "approved",
          previousTimeApplied: peruHHMMFromDate(current),
          reviewedByUserId: reviewerUserId,
          reviewedAt: new Date(),
          reviewComment: comment,
        },
        include: {
          attendance: { select: { date: true } },
          employee: { select: { id: true, firstName: true, lastName: true, email: true } },
          reviewedByUser: { select: { id: true, name: true, email: true } },
        },
      });
    });
  }

  async reject(companyId: string, reviewerUserId: string, requestId: string, comment?: string) {
    const request = await prisma.attendanceCorrectionRequest.findFirst({
      where: { id: requestId, companyId },
    });
    if (!request) throw new Error("Request not found");
    if (request.status !== "pending") throw new Error("Request already reviewed");

    return prisma.attendanceCorrectionRequest.update({
      where: { id: request.id },
      data: {
        status: "rejected",
        reviewedByUserId: reviewerUserId,
        reviewedAt: new Date(),
        reviewComment: comment,
      },
      include: {
        attendance: { select: { date: true } },
        employee: { select: { id: true, firstName: true, lastName: true, email: true } },
        reviewedByUser: { select: { id: true, name: true, email: true } },
      },
    });
  }
}
