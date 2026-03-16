import { Request, Response } from "express";
import { AttendanceService } from "../services/AttendanceService";
import { markAttendanceSchema, createAttendanceSchema, updateAttendanceSchema } from "../utils/validators";

const attendanceService = new AttendanceService();

function parseDevice(userAgent?: string): { device?: string; os?: string } {
  if (!userAgent) return {};

  const ua = userAgent.toLowerCase();

  const device =
    /mobi|android|iphone|ipad|ipod/.test(ua) ? "mobile" :
    /windows|macintosh|linux|cros/.test(ua) ? "desktop" :
    "unknown";

  const os =
    /windows nt/.test(ua) ? "Windows" :
    /android/.test(ua) ? "Android" :
    /iphone|ipad|ipod/.test(ua) ? "iOS" :
    /mac os x|macintosh/.test(ua) ? "macOS" :
    /cros/.test(ua) ? "ChromeOS" :
    /linux/.test(ua) ? "Linux" :
    "Unknown";

  return { device, os };
}

function getClientIp(req: Request): string | undefined {
  const xfwd = req.headers["x-forwarded-for"];
  const raw = Array.isArray(xfwd) ? xfwd[0] : xfwd;
  const first = typeof raw === "string" ? raw.split(",")[0]?.trim() : undefined;
  return first || req.ip || req.socket.remoteAddress || undefined;
}

export class AttendanceController {
  async mark(req: Request, res: Response) {
    try {
      const { type, location } = markAttendanceSchema.parse(req.body);
      const employeeId = req.user!.employeeId;
      
      if (!employeeId) {
         res.status(400).json({ message: "User is not linked to an employee profile" });
         return;
      }

      const result = await attendanceService.markAttendance(
        req.user!.companyId as string,
        employeeId,
        type,
        location,
        {
          userAgent: req.get("user-agent") || undefined,
          ipAddress: getClientIp(req),
          ...parseDevice(req.get("user-agent") || undefined)
        }
      );
      res.json(result);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      res.status(400).json({ message: error.message || error.errors });
    }
  }

  async getMyHistory(req: Request, res: Response) {
    try {
      const employeeId = req.user!.employeeId;
      if (!employeeId) {
        res.status(400).json({ message: "No employee profile" });
        return;
      }

      const history = await attendanceService.getMyHistory(req.user!.companyId as string, employeeId);
      res.json(history);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const { date, employeeId } = req.query;
      const records = await attendanceService.getAll(req.user!.companyId as string, date as string, employeeId as string);
      res.json(records);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('GetAll error:', error);
      res.status(400).json({ message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const record = await attendanceService.getById(req.user!.companyId as string, id as string);
      res.json(record);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const validatedData = createAttendanceSchema.parse(req.body);
      const record = await attendanceService.create(req.user!.companyId as string, validatedData);
      res.status(201).json(record);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      res.status(400).json({ message: error.message || error.errors });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = updateAttendanceSchema.parse(req.body);
      const record = await attendanceService.update(req.user!.companyId as string, id as string, validatedData);
      res.json(record);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      res.status(400).json({ message: error.message || error.errors });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await attendanceService.delete(req.user!.companyId as string, id as string);
      res.status(204).send();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
