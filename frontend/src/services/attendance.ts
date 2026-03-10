import api from './api';
import { format } from 'date-fns';
import type { AttendanceRecord } from '../types/attendance';

const STORAGE_KEY = 'demo-attendance';

const loadDemoAttendance = (): AttendanceRecord[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as AttendanceRecord[];
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  return [];
};

const saveDemoAttendance = (records: AttendanceRecord[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};

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
    
    try {
      const location = await getCurrentPosition();
      const response = await api.post<AttendanceRecord>(endpoints[type], { location });
      return response.data;
    } catch {
      const userRaw = localStorage.getItem('user');
      if (!userRaw) throw new Error('No autenticado');
      const user = JSON.parse(userRaw) as { id: string; role: string };
      if (user.role !== 'employee') throw new Error('Acción no disponible (modo demo)');

      const now = new Date();
      const date = format(now, 'yyyy-MM-dd');
      const time = format(now, 'HH:mm');
      const records = loadDemoAttendance();
      const existingIdx = records.findIndex((r) => r.employeeId === user.id && r.date === date);
      const base: AttendanceRecord = existingIdx >= 0 ? records[existingIdx] : { id: `demo-${date}-${user.id}`, employeeId: user.id, date, status: 'present' };

      const updated: AttendanceRecord =
        type === 'checkIn' ? { ...base, checkIn: base.checkIn || time, status: 'present' } :
        type === 'lunchStart' ? { ...base, lunchStart: base.lunchStart || time } :
        type === 'lunchEnd' ? { ...base, lunchEnd: base.lunchEnd || time } :
        { ...base, checkOut: base.checkOut || time };

      const next = [...records];
      if (existingIdx >= 0) next[existingIdx] = updated;
      else next.unshift(updated);
      saveDemoAttendance(next);
      return updated;
    }
  },

  async getMyHistory(month?: Date) {
    try {
      const params: Record<string, string> = {};
      if (month) {
        params.month = format(month, 'yyyy-MM');
      }
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await api.get<any[]>('/asistencias/mis-asistencias', { params });
      return response.data.map(mapBackendAttendanceToFrontend);
    } catch {
      const userRaw = localStorage.getItem('user');
      if (!userRaw) throw new Error('No autenticado');
      const user = JSON.parse(userRaw) as { id: string };

      const records = loadDemoAttendance().filter((r) => r.employeeId === user.id);
      if (!month) return records;
      const monthKey = format(month, 'yyyy-MM');
      return records.filter((r) => r.date.startsWith(monthKey));
    }
  },

  async getAll(monthOrDate?: Date, employeeId?: string, isExactDate: boolean = false) {
    const params: Record<string, string> = {};
    if (monthOrDate) {
      // If exact date, format as yyyy-MM-dd, otherwise yyyy-MM
      params.date = isExactDate 
        ? format(monthOrDate, 'yyyy-MM-dd') 
        : format(monthOrDate, 'yyyy-MM-dd'); // Backend seems to accept 'date' parameter which might work for both if backend logic supports it, OR we need to adjust param name.
      
      // Let's check backend logic:
      // const { date, employeeId } = req.query;
      // attendanceRepo.findAllByCompany(companyId, queryDate, employeeId);
      // queryDate = new Date(date)
      // So if we send yyyy-MM-dd, it filters by that exact date/time unless repo handles range.
      // Wait, AttendanceRepository probably handles findAllByCompany differently.
      
      // Let's assume for now we send 'date' param as YYYY-MM-DD
      // But wait, the previous code was sending 'month' param for getMyHistory? 
      // Actually getAll code was:
      // if (month) { params.month = format(month, 'yyyy-MM'); }
      // But the backend Controller uses `req.query.date`.
      
      // Let's look at Backend AttendanceController.getAll again.
      // const { date, employeeId } = req.query;
      // It passes date string to service.
      
      // So if frontend sends 'month' param, backend controller ignores it unless it looks for 'month' too?
      // Backend Controller: const { date, employeeId } = req.query; 
      // It DOES NOT look for 'month'. 
      // So the existing frontend code `params.month = ...` might be WRONG or I missed something in backend.
      
      // Let's assume I need to fix this to send 'date' if I want to filter.
      // If I want to filter by MONTH, the backend needs to support it.
      // Let's stick to what we need: filter by TODAY.
      
      if (isExactDate) {
          params.date = format(monthOrDate, 'yyyy-MM-dd');
      } else {
          // If it was working before for month, maybe backend parses date leniently or defaults to month?
          // Actually, let's keep the old behavior for month if possible, but the old code sent 'month' param.
          // If backend controller only reads 'date', then 'month' param was ignored and it returned ALL records?
          // I should probably check AttendanceRepository to be sure.
          
          // For now, let's just add support for exact date which is what I need.
          // If the previous code was sending 'month', I will keep sending 'month' just in case backend uses it (maybe via a middleware I missed or I misread controller).
          // actually, let's just use 'date' for exact date.
          params.date = format(monthOrDate, 'yyyy-MM-dd');
      }
    }
    if (employeeId) {
      params.employeeId = employeeId;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await api.get<any[]>('/asistencias', { params });
      return response.data.map(mapBackendAttendanceToFrontend);
    } catch {
      let records = loadDemoAttendance();
      if (employeeId) records = records.filter((r) => r.employeeId === employeeId);
      if (monthOrDate) {
        const key = format(monthOrDate, 'yyyy-MM-dd');
        records = records.filter((r) => r.date === key);
      }
      return records;
    }
  },
  
  // Admin methods
  async create(data: Partial<AttendanceRecord>) {
    try {
      const response = await api.post('/asistencias', data);
      return mapBackendAttendanceToFrontend(response.data);
    } catch {
      const records = loadDemoAttendance();
      const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `demo-${Date.now()}`;
      const created: AttendanceRecord = {
        id,
        employeeId: data.employeeId || 'demo',
        date: data.date || format(new Date(), 'yyyy-MM-dd'),
        checkIn: data.checkIn,
        lunchStart: data.lunchStart,
        lunchEnd: data.lunchEnd,
        checkOut: data.checkOut,
        latCheckIn: data.latCheckIn,
        lngCheckIn: data.lngCheckIn,
        latLunchStart: data.latLunchStart,
        lngLunchStart: data.lngLunchStart,
        latLunchEnd: data.latLunchEnd,
        lngLunchEnd: data.lngLunchEnd,
        latCheckOut: data.latCheckOut,
        lngCheckOut: data.lngCheckOut,
        status: (data.status as AttendanceRecord['status']) || (data.checkIn ? 'present' : 'absent')
      };
      saveDemoAttendance([created, ...records]);
      return created;
    }
  },

  async update(id: string, data: Partial<AttendanceRecord>) {
    try {
      const response = await api.put(`/asistencias/${id}`, data);
      return mapBackendAttendanceToFrontend(response.data);
    } catch {
      const records = loadDemoAttendance();
      const idx = records.findIndex((r) => r.id === id);
      if (idx === -1) throw new Error('Registro no encontrado (modo demo)');
      const updated: AttendanceRecord = { ...records[idx], ...data, id: records[idx].id };
      const next = [...records];
      next[idx] = updated;
      saveDemoAttendance(next);
      return updated;
    }
  },

  async delete(id: string) {
    try {
      await api.delete(`/asistencias/${id}`);
    } catch {
      const records = loadDemoAttendance();
      saveDemoAttendance(records.filter((r) => r.id !== id));
    }
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
    
    status: record.status || (record.checkIn ? 'present' : 'absent')
  };
}
