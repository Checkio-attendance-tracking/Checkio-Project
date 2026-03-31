import { prisma } from "./config/database";
import { hashPassword } from "./utils/password";

function dateAtPeruTime(dateYYYYMMDD: string, hhmm: string): Date {
  const [yStr, mStr, dStr] = dateYYYYMMDD.split("-");
  const [hhStr, mmStr] = hhmm.split(":");
  const y = Number(yStr);
  const m = Number(mStr);
  const d = Number(dStr);
  const hh = Number(hhStr);
  const mm = Number(mmStr);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d) || !Number.isFinite(hh) || !Number.isFinite(mm)) {
    throw new Error("Invalid date/time");
  }
  return new Date(Date.UTC(y, m - 1, d, hh + 5, mm, 0, 0));
}

function utcMidnight(dateYYYYMMDD: string): Date {
  return new Date(`${dateYYYYMMDD}T00:00:00.000Z`);
}

const seed = async () => {
  console.log("Starting database reset (beta)...");

  const superAdminEmail = "superadmin@checkio.pe";

  await prisma.$transaction(async (tx) => {
    const existingSuperadmin = await tx.user.findUnique({
      where: { email: superAdminEmail }
    });

    const passwordHash = await hashPassword("superadmin123");

    if (!existingSuperadmin) {
      await tx.user.create({
        data: {
          name: "Super Admin",
          email: superAdminEmail,
          passwordHash,
          role: "superadmin",
          companyId: null
        }
      });
    } else {
      await tx.user.update({
        where: { id: existingSuperadmin.id },
        data: {
          role: "superadmin",
          companyId: null,
          employeeId: null,
          passwordHash
        }
      });
    }

    await tx.notification.deleteMany({});
    await tx.attendanceCorrectionRequest.deleteMany({});
    await tx.attendance.deleteMany({});
    await tx.user.deleteMany({ where: { role: { not: "superadmin" } } });
    await tx.employee.deleteMany({});
    await tx.company.deleteMany({});

    const qaCompany = await tx.company.create({
      data: {
        name: "QA Company",
        maxEmployees: 50,
        status: "active",
        geofenceEnabled: false,
      },
    });

    const qaPassword = "qa123456";
    const qaPasswordHash = await hashPassword(qaPassword);

    const rrhh = await tx.user.create({
      data: {
        companyId: qaCompany.id,
        name: "Recursos Humanos QA",
        email: "rrhh.qa@checkio.pe",
        passwordHash: qaPasswordHash,
        role: "admin",
      },
    });

    const employee1 = await tx.employee.create({
      data: {
        companyId: qaCompany.id,
        firstName: "Juan",
        lastName: "QA",
        email: "juan.qa@checkio.pe",
        department: "QA",
        joinDate: utcMidnight("2026-01-10"),
        status: "active",
        workplace: "Oficina Central",
      },
    });
    const employeeUser1 = await tx.user.create({
      data: {
        companyId: qaCompany.id,
        name: `${employee1.firstName} ${employee1.lastName}`,
        email: employee1.email,
        passwordHash: qaPasswordHash,
        role: "employee",
        employeeId: employee1.id,
      },
    });

    const employee2 = await tx.employee.create({
      data: {
        companyId: qaCompany.id,
        firstName: "María",
        lastName: "QA",
        email: "maria.qa@checkio.pe",
        department: "QA",
        joinDate: utcMidnight("2026-02-05"),
        status: "active",
        workplace: "Oficina Central",
      },
    });
    const employeeUser2 = await tx.user.create({
      data: {
        companyId: qaCompany.id,
        name: `${employee2.firstName} ${employee2.lastName}`,
        email: employee2.email,
        passwordHash: qaPasswordHash,
        role: "employee",
        employeeId: employee2.id,
      },
    });

    const today = new Date();
    const yyyy = today.getUTCFullYear();
    const mm = String(today.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(today.getUTCDate()).padStart(2, "0");
    const todayStr = `${yyyy}-${mm}-${dd}`;
    const yesterday = new Date(Date.UTC(yyyy, today.getUTCMonth(), today.getUTCDate() - 1));
    const yStr = `${yesterday.getUTCFullYear()}-${String(yesterday.getUTCMonth() + 1).padStart(2, "0")}-${String(yesterday.getUTCDate()).padStart(2, "0")}`;

    const att1 = await tx.attendance.create({
      data: {
        companyId: qaCompany.id,
        employeeId: employee1.id,
        date: utcMidnight(yStr),
        checkIn: dateAtPeruTime(yStr, "08:10"),
        lunchStart: dateAtPeruTime(yStr, "13:00"),
        lunchEnd: dateAtPeruTime(yStr, "14:00"),
        checkOut: dateAtPeruTime(yStr, "18:05"),
      },
    });

    const pendingReq = await tx.attendanceCorrectionRequest.create({
      data: {
        companyId: qaCompany.id,
        employeeId: employee1.id,
        attendanceId: att1.id,
        markType: "checkIn",
        requestedTime: "08:00",
        previousTimeAtRequest: "08:10",
        reason: "Prueba QA: ajuste de hora de ingreso",
        status: "pending",
      },
    });

    await tx.notification.create({
      data: {
        companyId: qaCompany.id,
        toUserId: rrhh.id,
        type: "attendanceCorrectionCreated",
        title: "Nueva solicitud de corrección",
        body: `${employee1.firstName} ${employee1.lastName} solicitó corregir Ingreso del ${yStr} (08:10 → 08:00).`,
        link: "/admin/correction-requests",
        metadata: JSON.stringify({ requestId: pendingReq.id, employeeId: employee1.id, attendanceId: att1.id, markType: "checkIn", date: yStr }),
      },
    });

    const att2 = await tx.attendance.create({
      data: {
        companyId: qaCompany.id,
        employeeId: employee2.id,
        date: utcMidnight(todayStr),
        checkIn: dateAtPeruTime(todayStr, "08:00"),
        lunchStart: dateAtPeruTime(todayStr, "13:00"),
        lunchEnd: dateAtPeruTime(todayStr, "14:00"),
        checkOut: dateAtPeruTime(todayStr, "17:30"),
      },
    });

    const approvedReq = await tx.attendanceCorrectionRequest.create({
      data: {
        companyId: qaCompany.id,
        employeeId: employee2.id,
        attendanceId: att2.id,
        markType: "checkOut",
        requestedTime: "18:00",
        previousTimeAtRequest: "17:30",
        previousTimeApplied: "17:30",
        reason: "Prueba QA: hora extra registrada",
        status: "approved",
        reviewedByUserId: rrhh.id,
        reviewedAt: new Date(),
        reviewComment: "QA: aprobado",
      },
    });

    await tx.notification.create({
      data: {
        companyId: qaCompany.id,
        toUserId: employeeUser2.id,
        type: "attendanceCorrectionApproved",
        title: "Solicitud aprobada",
        body: `Recursos Humanos aprobó tu solicitud de corrección de Salida del ${todayStr} (17:30 → 18:00).`,
        link: "/dashboard/history?tab=solicitudes",
        metadata: JSON.stringify({ requestId: approvedReq.id, employeeId: employee2.id, attendanceId: att2.id, markType: "checkOut", date: todayStr }),
      },
    });

    await tx.notification.create({
      data: {
        companyId: qaCompany.id,
        toUserId: employeeUser1.id,
        type: "generic",
        title: "Bienvenido a QA",
        body: "Notificación de prueba para validar la campana.",
        link: "/dashboard/history",
      },
    });
  });

  console.log("Seed listo.");
  console.log("Superadmin:", superAdminEmail, "password: superadmin123");
  console.log("Recursos Humanos QA:", "rrhh.qa@checkio.pe", "password: qa123456");
  console.log("Empleado QA 1:", "juan.qa@checkio.pe", "password: qa123456");
  console.log("Empleado QA 2:", "maria.qa@checkio.pe", "password: qa123456");
};

seed()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
