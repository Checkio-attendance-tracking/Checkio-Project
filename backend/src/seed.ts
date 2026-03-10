import { prisma } from "./config/database";
import { hashPassword } from "./utils/password";

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

    await tx.attendance.deleteMany({});
    await tx.user.deleteMany({ where: { role: { not: "superadmin" } } });
    await tx.employee.deleteMany({});
    await tx.company.deleteMany({});
  });

  console.log("Database cleaned. Only superadmin remains:", superAdminEmail);
};

seed()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
