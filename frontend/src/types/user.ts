export type WorkDayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface WorkDaySchedule {
  enabled: boolean;
  start?: string;
  end?: string;
  breakStart?: string;
  breakEnd?: string;
}

export interface WorkSchedule {
  timezone?: string;
  graceMinutes?: number;
  days: Record<WorkDayKey, WorkDaySchedule>;
}

export interface User {
  id: string;
  // Campos de autenticación
  email: string; // Se usa como usuario
  password?: string; // Opcional porque no siempre la devolveremos
  
  // Datos personales
  firstName: string;
  lastName: string;
  birthDate: string; // Nuevo: Fecha de Nacimiento
  
  // Datos laborales
  businessName: string; // Nuevo: Razon Social
  workplace: string; // Nuevo: Lugar de Trabajo
  joinDate: string; // Fecha de Ingreso
  department: string; // Representa el Puesto de Trabajo (Job Title)
  workSchedule?: WorkSchedule;
  
  // Sistema
  role: 'admin' | 'employee' | 'superadmin';
  status: 'active' | 'inactive';
  avatar?: string;
}

export const MOCK_USERS: User[] = [
  {
    id: '1',
    firstName: 'Admin',
    lastName: 'Principal',
    email: 'admin@checkio.pe',
    role: 'admin',
    department: 'Gerente General',
    status: 'active',
    joinDate: '2024-01-01',
    birthDate: '1990-01-01',
    businessName: 'Checkio S.A.C.',
    workplace: 'Oficina Central'
  },
  {
    id: '2',
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan.perez@checkio.pe',
    role: 'employee',
    department: 'Supervisor de Operaciones',
    status: 'active',
    joinDate: '2024-02-15',
    birthDate: '1995-05-20',
    businessName: 'Checkio S.A.C.',
    workplace: 'Planta 1'
  },
  {
    id: '3',
    firstName: 'María',
    lastName: 'Gómez',
    email: 'maria.gomez@checkio.pe',
    role: 'employee',
    department: 'Analista de RRHH',
    status: 'active',
    joinDate: '2024-03-01',
    birthDate: '1992-11-10',
    businessName: 'Checkio S.A.C.',
    workplace: 'Oficina Central'
  },
  {
    id: '4',
    firstName: 'Carlos',
    lastName: 'Rodríguez',
    email: 'carlos.rodriguez@checkio.pe',
    role: 'employee',
    department: 'Desarrollador Senior',
    status: 'inactive',
    joinDate: '2024-01-20',
    birthDate: '1998-07-30',
    businessName: 'Checkio S.A.C.',
    workplace: 'Remoto'
  },
];
