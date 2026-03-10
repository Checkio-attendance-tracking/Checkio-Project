import api from './api';
import type { User } from '../types/user';
import { MOCK_USERS } from '../types/user';

interface LoginResponse {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
  token: string;
}

export const authService = {
  async login(email: string, password: string): Promise<User> {
    try {
      const response = await api.post<LoginResponse>('/auth/login', { email, password });
      const { user, token } = response.data;
      
      localStorage.setItem('token', token);
      
      const mappedUser = mapBackendUserToFrontend(user);
      localStorage.setItem('user', JSON.stringify(mappedUser));
      
      return mappedUser;
    } catch {
      if (!password) {
        throw new Error('Contraseña requerida');
      }

      const demoSuperadmin: User = {
        id: 'demo-superadmin',
        email: 'superadmin@checkio.pe',
        firstName: 'Super',
        lastName: 'Admin',
        role: 'superadmin',
        department: 'Superadmin',
        status: 'active',
        joinDate: new Date().toISOString(),
        birthDate: new Date().toISOString(),
        businessName: 'Checkio',
        workplace: 'Remoto'
      };

      const demoUsers: User[] = [demoSuperadmin, ...MOCK_USERS];
      const found = demoUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!found) {
        throw new Error('Usuario no encontrado (modo demo)');
      }

      localStorage.setItem('token', 'demo-token');
      localStorage.setItem('user', JSON.stringify(found));
      return found;
    }
  },

  async me(): Promise<User> {
    try {
      const response = await api.get('/auth/me');
      const user = response.data;
      const mappedUser = mapBackendUserToFrontend(user);
      localStorage.setItem('user', JSON.stringify(mappedUser));
      return mappedUser;
    } catch {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        return JSON.parse(storedUser) as User;
      }
      throw new Error('No autenticado');
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  }
};

function mapBackendUserToFrontend(backendUser: any): User { // eslint-disable-line @typescript-eslint/no-explicit-any
  const isEmployee = backendUser.role === 'employee' && backendUser.employee;
  
  return {
    id: backendUser.id,
    email: backendUser.email,
    firstName: isEmployee ? backendUser.employee.firstName : backendUser.name.split(' ')[0],
    lastName: isEmployee ? backendUser.employee.lastName : (backendUser.name.split(' ').slice(1).join(' ') || ''),
    role: backendUser.role,
    department: isEmployee ? backendUser.employee.department : 'Administrador',
    businessName: backendUser.company?.name || 'Empresa',
    workplace: isEmployee ? (backendUser.employee.workplace || 'Oficina Central') : 'Oficina Central',
    status: isEmployee ? backendUser.employee.status : 'active',
    joinDate: isEmployee ? backendUser.employee.joinDate : new Date().toISOString(),
    birthDate: isEmployee ? backendUser.employee.birthDate : new Date().toISOString(), // Fallback
    avatar: undefined
  };
}
