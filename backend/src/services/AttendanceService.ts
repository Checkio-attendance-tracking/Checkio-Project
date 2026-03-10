import { AttendanceRepository } from "../repositories/AttendanceRepository";
import { EmployeeRepository } from "../repositories/EmployeeRepository";
import { CompanyRepository } from "../repositories/CompanyRepository";
import { startOfDay } from "date-fns";

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

type AttendanceStatus = 'present' | 'absent' | 'late' | 'weekend';
type WorkDayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

type WorkSchedule = {
  timezone?: string;
  graceMinutes?: number;
  days: Record<WorkDayKey, { enabled: boolean; start?: string; end?: string; breakStart?: string; breakEnd?: string }>;
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

function getSchedule(raw: unknown): WorkSchedule | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const schedule = raw as WorkSchedule;
  if (!schedule.days || typeof schedule.days !== 'object') return undefined;
  return schedule;
}

function computeStatus(record: any, scheduleOverride?: unknown): AttendanceStatus {
  const schedule = getSchedule(scheduleOverride) ?? getSchedule(record.employee?.workSchedule);
  if (!schedule) {
    return record.checkIn ? 'present' : 'absent';
  }

  const timeZone = schedule.timezone || 'America/Lima';
  const dayKey = getDayKeyInTimeZone(new Date(record.date), timeZone);
  const day = schedule.days?.[dayKey];

  if (!day || !day.enabled) {
    return 'weekend';
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

function withStatus(record: any, scheduleOverride?: unknown) {
  return { ...record, status: computeStatus(record, scheduleOverride) };
}

export class AttendanceService {
  // Employee methods
  async markAttendance(
    companyId: string, 
    employeeId: string, 
    type: 'checkIn' | 'lunchStart' | 'lunchEnd' | 'checkOut',
    location?: { lat: number, lng: number }
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

    // Find today's record
    const record = await attendanceRepo.findByDate(companyId, employeeId, today);

    if (!record) {
      // Create new record only if type is checkIn
      if (type !== 'checkIn') {
        throw new Error("Must check-in first");
      }

      const created = await attendanceRepo.create(companyId, {
        employeeId,
        date: startOfDay(today),
        checkIn: today,
        latCheckIn: location?.lat,
        lngCheckIn: location?.lng
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
        lngLunchStart: location?.lng
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
        lngLunchEnd: location?.lng
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
        lngCheckOut: location?.lng
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
    // Validate that employee belongs to company
    const employee = await employeeRepo.findById(companyId, data.employeeId);
    if (!employee) throw new Error("Employee not found");

    // Check for existing record for this date/employee
    const existing = await attendanceRepo.findByDate(companyId, data.employeeId, data.date);
    if (existing) throw new Error("Attendance record already exists for this date");

    const created = await attendanceRepo.create(companyId, data);
    return withStatus(created, employee.workSchedule);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async update(companyId: string, id: string, data: any) {
    const updated = await attendanceRepo.update(id, data, companyId);
    const record = await attendanceRepo.findById(companyId, id);
    return record ? withStatus(record) : withStatus(updated);
  }

  async delete(companyId: string, id: string) {
    return attendanceRepo.delete(companyId, id);
  }
}
