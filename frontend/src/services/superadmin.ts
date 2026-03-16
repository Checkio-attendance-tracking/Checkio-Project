import api from './api';
import type { Company, CreateCompanyData, CreateCompanyUser } from '../types/company';

export type CompanyUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export type ImportEmployeeRow = {
  email: string;
  firstName: string;
  lastName: string;
  department: string;
  joinDate: string;
  birthDate?: string;
  businessName?: string;
  workplace?: string;
  password?: string;
  workSchedule?: unknown;
};

export type ImportEmployeesResult = {
  companyId: string;
  createdCount: number;
  skippedCount: number;
  created: Array<{ employeeId: string; email: string }>;
  skipped: Array<{ index: number; email?: string; reason: string }>;
};

export const superAdminService = {
  getCompanies: async (): Promise<Company[]> => {
    const { data } = await api.get<Company[]>('/superadmin/empresas');
    return data;
  },

  getCompany: async (id: string): Promise<Company> => {
    const { data } = await api.get<Company>(`/superadmin/empresas/${id}`);
    return data;
  },

  createCompany: async (data: CreateCompanyData): Promise<Company> => {
    const { data: result } = await api.post('/superadmin/empresas', data);
    return result.company;
  },

  updateCompany: async (id: string, data: Partial<Company>): Promise<Company> => {
    const { data: result } = await api.put(`/superadmin/empresas/${id}`, data);
    return result;
  },

  createCompanyUser: async (companyId: string, data: CreateCompanyUser): Promise<void> => {
    await api.post(`/superadmin/empresas/${companyId}/crear-rrhh`, data);
  },

  listCompanyUsers: async (companyId: string): Promise<CompanyUser[]> => {
    const { data } = await api.get<CompanyUser[]>(`/superadmin/empresas/${companyId}/usuarios`);
    return data;
  },

  resetCompanyUserPassword: async (companyId: string, userId: string, password: string): Promise<void> => {
    await api.post(`/superadmin/empresas/${companyId}/usuarios/${userId}/reset-password`, { password });
  },

  importEmployees: async (companyId: string, employees: ImportEmployeeRow[]): Promise<ImportEmployeesResult> => {
    const { data } = await api.post<ImportEmployeesResult>(`/superadmin/empresas/${companyId}/import-empleados`, { employees });
    return data;
  },
};
