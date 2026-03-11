import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, User, Mail, Lock, Calendar, Building, MapPin, Briefcase, Eye, EyeOff } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { employeeService } from '../../services/employee';
import type { WorkDayKey, WorkSchedule } from '../../types/user';

const getDefaultWorkSchedule = (): WorkSchedule => ({
  timezone: 'America/Lima',
  graceMinutes: 5,
  days: {
    mon: { enabled: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
    tue: { enabled: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
    wed: { enabled: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
    thu: { enabled: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
    fri: { enabled: true, start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
    sat: { enabled: false },
    sun: { enabled: false },
  },
});

const dayLabels: Record<WorkDayKey, string> = {
  mon: 'Lun',
  tue: 'Mar',
  wed: 'Mié',
  thu: 'Jue',
  fri: 'Vie',
  sat: 'Sáb',
  sun: 'Dom',
};

export function CreateEmployee() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    birthDate: '',
    businessName: '',
    workplace: '',
    joinDate: '',
    department: '',
    role: 'employee' as 'employee' | 'admin',
    workSchedule: getDefaultWorkSchedule(),
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isEditing && id) {
      loadEmployee();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, id]);

  const loadEmployee = async () => {
    try {
      const users = await employeeService.getAll();
      const user = users.find(u => u.id === id);
      if (user) {
        setFormData({
          email: user.email,
          password: '',
          firstName: user.firstName,
          lastName: user.lastName,
          birthDate: user.birthDate || '',
          businessName: user.businessName || '',
          workplace: user.workplace || '',
          joinDate: user.joinDate,
          department: user.department,
          role: user.role as 'admin' | 'employee',
          workSchedule: user.workSchedule || getDefaultWorkSchedule(),
        });
      }
    } catch (error) {
      console.error('Error loading employee:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const updateSchedule = (patch: Partial<WorkSchedule>) => {
    setFormData((prev) => ({
      ...prev,
      workSchedule: {
        ...prev.workSchedule,
        ...patch,
        days: {
          ...prev.workSchedule.days,
          ...(patch.days || {})
        }
      }
    }));
  };

  const updateScheduleDay = (day: WorkDayKey, patch: Partial<WorkSchedule['days'][WorkDayKey]>) => {
    setFormData((prev) => ({
      ...prev,
      workSchedule: {
        ...prev.workSchedule,
        days: {
          ...prev.workSchedule.days,
          [day]: {
            ...prev.workSchedule.days[day],
            ...patch
          }
        }
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && id) {
        // Only send password if it's not empty
        const dataToUpdate = { ...formData };
        if (!dataToUpdate.password) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          delete (dataToUpdate as any).password;
        }
        await employeeService.update(id, dataToUpdate);
        alert('Empleado actualizado exitosamente');
      } else {
        if (!formData.password) {
          alert('La contraseña es obligatoria para nuevos empleados');
          return;
        }
        await employeeService.create(formData);
        alert('Empleado registrado exitosamente');
      }
      navigate('/admin/employees');
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error(error);
      alert(error.response?.data?.message || 'Error al guardar empleado');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center space-x-4 mb-6">
        <button 
          onClick={() => navigate('/admin/employees')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEditing ? 'Editar Empleado' : 'Registrar Nuevo Empleado'}</h1>
          <p className="text-gray-500 text-sm">{isEditing ? 'Modifique la información del personal' : 'Complete la información para dar de alta al personal'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 md:p-8 space-y-8">
          
          {/* Sección 1: Datos de Acceso */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="bg-indigo-100 text-indigo-600 p-1.5 rounded-lg mr-2">
                <Lock size={18} />
              </span>
              Credenciales de Acceso
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">Correo Electrónico (Usuario)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    placeholder="ejemplo@checkio.pe"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">Contraseña {isEditing && <span className="text-gray-400 font-normal">(Dejar en blanco para mantener)</span>}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required={!isEditing}
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100"></div>

          {/* Sección 2: Datos Personales */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="bg-blue-100 text-blue-600 p-1.5 rounded-lg mr-2">
                <User size={18} />
              </span>
              Información Personal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">Nombres</label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="Juan"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">Apellidos</label>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="Pérez"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">Fecha de Nacimiento</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="date"
                    name="birthDate"
                    required
                    value={formData.birthDate}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100"></div>

          {/* Sección 3: Datos Laborales */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="bg-green-100 text-green-600 p-1.5 rounded-lg mr-2">
                <Briefcase size={18} />
              </span>
              Información Laboral
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">Razón Social</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    name="businessName"
                    required
                    value={formData.businessName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    placeholder="Empresa S.A.C."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">Lugar de Trabajo</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    name="workplace"
                    required
                    value={formData.workplace}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    placeholder="Sede Principal"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">Fecha de Ingreso</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="date"
                    name="joinDate"
                    required
                    value={formData.joinDate}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">Puesto de Trabajo</label>
                <input
                  type="text"
                  name="department"
                  required
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="Ej. Gerente de Ventas"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100"></div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Horario y Días de Trabajo
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">Zona Horaria</label>
                <input
                  type="text"
                  value={formData.workSchedule.timezone || ''}
                  onChange={(e) => updateSchedule({ timezone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  placeholder="America/Lima"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">Tolerancia (min)</label>
                <input
                  type="number"
                  min={0}
                  max={240}
                  value={formData.workSchedule.graceMinutes ?? 0}
                  onChange={(e) => updateSchedule({ graceMinutes: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left px-4 py-3">Día</th>
                    <th className="text-left px-4 py-3">Trabaja</th>
                    <th className="text-left px-4 py-3">Inicio</th>
                    <th className="text-left px-4 py-3">Fin</th>
                    <th className="text-left px-4 py-3">Almuerzo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(Object.keys(dayLabels) as WorkDayKey[]).map((day) => {
                    const d = formData.workSchedule.days[day];
                    return (
                      <tr key={day} className="bg-white">
                        <td className="px-4 py-3 font-medium text-gray-800">{dayLabels[day]}</td>
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={d.enabled}
                            onChange={(e) => updateScheduleDay(day, { enabled: e.target.checked })}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="time"
                            disabled={!d.enabled}
                            value={d.start || ''}
                            onChange={(e) => updateScheduleDay(day, { start: e.target.value })}
                            className="px-2 py-1 border border-gray-200 rounded-md disabled:bg-gray-100"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="time"
                            disabled={!d.enabled}
                            value={d.end || ''}
                            onChange={(e) => updateScheduleDay(day, { end: e.target.value })}
                            className="px-2 py-1 border border-gray-200 rounded-md disabled:bg-gray-100"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <input
                              type="time"
                              disabled={!d.enabled}
                              value={d.breakStart || ''}
                              onChange={(e) => updateScheduleDay(day, { breakStart: e.target.value })}
                              className="px-2 py-1 border border-gray-200 rounded-md disabled:bg-gray-100"
                            />
                            <span className="text-gray-400">-</span>
                            <input
                              type="time"
                              disabled={!d.enabled}
                              value={d.breakEnd || ''}
                              onChange={(e) => updateScheduleDay(day, { breakEnd: e.target.value })}
                              className="px-2 py-1 border border-gray-200 rounded-md disabled:bg-gray-100"
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/admin/employees')}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm flex items-center space-x-2 transition-colors"
          >
            <Save size={18} />
            <span>{isEditing ? 'Actualizar Empleado' : 'Guardar Empleado'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
