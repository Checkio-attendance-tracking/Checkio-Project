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
}
