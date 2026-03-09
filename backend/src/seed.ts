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

  // Create Company
  const company = await prisma.company.create({
    data: {
      name: "Checkio S.A.C."
    }
  });

  console.log("Company created:", company.id);

  // Create Admin User
  const password = await hashPassword("admin123");
  const admin = await prisma.user.create({
    data: {
      companyId: company.id,
      name: "Admin Principal",
      email: "admin@checkio.pe",
      passwordHash: password,
      role: "admin"
    }
  });

  console.log("Admin created:", admin.email);

  // Create Employee
  const employee = await prisma.employee.create({
    data: {
      companyId: company.id,
      firstName: "Juan",
      lastName: "Perez",
      email: "juan@checkio.pe",
      documentId: "12345678",
      department: "Desarrollador",
      joinDate: new Date(),
      status: "active",
      businessName: "Checkio S.A.C.",
      workplace: "Oficina Central"
    }
  });

  console.log("Employee created:", employee.id);

  // Link Employee to User
  const empUser = await prisma.user.create({
    data: {
      companyId: company.id,
      name: "Juan Perez",
      email: "juan@checkio.pe",
      passwordHash: await hashPassword("juan123"),
      role: "employee",
      employeeId: employee.id
    }
  });

  console.log("Employee User created:", empUser.email);

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
