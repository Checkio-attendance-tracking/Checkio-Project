import api from './api';
import type { User } from '../types/user';

export const employeeService = {
  async getAll(): Promise<User[]> {
    const response = await api.get('/empleados');
    return response.data.map(mapBackendEmployeeToFrontend);
  },

  async create(data: Omit<User, 'id' | 'role' | 'businessName' | 'status'>): Promise<User> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await api.post<any>('/empleados', data);
    return mapBackendEmployeeToFrontend(response.data);
  },

  async update(id: string, data: Partial<User>): Promise<User> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await api.put<any>(`/empleados/${id}`, data);
    return mapBackendEmployeeToFrontend(response.data);
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/empleados/${id}`);
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
  };
}
