import api from './api';
import { format } from 'date-fns';
import type { AttendanceRecord } from '../types/attendance';

type LatLng = { lat: number; lng: number };

const getCurrentPosition = (): Promise<LatLng | undefined> =>
  new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(undefined);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
      () => resolve(undefined),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  });

export const attendanceService = {
  async mark(
    type: 'checkIn' | 'lunchStart' | 'lunchEnd' | 'checkOut',
    locationOverride?: LatLng
  ) {
    const endpoints = {
      checkIn: '/asistencias/ingreso',
      lunchStart: '/asistencias/salida-almuerzo',
      lunchEnd: '/asistencias/regreso-almuerzo',
      checkOut: '/asistencias/salida-final'
    };

    const location = locationOverride ?? (await getCurrentPosition());
    const response = await api.post<AttendanceRecord>(endpoints[type], { location });
    return response.data;
  },

  async getMyHistory(month?: Date) {
    const params: Record<string, string> = {};
    if (month) {
      params.month = format(month, 'yyyy-MM');
    }

    const response = await api.get<unknown[]>('/asistencias/mis-asistencias', { params });
    return response.data.map(mapBackendAttendanceToFrontend);
  },

  async getAll(monthOrDate?: Date, employeeId?: string, isExactDate: boolean = false) {
    const params: Record<string, string> = {};
    if (monthOrDate) {
      if (isExactDate) {
        params.date = format(monthOrDate, 'yyyy-MM-dd');
      }
    }
    if (employeeId) {
      params.employeeId = employeeId;
    }

    const response = await api.get<unknown[]>('/asistencias', { params });
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

type BackendAttendanceRecord = {
  id: string;
  employeeId: string;
  date: string;
  checkIn?: string | null;
  latCheckIn?: number | null;
  lngCheckIn?: number | null;
  lunchStart?: string | null;
  latLunchStart?: number | null;
  lngLunchStart?: number | null;
  lunchEnd?: string | null;
  latLunchEnd?: number | null;
  lngLunchEnd?: number | null;
  checkOut?: string | null;
  latCheckOut?: number | null;
  lngCheckOut?: number | null;
  status?: AttendanceRecord['status'] | null;
};

function formatPeruTimeFromIso(isoString?: string | null) {
  if (!isoString) return undefined;
  const d = new Date(isoString);
  const utcMinutes = d.getUTCHours() * 60 + d.getUTCMinutes();
  let peruMinutes = utcMinutes - 5 * 60;
  peruMinutes = ((peruMinutes % (24 * 60)) + (24 * 60)) % (24 * 60);
  const hh = String(Math.floor(peruMinutes / 60)).padStart(2, '0');
  const mm = String(peruMinutes % 60).padStart(2, '0');
  return `${hh}:${mm}`;
}

function mapBackendAttendanceToFrontend(record: unknown): AttendanceRecord {
  const r = record as BackendAttendanceRecord;

  return {
    id: r.id,
    employeeId: r.employeeId,
    date: r.date.split('T')[0],
    
    checkIn: formatPeruTimeFromIso(r.checkIn),
    latCheckIn: r.latCheckIn ?? undefined,
    lngCheckIn: r.lngCheckIn ?? undefined,
    
    lunchStart: formatPeruTimeFromIso(r.lunchStart),
    latLunchStart: r.latLunchStart ?? undefined,
    lngLunchStart: r.lngLunchStart ?? undefined,
    
    lunchEnd: formatPeruTimeFromIso(r.lunchEnd),
    latLunchEnd: r.latLunchEnd ?? undefined,
    lngLunchEnd: r.lngLunchEnd ?? undefined,
    
    checkOut: formatPeruTimeFromIso(r.checkOut),
    latCheckOut: r.latCheckOut ?? undefined,
    lngCheckOut: r.lngCheckOut ?? undefined,
    
    status: r.status || (r.checkIn ? 'present' : 'absent')
  };
}
