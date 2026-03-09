export interface Company {
  id: string;
  name: string;
  maxEmployees: number;
  currentEmployees: number;
  status: 'active' | 'inactive' | 'suspended';
  suspendedAt?: string;
  createdAt: string;
}

export interface CreateCompanyData {
  name: string;
  maxEmployees: number;
  adminName: string;
  adminEmail: string;
  adminPassword?: string;
}

export interface CreateCompanyUser {
  companyId: string;
  name: string;
  email: string;
  password?: string;
}
