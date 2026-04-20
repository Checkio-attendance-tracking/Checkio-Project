import { EmployeeRepository } from "../repositories/EmployeeRepository";
import { prisma } from "../config/database";

const employeeRepo = new EmployeeRepository();

export class EmployeeService {
  async getAll(companyId: string) {
    return employeeRepo.findAll(companyId);
  }

  async getById(companyId: string, id: string) {
    const employee = await employeeRepo.findById(companyId, id);
    if (!employee) throw new Error("Employee not found");
    return employee;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async create(companyId: string, data: any) {
    // Check Company Limits
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: { _count: { select: { employees: true } } }
    });

    if (!company) throw new Error("Company not found");

    if (company.status !== 'active') {
      throw new Error("Company is not active");
    }

    if (company._count.employees >= company.maxEmployees) {
      throw new Error(`Employee limit reached (${company.maxEmployees})`);
    }

    // Validate uniqueness of documentId within company?
    if (data.documentId) {
      const existing = await employeeRepo.findByDocument(companyId, data.documentId);
      if (existing) throw new Error("Employee with this document ID already exists");
    }

    return employeeRepo.create(companyId, data);
  }


  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async update(companyId: string, id: string, data: any, actorUserId?: string) {
    return employeeRepo.update(companyId, id, data, actorUserId);
  }

  async delete(companyId: string, id: string, actorUserId?: string) {
    return employeeRepo.delete(companyId, id, actorUserId);
  }
}
