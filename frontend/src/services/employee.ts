import api from './api';
import type { User } from '../types/user';
import { MOCK_USERS } from '../types/user';

const STORAGE_KEY = 'demo-employees';

const loadDemoEmployees = (): User[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as User[];
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_USERS));
  return MOCK_USERS;
};

const saveDemoEmployees = (employees: User[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
};

export const employeeService = {
  async getAll(): Promise<User[]> {
    try {
      const response = await api.get('/empleados');
      return response.data.map(mapBackendEmployeeToFrontend);
    } catch {
      return loadDemoEmployees();
    }
  },

  async create(data: Omit<User, 'id' | 'role' | 'businessName' | 'status'>): Promise<User> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await api.post<any>('/empleados', data);
      return mapBackendEmployeeToFrontend(response.data);
    } catch {
      const employees = loadDemoEmployees();
      const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `demo-${Date.now()}`;
      const created: User = {
        id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: 'employee',
        department: data.department,
        businessName: (data as Partial<User>).businessName || 'Checkio S.A.C.',
        workplace: (data as Partial<User>).workplace || 'Oficina Central',
        status: 'active',
        joinDate: (data as Partial<User>).joinDate || new Date().toISOString(),
        birthDate: (data as Partial<User>).birthDate || new Date().toISOString(),
        workSchedule: (data as Partial<User>).workSchedule,
      };

      saveDemoEmployees([created, ...employees]);
      return created;
    }
  },

  async update(id: string, data: Partial<User>): Promise<User> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await api.put<any>(`/empleados/${id}`, data);
      return mapBackendEmployeeToFrontend(response.data);
    } catch {
      const employees = loadDemoEmployees();
      const idx = employees.findIndex((e) => e.id === id);
      if (idx === -1) {
        throw new Error('Empleado no encontrado (modo demo)');
      }
      const updated: User = { ...employees[idx], ...data, id: employees[idx].id };
      const next = [...employees];
      next[idx] = updated;
      saveDemoEmployees(next);
      return updated;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await api.delete(`/empleados/${id}`);
    } catch {
      const employees = loadDemoEmployees();
      saveDemoEmployees(employees.filter((e) => e.id !== id));
    }
  }
};

function mapBackendEmployeeToFrontend(backendEmployee: any): User { // eslint-disable-line @typescript-eslint/no-explicit-any
  return {
    id: backendEmployee.id,
    email: backendEmployee.email,
    firstName: backendEmployee.firstName,
    lastName: backendEmployee.lastName,
    role: 'employee',
    department: backendEmployee.department,
    businessName: backendEmployee.businessName || 'Checkio S.A.C.',
    workplace: backendEmployee.workplace || 'Oficina Central',
    status: backendEmployee.status,
    joinDate: backendEmployee.joinDate,
    birthDate: backendEmployee.birthDate,
    workSchedule: backendEmployee.workSchedule,
  };
}
