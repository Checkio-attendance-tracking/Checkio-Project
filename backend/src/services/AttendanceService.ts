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

      return attendanceRepo.create(companyId, {
        employeeId,
        date: startOfDay(today),
        checkIn: today,
        latCheckIn: location?.lat,
        lngCheckIn: location?.lng
      });
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
      
      return attendanceRepo.update(record.id, { 
        lunchStart: today,
        latLunchStart: location?.lat,
        lngLunchStart: location?.lng
      }, companyId);
    }

    if (type === 'lunchEnd') {
      if (!record.lunchStart) throw new Error("Must start lunch first");
      if (record.lunchEnd) throw new Error("Already ended lunch");
      if (record.checkOut) throw new Error("Already checked out");

      return attendanceRepo.update(record.id, { 
        lunchEnd: today,
        latLunchEnd: location?.lat,
        lngLunchEnd: location?.lng
      }, companyId);
    }

    if (type === 'checkOut') {
      if (!record.checkIn) throw new Error("Must check-in first");
      if (record.checkOut) throw new Error("Already checked out");
      // Optional: enforce lunch sequence completion?
      
      return attendanceRepo.update(record.id, { 
        checkOut: today,
        latCheckOut: location?.lat,
        lngCheckOut: location?.lng
      }, companyId);
    }
  }

  async getMyHistory(companyId: string, employeeId: string) {
    return attendanceRepo.findAllByEmployee(companyId, employeeId);
  }

  // HR methods
  async getAll(companyId: string, date?: string, employeeId?: string) {
    const queryDate = date ? new Date(date) : undefined;
    return attendanceRepo.findAllByCompany(companyId, queryDate, employeeId);
  }

  async getById(companyId: string, id: string) {
    const record = await attendanceRepo.findById(companyId, id);
    if (!record) throw new Error("Attendance record not found");
    return record;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async create(companyId: string, data: any) {
    // Validate that employee belongs to company
    const employee = await employeeRepo.findById(companyId, data.employeeId);
    if (!employee) throw new Error("Employee not found");

    // Check for existing record for this date/employee
    const existing = await attendanceRepo.findByDate(companyId, data.employeeId, data.date);
    if (existing) throw new Error("Attendance record already exists for this date");

    return attendanceRepo.create(companyId, data);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async update(companyId: string, id: string, data: any) {
    return attendanceRepo.update(id, data, companyId);
  }

  async delete(companyId: string, id: string) {
    return attendanceRepo.delete(companyId, id);
  }
}
