import { EmployeeRepository } from "../repositories/EmployeeRepository";
// import { Prisma } from "@prisma/client";

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
    // Validate uniqueness of documentId within company?
    if (data.documentId) {
      const existing = await employeeRepo.findByDocument(companyId, data.documentId);
      if (existing) throw new Error("Employee with this document ID already exists");
    }

    return employeeRepo.create(companyId, data);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async update(companyId: string, id: string, data: any) {
    return employeeRepo.update(companyId, id, data);
  }

  async delete(companyId: string, id: string) {
    return employeeRepo.delete(companyId, id);
  }
}
