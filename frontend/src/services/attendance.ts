import api from './api';
import { format } from 'date-fns';
import type { AttendanceRecord } from '../types/attendance';

export const attendanceService = {
  async mark(type: 'checkIn' | 'lunchStart' | 'lunchEnd' | 'checkOut') {
    const endpoints = {
      checkIn: '/asistencias/ingreso',
      lunchStart: '/asistencias/salida-almuerzo',
      lunchEnd: '/asistencias/regreso-almuerzo',
      checkOut: '/asistencias/salida-final'
    };
    
    const response = await api.post<AttendanceRecord>(endpoints[type], {});
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
    // console.log('AttendanceService getAll response:', response.data);
    const mapped = response.data.map(mapBackendAttendanceToFrontend);
    // console.log('AttendanceService getAll mapped:', mapped);
    return mapped;
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
    lunchStart: formatTime(record.lunchStart),
    lunchEnd: formatTime(record.lunchEnd),
    checkOut: formatTime(record.checkOut),
    status: record.checkIn ? 'present' : 'absent' // Simplistic status
  };
}
