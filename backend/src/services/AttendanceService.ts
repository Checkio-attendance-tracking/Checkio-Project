import { AttendanceRepository } from "../repositories/AttendanceRepository";
import { EmployeeRepository } from "../repositories/EmployeeRepository";
import { CompanyRepository } from "../repositories/CompanyRepository";

const attendanceRepo = new AttendanceRepository();
const employeeRepo = new EmployeeRepository();
const companyRepo = new CompanyRepository();

// Helper for Haversine distance
function getDistanceFromLatLonInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // Radius of the earth in m
  const dLat = deg2rad(lat2-lat1);  // deg2rad below
  const dLon = deg2rad(lon2-lon1); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in m
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI/180)
}

type AttendanceStatus = 'present' | 'absent' | 'late' | 'weekend' | 'dayOff';
type WorkDayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

type WorkSchedule = {
  timezone?: string;
  graceMinutes?: number;
  overtimeGraceMinutes?: number;
  days: Record<WorkDayKey, { enabled: boolean; start?: string; end?: string }>;
};

function hhmmToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map((v) => Number(v));
  return h * 60 + m;
}

function formatTimeInTimeZone(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).formatToParts(date);

  const hour = parts.find((p) => p.type === 'hour')?.value ?? '00';
  const minute = parts.find((p) => p.type === 'minute')?.value ?? '00';
  return `${hour}:${minute}`;
}

function fallbackDayKey(date: Date): WorkDayKey {
  const map: Record<number, WorkDayKey> = { 0: 'sun', 1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri', 6: 'sat' };
  return map[date.getDay()] ?? 'mon';
}

function getDayKeyInTimeZone(date: Date, timeZone: string): WorkDayKey {
  const weekday = new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'short' }).format(date);
  const map: Record<string, WorkDayKey> = {
    Mon: 'mon',
    Tue: 'tue',
    Wed: 'wed',
    Thu: 'thu',
    Fri: 'fri',
    Sat: 'sat',
    Sun: 'sun'
  };
  return map[weekday] ?? fallbackDayKey(date);
}

function getDayKeyFromUtcDate(date: Date): WorkDayKey {
  const map: Record<number, WorkDayKey> = { 0: 'sun', 1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri', 6: 'sat' };
  return map[date.getUTCDay()] ?? 'mon';
}

function getSchedule(raw: unknown): WorkSchedule | undefined {
  if (!raw) return undefined;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw) as unknown;
      return getSchedule(parsed);
    } catch {
      return undefined;
    }
  }
  if (typeof raw !== 'object') return undefined;
  const schedule = raw as WorkSchedule;
  if (!schedule.days || typeof schedule.days !== 'object') return undefined;
  return schedule;
}

function computeStatus(record: any, scheduleOverride?: unknown): AttendanceStatus {
  const schedule = getSchedule(scheduleOverride) ?? getSchedule(record.employee?.workSchedule);
  if (!schedule) {
    const dayKey = getDayKeyFromUtcDate(new Date(record.date));
    if (!record.checkIn && (dayKey === 'sat' || dayKey === 'sun')) {
      return 'weekend';
    }
    return record.checkIn ? 'present' : 'absent';
  }

  const timeZone = schedule.timezone || 'America/Lima';
  const dayKey = getDayKeyFromUtcDate(new Date(record.date));
  const day = schedule.days?.[dayKey];

  if (!day || !day.enabled) {
    return dayKey === 'sat' || dayKey === 'sun' ? 'weekend' : 'dayOff';
  }

  if (!record.checkIn) {
    return 'absent';
  }

  if (!day.start) {
    return 'present';
  }

  const grace = schedule.graceMinutes ?? 0;
  const expectedStart = hhmmToMinutes(day.start);
  const actualStart = hhmmToMinutes(formatTimeInTimeZone(new Date(record.checkIn), timeZone));

  return actualStart > expectedStart + grace ? 'late' : 'present';
}

function computeOvertimeMinutes(record: any, scheduleOverride?: unknown): number {
  const schedule = getSchedule(scheduleOverride) ?? getSchedule(record.employee?.workSchedule);
  if (!schedule) return 0;
  const timeZone = schedule.timezone || 'America/Lima';
  const dayKey = getDayKeyFromUtcDate(new Date(record.date));
  const day = schedule.days?.[dayKey];
  if (!day || !day.enabled || !day.end) return 0;
  if (!record.checkOut) return 0;
  const expectedEnd = hhmmToMinutes(day.end);
  let actualEnd = hhmmToMinutes(formatTimeInTimeZone(new Date(record.checkOut), timeZone));
  const expectedStart = day.start ? hhmmToMinutes(day.start) : undefined;
  const isOvernight = expectedStart !== undefined && expectedEnd < expectedStart;
  if (isOvernight && actualEnd < expectedEnd) actualEnd += 24 * 60;
  const grace = schedule.overtimeGraceMinutes ?? 0;
  const threshold = expectedEnd + grace;
  const diff = actualEnd - threshold;
  return diff > 0 ? diff : 0;
}

function withStatus(record: any, scheduleOverride?: unknown) {
  const status = computeStatus(record, scheduleOverride);
  const overtimeMinutes = computeOvertimeMinutes(record, scheduleOverride);
  return { ...record, status, overtimeMinutes };
}

function getDayRangeInTimeZone(now: Date, timeZone: string) {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  });
  const parts = dtf.formatToParts(now);
  const map: Record<string, string> = {};
  for (const p of parts) { if (p.type !== 'literal') map[p.type] = p.value; }
  const y = Number(map.year); const m = Number(map.month); const d = Number(map.day);
  const start = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
  const end = new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999));
  return { start, end };
}

