import { z } from "zod";

const timeHHMM = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Invalid time format (HH:mm)");

const workDaySchema = z.object({
  enabled: z.boolean(),
  start: timeHHMM.optional(),
  end: timeHHMM.optional(),
  breakStart: timeHHMM.optional(),
  breakEnd: timeHHMM.optional(),
});

export const workScheduleSchema = z.object({
  timezone: z.string().optional(),
  graceMinutes: z.number().int().min(0).max(240).optional(),
  days: z.object({
    mon: workDaySchema,
    tue: workDaySchema,
    wed: workDaySchema,
    thu: workDaySchema,
    fri: workDaySchema,
    sat: workDaySchema,
    sun: workDaySchema,
  })
}).superRefine((value, ctx) => {
  const days = value.days;
  (Object.keys(days) as Array<keyof typeof days>).forEach((k) => {
    const d = days[k];
    if (d.enabled && (!d.start || !d.end)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["days", k],
        message: "Enabled days must include start and end"
      });
    }
  });
});

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
  workSchedule: workScheduleSchema.optional(),
  password: z.string().min(6).optional(),
  role: z.enum(["admin", "employee"]).default("employee"),
});

export const updateEmployeeSchema = createEmployeeSchema.partial();

export const markAttendanceSchema = z.object({
  type: z.enum(["checkIn", "lunchStart", "lunchEnd", "checkOut"]),
  location: z.object({
    lat: z.number(),
    lng: z.number()
  }).optional(),
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
