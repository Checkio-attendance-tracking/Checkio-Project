import api from './api';
import { format } from 'date-fns';
import type { AttendanceRecord } from '../types/attendance';

const getCurrentPosition = (): Promise<{lat: number, lng: number} | undefined> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported by this browser.");
      resolve(undefined);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        console.error("Error getting location:", error);
        // If location is mandatory for geofencing, the backend will reject it.
        // We resolve undefined here so the request proceeds.
        resolve(undefined);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  });
};

export const attendanceService = {
  async mark(type: 'checkIn' | 'lunchStart' | 'lunchEnd' | 'checkOut') {
    const endpoints = {
      checkIn: '/asistencias/ingreso',
      lunchStart: '/asistencias/salida-almuerzo',
      lunchEnd: '/asistencias/regreso-almuerzo',
      checkOut: '/asistencias/salida-final'
    };
    
    const location = await getCurrentPosition();
    const response = await api.post<AttendanceRecord>(endpoints[type], { location });
    return response.data;
  },

  async getMyHistory(month?: Date) {
    const params: Record<string, string> = {};
    if (month) {
      params.month = format(month, 'yyyy-MM');
    }
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await api.get<any[]>('/asistencias/mias', { params });
    return response.data.map(mapBackendAttendanceToFrontend);
  },

  async getAll(month?: Date, employeeId?: string) {
    const params: Record<string, string> = {};
    if (month) {
      params.month = format(month, 'yyyy-MM');
    }
    if (employeeId) {
      params.employeeId = employeeId;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await api.get<any[]>('/asistencias', { params });
    return response.data.map(mapBackendAttendanceToFrontend);
  },
  
  // Admin methods
  async create(data: Partial<AttendanceRecord>) {
    const response = await api.post('/asistencias', data);
    return mapBackendAttendanceToFrontend(response.data);
  },

  async update(id: string, data: Partial<AttendanceRecord>) {
    const response = await api.put(`/asistencias/${id}`, data);
    return mapBackendAttendanceToFrontend(response.data);
  },

  async delete(id: string) {
    await api.delete(`/asistencias/${id}`);
  }
};

function mapBackendAttendanceToFrontend(record: any): AttendanceRecord { // eslint-disable-line @typescript-eslint/no-explicit-any
  const formatTime = (isoString?: string) => 
    isoString ? format(new Date(isoString), 'HH:mm') : undefined;

  return {
    id: record.id,
    employeeId: record.employeeId,
    date: record.date.split('T')[0],
    
    checkIn: formatTime(record.checkIn),
    latCheckIn: record.latCheckIn,
    lngCheckIn: record.lngCheckIn,
    
    lunchStart: formatTime(record.lunchStart),
    latLunchStart: record.latLunchStart,
    lngLunchStart: record.lngLunchStart,
    
    lunchEnd: formatTime(record.lunchEnd),
    latLunchEnd: record.latLunchEnd,
    lngLunchEnd: record.lngLunchEnd,
    
    checkOut: formatTime(record.checkOut),
    latCheckOut: record.latCheckOut,
    lngCheckOut: record.lngCheckOut,
    
    status: record.checkIn ? 'present' : 'absent' // Simplistic status
  };
}
