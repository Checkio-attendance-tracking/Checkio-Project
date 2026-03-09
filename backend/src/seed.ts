import { prisma } from "./config/database";
import { hashPassword } from "./utils/password";

const seed = async () => {
  console.log("Starting database seed...");

  // Clean existing data
  try {
    await prisma.attendance.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.employee.deleteMany({});
    await prisma.company.deleteMany({});
    console.log("Database cleaned.");
  } catch (error) {
    console.warn("Error cleaning database (might be empty):", error);
  }

  // Create Superadmin
  const superAdmin = await prisma.user.create({
    data: {
      name: "Super Admin",
      email: "superadmin@checkio.pe",
      passwordHash: await hashPassword("superadmin123"),
      role: "superadmin",
      companyId: null // Explicitly null
    }
  });

  console.log("Superadmin created:", superAdmin.email);
};

seed()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
