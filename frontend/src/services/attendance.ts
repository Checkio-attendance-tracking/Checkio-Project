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
  }
};

type BackendAttendanceRecord = {
  id: string;
  employeeId: string;
  date: string;
  checkIn?: string | null;
  latCheckIn?: number | null;
  lngCheckIn?: number | null;
  ipCheckIn?: string | null;
  userAgentCheckIn?: string | null;
  deviceCheckIn?: string | null;
  osCheckIn?: string | null;
  lunchStart?: string | null;
  latLunchStart?: number | null;
  lngLunchStart?: number | null;
  ipLunchStart?: string | null;
  userAgentLunchStart?: string | null;
  deviceLunchStart?: string | null;
  osLunchStart?: string | null;
  lunchEnd?: string | null;
  latLunchEnd?: number | null;
  lngLunchEnd?: number | null;
  ipLunchEnd?: string | null;
  userAgentLunchEnd?: string | null;
  deviceLunchEnd?: string | null;
  osLunchEnd?: string | null;
  checkOut?: string | null;
  latCheckOut?: number | null;
  lngCheckOut?: number | null;
  ipCheckOut?: string | null;
  userAgentCheckOut?: string | null;
  deviceCheckOut?: string | null;
  osCheckOut?: string | null;
  status?: AttendanceRecord['status'] | null;
  overtimeMinutes?: number | null;
};

function formatPeruTimeFromIso(isoString?: string | null) {
  if (!isoString) return undefined;
  const normalized =
    isoString.includes('T') && !/[zZ]$/.test(isoString) && !/[+-]\d{2}:\d{2}$/.test(isoString)
      ? `${isoString}-05:00`
      : isoString;
  const d = new Date(normalized);
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
    checkInMeta: r.checkIn ? {
      ipAddress: r.ipCheckIn ?? undefined,
      userAgent: r.userAgentCheckIn ?? undefined,
      device: r.deviceCheckIn ?? undefined,
      os: r.osCheckIn ?? undefined
    } : undefined,
    
    lunchStart: formatPeruTimeFromIso(r.lunchStart),
    latLunchStart: r.latLunchStart ?? undefined,
    lngLunchStart: r.lngLunchStart ?? undefined,
    lunchStartMeta: r.lunchStart ? {
      ipAddress: r.ipLunchStart ?? undefined,
      userAgent: r.userAgentLunchStart ?? undefined,
      device: r.deviceLunchStart ?? undefined,
      os: r.osLunchStart ?? undefined
    } : undefined,
    
    lunchEnd: formatPeruTimeFromIso(r.lunchEnd),
    latLunchEnd: r.latLunchEnd ?? undefined,
    lngLunchEnd: r.lngLunchEnd ?? undefined,
    lunchEndMeta: r.lunchEnd ? {
      ipAddress: r.ipLunchEnd ?? undefined,
      userAgent: r.userAgentLunchEnd ?? undefined,
      device: r.deviceLunchEnd ?? undefined,
      os: r.osLunchEnd ?? undefined
    } : undefined,
    
    checkOut: formatPeruTimeFromIso(r.checkOut),
    latCheckOut: r.latCheckOut ?? undefined,
    lngCheckOut: r.lngCheckOut ?? undefined,
    checkOutMeta: r.checkOut ? {
      ipAddress: r.ipCheckOut ?? undefined,
      userAgent: r.userAgentCheckOut ?? undefined,
      device: r.deviceCheckOut ?? undefined,
      os: r.osCheckOut ?? undefined
    } : undefined,
    
    overtimeMinutes: r.overtimeMinutes ?? undefined,
    status: r.status || (r.checkIn ? 'present' : 'absent')
  };
}
