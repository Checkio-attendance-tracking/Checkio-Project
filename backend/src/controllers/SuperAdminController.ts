import { Request, Response } from "express";
import { prisma } from "../config/database";
import { hashPassword } from "../utils/password";

export class SuperAdminController {
  async listCompanies(req: Request, res: Response) {
    try {
      // Background cleanup: delete suspended companies older than 30 days
      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const expiredCompanies = await prisma.company.findMany({
          where: {
            status: 'suspended',
            suspendedAt: { lt: thirtyDaysAgo }
          },
          select: { id: true }
        });

        if (expiredCompanies.length > 0) {
          console.log(`Deleting ${expiredCompanies.length} expired suspended companies`);
          for (const company of expiredCompanies) {
            try {
               await prisma.attendance.deleteMany({ where: { companyId: company.id } });
               await prisma.employee.deleteMany({ where: { companyId: company.id } });
               await prisma.user.deleteMany({ where: { companyId: company.id } });
               await prisma.company.delete({ where: { id: company.id } });
            } catch (e) {
               console.error(`Failed to delete expired company ${company.id}`, e);
            }
          }
        }
      } catch (cleanupError) {
        console.error("Error during background cleanup:", cleanupError);
      }

      const companies = await prisma.company.findMany({
        include: {
          _count: {
            select: { employees: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      const result = companies.map(c => ({
        id: c.id,
        name: c.name,
        maxEmployees: c.maxEmployees,
        currentEmployees: c._count.employees,
        status: c.status,
        suspendedAt: c.suspendedAt,
        createdAt: c.createdAt
      }));

      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching companies" });
    }
  }

  async getCompany(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const company = await prisma.company.findUnique({
        where: { id: id as string },
        include: {
          _count: {
            select: { employees: true }
          }
        }
      });

      if (!company) {
        res.status(404).json({ message: "Company not found" });
        return;
      }

      res.json({
        id: company.id,
        name: company.name,
        maxEmployees: company.maxEmployees,
        currentEmployees: company._count.employees,
        status: company.status,
        suspendedAt: company.suspendedAt,
        createdAt: company.createdAt
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching company" });
    }
  }

  async createCompany(req: Request, res: Response) {
    try {
      const { name, maxEmployees, adminName, adminEmail, adminPassword } = req.body;

      // Validation
      if (!name || !maxEmployees || !adminEmail || !adminPassword) {
        res.status(400).json({ message: "Missing required fields" });
        return;
      }

      // Transaction to create company + admin user
      const result = await prisma.$transaction(async (tx) => {
        const company = await tx.company.create({
          data: {
            name,
            maxEmployees: Number(maxEmployees),
            status: 'active'
          }
        });

        const hashedPassword = await hashPassword(adminPassword);
        
        const adminUser = await tx.user.create({
          data: {
            companyId: company.id,
            name: adminName || "Admin",
            email: adminEmail,
            passwordHash: hashedPassword,
            role: "admin" // HR role
          }
        });

        return { company, adminUser };
      });

      res.status(201).json(result);
    } catch (error: any) {
      console.error(error);
      if (error.code === 'P2002') {
         res.status(400).json({ message: "Email already exists" });
         return;
      }
      res.status(500).json({ message: "Error creating company" });
    }
  }

  async updateCompany(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { maxEmployees, status, name } = req.body;

      const data: any = {
        maxEmployees: maxEmployees ? Number(maxEmployees) : undefined,
        name: name || undefined
      };

      if (status) {
        data.status = status;
        if (status === 'suspended') {
          data.suspendedAt = new Date();
        } else if (status === 'active') {
          data.suspendedAt = null;
        }
      }

      const company = await prisma.company.update({
        where: { id: id as string },
        data
      });

      res.json(company);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error updating company" });
    }
  }

  async createCompanyUser(req: Request, res: Response) {
    try {
      const { id } = req.params; // companyId
      const { name, email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ message: "Missing email or password" });
        return;
      }

      const hashedPassword = await hashPassword(password);

      const user = await prisma.user.create({
        data: {
          companyId: id as string,
          name: name || "HR User",
          email,
          passwordHash: hashedPassword,
          role: "admin" // HR role
        }
      });

      res.status(201).json({ id: user.id, email: user.email, role: user.role });
    } catch (error: any) {
      console.error(error);
      if (error.code === 'P2002') {
        res.status(400).json({ message: "Email already exists" });
        return;
     }
      res.status(500).json({ message: "Error creating user" });
    }
  }

  async listCompanyUsers(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const users = await prisma.user.findMany({
        where: {
          companyId: id as string,
          role: "admin",
        },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      });

      res.json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching company users" });
    }
  }

  async resetCompanyUserPassword(req: Request, res: Response) {
    try {
      const { id, userId } = req.params;
      const { password } = req.body;

      if (!password || typeof password !== "string" || password.length < 8) {
        res.status(400).json({ message: "Password must be at least 8 characters" });
        return;
      }

      const user = await prisma.user.findFirst({
        where: {
          id: userId as string,
          companyId: id as string,
          role: "admin",
        },
        select: { id: true, email: true },
      });

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      const passwordHash = await hashPassword(password);
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      });

      res.json({ id: user.id, email: user.email });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error resetting password" });
    }
  }

  async importEmployees(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const companyId = id as string;

      const payload = req.body as {
        employees?: Array<{
          email?: string;
          firstName?: string;
          lastName?: string;
          department?: string;
          joinDate?: string;
          birthDate?: string;
          businessName?: string;
          workplace?: string;
          password?: string;
          workSchedule?: unknown;
        }>;
      };

      const employees = Array.isArray(payload.employees) ? payload.employees : [];
      if (employees.length === 0) {
        res.status(400).json({ message: "No employees provided" });
        return;
      }

      const company = await prisma.company.findUnique({
        where: { id: companyId },
        include: { _count: { select: { employees: true } } },
      });
      if (!company) {
        res.status(404).json({ message: "Company not found" });
        return;
      }

      const remaining = Math.max(0, company.maxEmployees - company._count.employees);

      const created: Array<{ employeeId: string; email: string }> = [];
      const skipped: Array<{ index: number; email?: string; reason: string }> = [];

      for (let i = 0; i < employees.length; i++) {
        if (created.length >= remaining) {
          skipped.push({ index: i, email: employees[i]?.email, reason: `Employee limit reached (${company.maxEmployees})` });
          continue;
        }

        const e = employees[i] || {};
        const email = typeof e.email === "string" ? e.email.trim().toLowerCase() : "";
        const firstName = typeof e.firstName === "string" ? e.firstName.trim() : "";
        const lastName = typeof e.lastName === "string" ? e.lastName.trim() : "";
        const department = typeof e.department === "string" ? e.department.trim() : "";
        const joinDateStr = typeof e.joinDate === "string" ? e.joinDate.trim() : "";

        if (!email || !firstName || !lastName || !department || !joinDateStr) {
          skipped.push({ index: i, email: e.email, reason: "Missing required fields" });
          continue;
        }

        const joinDate = new Date(joinDateStr);
        if (Number.isNaN(joinDate.getTime())) {
          skipped.push({ index: i, email, reason: "Invalid joinDate" });
          continue;
        }

        const birthDate =
          typeof e.birthDate === "string" && e.birthDate.trim()
            ? new Date(e.birthDate.trim())
            : undefined;
        if (birthDate && Number.isNaN(birthDate.getTime())) {
          skipped.push({ index: i, email, reason: "Invalid birthDate" });
          continue;
        }

        const existingEmployee = await prisma.employee.findUnique({ where: { email } });
        if (existingEmployee) {
          skipped.push({ index: i, email, reason: "Employee email already exists" });
          continue;
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
          skipped.push({ index: i, email, reason: "User email already exists" });
          continue;
        }

        const workSchedule =
          typeof e.workSchedule === "string"
            ? e.workSchedule
            : e.workSchedule
              ? JSON.stringify(e.workSchedule)
              : undefined;

        const password = typeof e.password === "string" ? e.password : undefined;
        if (password && password.length < 6) {
          skipped.push({ index: i, email, reason: "Password must be at least 6 characters" });
          continue;
        }

        const employee = await prisma.employee.create({
          data: {
            companyId,
            email,
            firstName,
            lastName,
            department,
            joinDate,
            birthDate,
            businessName: typeof e.businessName === "string" ? e.businessName : undefined,
            workplace: typeof e.workplace === "string" ? e.workplace : undefined,
            workSchedule,
            status: "active",
          },
        });

        if (password) {
          const passwordHash = await hashPassword(password);
          await prisma.user.create({
            data: {
              companyId,
              name: `${employee.firstName} ${employee.lastName}`,
              email,
              passwordHash,
              role: "employee",
              employeeId: employee.id,
            },
          });
        }

        created.push({ employeeId: employee.id, email });
      }

      res.json({
        companyId,
        createdCount: created.length,
        skippedCount: skipped.length,
        created,
        skipped,
      });
    } catch (error: any) {
      console.error(error);
      if (error?.code === "P2002") {
        res.status(400).json({ message: "Duplicate key" });
        return;
      }
      res.status(500).json({ message: "Error importing employees" });
    }
  }
}
