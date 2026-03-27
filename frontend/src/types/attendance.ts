export type AttendanceMarkMeta = {
  ipAddress?: string;
  userAgent?: string;
  device?: string;
  os?: string;
};

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  checkIn?: string; // HH:mm
  latCheckIn?: number;
  lngCheckIn?: number;
  checkInMeta?: AttendanceMarkMeta;
  lunchStart?: string; // HH:mm
  latLunchStart?: number;
  lngLunchStart?: number;
  lunchStartMeta?: AttendanceMarkMeta;
  lunchEnd?: string; // HH:mm
  latLunchEnd?: number;
  lngLunchEnd?: number;
  lunchEndMeta?: AttendanceMarkMeta;
  checkOut?: string; // HH:mm
  latCheckOut?: number;
  lngCheckOut?: number;
  checkOutMeta?: AttendanceMarkMeta;
  overtimeMinutes?: number;
  status: 'present' | 'absent' | 'late' | 'vacation' | 'weekend' | 'dayOff' | 'pending';
}

export const MOCK_ATTENDANCE: AttendanceRecord[] = [
  // Se generarán dinámicamente en el componente para efectos de demostración
];
