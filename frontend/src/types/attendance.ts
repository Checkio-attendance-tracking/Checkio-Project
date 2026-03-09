export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  checkIn?: string; // HH:mm
  latCheckIn?: number;
  lngCheckIn?: number;
  lunchStart?: string; // HH:mm
  latLunchStart?: number;
  lngLunchStart?: number;
  lunchEnd?: string; // HH:mm
  latLunchEnd?: number;
  lngLunchEnd?: number;
  checkOut?: string; // HH:mm
  latCheckOut?: number;
  lngCheckOut?: number;
  status: 'present' | 'absent' | 'late' | 'vacation' | 'weekend';
}

export const MOCK_ATTENDANCE: AttendanceRecord[] = [
  // Se generarán dinámicamente en el componente para efectos de demostración
];
