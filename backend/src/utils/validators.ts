import { z } from "zod";

export const createEmployeeSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  documentId: z.string().optional(),
  department: z.string().min(2),
  joinDate: z.string().transform((str) => new Date(str)),
  birthDate: z.string().optional().transform((str) => str ? new Date(str) : undefined),
  status: z.enum(["active", "inactive"]).default("active"),
  businessName: z.string().optional(),
  workplace: z.string().optional(),
  password: z.string().min(6).optional(),
  role: z.enum(["admin", "employee"]).default("employee"),
});

export const updateEmployeeSchema = createEmployeeSchema.partial();

export const markAttendanceSchema = z.object({
  type: z.enum(["checkIn", "lunchStart", "lunchEnd", "checkOut"]),
});

export const createAttendanceSchema = z.object({
  employeeId: z.string().uuid(),
  date: z.string().transform((str) => new Date(str)),
  checkIn: z.string().optional().transform((str) => str ? new Date(str) : undefined),
  lunchStart: z.string().optional().transform((str) => str ? new Date(str) : undefined),
  lunchEnd: z.string().optional().transform((str) => str ? new Date(str) : undefined),
  checkOut: z.string().optional().transform((str) => str ? new Date(str) : undefined),
});

export const updateAttendanceSchema = createAttendanceSchema.partial().omit({ employeeId: true, date: true });
