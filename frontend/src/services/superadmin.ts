import api from './api';
import type { Company, CreateCompanyData, CreateCompanyUser } from '../types/company';

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
  }
};
