export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  checkIn?: string; // HH:mm
  lunchStart?: string; // HH:mm
  lunchEnd?: string; // HH:mm
  checkOut?: string; // HH:mm
  status: 'present' | 'absent' | 'late' | 'vacation' | 'weekend';
}

export const MOCK_ATTENDANCE: AttendanceRecord[] = [
  // Se generarán dinámicamente en el componente para efectos de demostración
];