export class AttendanceService {
  // Employee methods
  async markAttendance(
    companyId: string, 
    employeeId: string, 
    type: 'checkIn' | 'lunchStart' | 'lunchEnd' | 'checkOut',
    location?: { lat: number, lng: number },
    meta?: { userAgent?: string; device?: string; os?: string; ipAddress?: string }
  ) {
    const today = new Date();
    
    // Check if employee exists and belongs to company
    const employee = await employeeRepo.findById(companyId, employeeId);
    if (!employee) throw new Error("Employee not found");

    // Geofence Check
    const company = await companyRepo.findById(companyId);
    if (company?.geofenceEnabled) {
      if (!location) {
        throw new Error("Location is required for this company");
      }
      if (company.geofenceLat !== null && company.geofenceLng !== null) {
        const distance = getDistanceFromLatLonInMeters(
          location.lat, location.lng,
          company.geofenceLat, company.geofenceLng
        );
        const radius = company.geofenceRadius || 100;
        if (distance > radius) {
          throw new Error(`You are outside the allowed area (${Math.round(distance)}m > ${radius}m)`);
        }
      }
    }

    // Find today's record (company timezone)
    const timeZone = (employee.workSchedule && (employee.workSchedule as any).timezone) || 'America/Lima';
    const { start, end } = getDayRangeInTimeZone(today, timeZone);
    const openRecord = await attendanceRepo.findLatestOpenByEmployee(companyId, employeeId);
    if (type === 'checkIn' && openRecord) {
      throw new Error("Must check-out first");
    }
    const record =
      type === 'checkIn'
        ? await attendanceRepo.findByDateRange(companyId, employeeId, start, end)
        : openRecord ?? (await attendanceRepo.findByDateRange(companyId, employeeId, start, end));

    if (!record) {
      // Create new record only if type is checkIn
      if (type !== 'checkIn') {
        throw new Error("Must check-in first");
      }

      const created = await attendanceRepo.create(companyId, {
        employeeId,
        date: start,
        checkIn: today,
        latCheckIn: location?.lat,
        lngCheckIn: location?.lng,
        ipCheckIn: meta?.ipAddress,
        userAgentCheckIn: meta?.userAgent,
        deviceCheckIn: meta?.device,
        osCheckIn: meta?.os
      });
      return withStatus(created, employee.workSchedule);
    }

    // Update existing record
    // Validate sequence
    if (type === 'checkIn') {
      throw new Error("Already checked in today");
    }

    if (type === 'lunchStart') {
      if (!record.checkIn) throw new Error("Must check-in first");
      if (record.lunchStart) throw new Error("Already started lunch");
      if (record.checkOut) throw new Error("Already checked out");
      
      const updated = await attendanceRepo.update(record.id, { 
        lunchStart: today,
        latLunchStart: location?.lat,
        lngLunchStart: location?.lng,
        ipLunchStart: meta?.ipAddress,
        userAgentLunchStart: meta?.userAgent,
        deviceLunchStart: meta?.device,
        osLunchStart: meta?.os
      }, companyId);
      return withStatus(updated, employee.workSchedule);
    }

    if (type === 'lunchEnd') {
      if (!record.lunchStart) throw new Error("Must start lunch first");
      if (record.lunchEnd) throw new Error("Already ended lunch");
      if (record.checkOut) throw new Error("Already checked out");

      const updated = await attendanceRepo.update(record.id, { 
        lunchEnd: today,
        latLunchEnd: location?.lat,
        lngLunchEnd: location?.lng,
        ipLunchEnd: meta?.ipAddress,
        userAgentLunchEnd: meta?.userAgent,
        deviceLunchEnd: meta?.device,
        osLunchEnd: meta?.os
      }, companyId);
      return withStatus(updated, employee.workSchedule);
    }

    if (type === 'checkOut') {
      if (!record.checkIn) throw new Error("Must check-in first");
      if (record.checkOut) throw new Error("Already checked out");
      // Optional: enforce lunch sequence completion?
      
      const updated = await attendanceRepo.update(record.id, { 
        checkOut: today,
        latCheckOut: location?.lat,
        lngCheckOut: location?.lng,
        ipCheckOut: meta?.ipAddress,
        userAgentCheckOut: meta?.userAgent,
        deviceCheckOut: meta?.device,
        osCheckOut: meta?.os
      }, companyId);
      return withStatus(updated, employee.workSchedule);
    }
  }

  async getMyHistory(companyId: string, employeeId: string) {
    const records = await attendanceRepo.findAllByEmployee(companyId, employeeId);
    return records.map((r) => withStatus(r));
  }

  // HR methods
  async getAll(companyId: string, date?: string, employeeId?: string) {
    const queryDate = date ? new Date(date) : undefined;
    const records = await attendanceRepo.findAllByCompany(companyId, queryDate, employeeId);
    return records.map((r) => withStatus(r));
  }

  async getById(companyId: string, id: string) {
    const record = await attendanceRepo.findById(companyId, id);
    if (!record) throw new Error("Attendance record not found");
    return withStatus(record);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async create(companyId: string, data: any) {
    throw new Error("Not allowed");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async update(companyId: string, id: string, data: any) {
    throw new Error("Not allowed");
  }

  async delete(companyId: string, id: string) {
    throw new Error("Not allowed");
  }
}
