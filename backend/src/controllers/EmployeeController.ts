import { Request, Response } from "express";
import { EmployeeService } from "../services/EmployeeService";
import { createEmployeeSchema, updateEmployeeSchema } from "../utils/validators";

const employeeService = new EmployeeService();

export class EmployeeController {
  async getAll(req: Request, res: Response) {
    try {
      const employees = await employeeService.getAll(req.user!.companyId as string);
      res.json(employees);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const validatedData = createEmployeeSchema.parse(req.body);
      const employee = await employeeService.create(req.user!.companyId as string, validatedData);
      res.status(201).json(employee);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      res.status(400).json({ message: error.message || error.errors });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = updateEmployeeSchema.parse(req.body);
      const employee = await employeeService.update(req.user!.companyId as string, id as string, validatedData);
      res.json(employee);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      res.status(400).json({ message: error.message || error.errors });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await employeeService.delete(req.user!.companyId as string, id as string);
      res.status(204).send();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
