import { Request, Response } from "express";
import { AttendanceCorrectionService } from "../services/WorkScheduleChangeService";
import {
  createAttendanceCorrectionRequestSchema,
  listAttendanceCorrectionRequestsSchema,
  reviewAttendanceCorrectionRequestSchema,
} from "../utils/validators";

const service = new AttendanceCorrectionService();

export class AttendanceCorrectionController {
  async create(req: Request, res: Response) {
    try {
      const companyId = req.user?.companyId;
      const employeeId = req.user?.employeeId;
      if (!companyId || !employeeId) {
        res.status(400).json({ message: "Missing employee context" });
        return;
      }

      const data = createAttendanceCorrectionRequestSchema.parse(req.body);
      const created = await service.createRequest(companyId, employeeId, data);
      res.status(201).json(created);
    } catch (error: any) {
      res.status(400).json({ message: error.message || error.errors });
    }
  }

  async listMine(req: Request, res: Response) {
    try {
      const companyId = req.user?.companyId;
      const employeeId = req.user?.employeeId;
      if (!companyId || !employeeId) {
        res.status(400).json({ message: "Missing employee context" });
        return;
      }

      const rows = await service.listMyRequests(companyId, employeeId);
      res.json(rows);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async listCompany(req: Request, res: Response) {
    try {
      const companyId = req.user?.companyId;
      if (!companyId) {
        res.status(400).json({ message: "Tenant context missing" });
        return;
      }

      const { status } = listAttendanceCorrectionRequestsSchema.parse(req.query);
      const rows = await service.listCompanyRequests(companyId, status);
      res.json(rows);
    } catch (error: any) {
      res.status(400).json({ message: error.message || error.errors });
    }
  }

  async approve(req: Request, res: Response) {
    try {
      const companyId = req.user?.companyId;
      const reviewerUserId = req.user?.userId;
      if (!companyId || !reviewerUserId) {
        res.status(400).json({ message: "Tenant context missing" });
        return;
      }

      const { id } = req.params;
      const { comment } = reviewAttendanceCorrectionRequestSchema.parse(req.body || {});
      const reviewed = await service.approve(companyId, reviewerUserId, id as string, comment);
      res.json(reviewed);
    } catch (error: any) {
      res.status(400).json({ message: error.message || error.errors });
    }
  }

  async reject(req: Request, res: Response) {
    try {
      const companyId = req.user?.companyId;
      const reviewerUserId = req.user?.userId;
      if (!companyId || !reviewerUserId) {
        res.status(400).json({ message: "Tenant context missing" });
        return;
      }

      const { id } = req.params;
      const { comment } = reviewAttendanceCorrectionRequestSchema.parse(req.body || {});
      const reviewed = await service.reject(companyId, reviewerUserId, id as string, comment);
      res.json(reviewed);
    } catch (error: any) {
      res.status(400).json({ message: error.message || error.errors });
    }
  }
}
