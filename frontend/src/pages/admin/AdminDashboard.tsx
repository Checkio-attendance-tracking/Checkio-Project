import { useState, useEffect } from 'react';
import { Users, UserCheck, Clock, UserX, Calendar, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { employeeService } from '../../services/employee';
import { attendanceService } from '../../services/attendance';
import type { User } from '../../types/user';
import type { AttendanceRecord } from '../../types/attendance';

export function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    present: 0,
    onLunch: 0,
    absent: 0
  });
  const [todaysAttendance, setTodaysAttendance] = useState<(AttendanceRecord & { employeeName: string, department: string })[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const today = new Date();
      
      // Load all employees to calculate totals and map names
      const employees = await employeeService.getAll();
      
      // Load today's attendance
      const attendance = await attendanceService.getAll(today, undefined, true);
      
      // Map attendance with employee details
      const enrichedAttendance = attendance.map(record => {
        const emp = employees.find(e => e.id === record.employeeId);
        return {
          ...record,
          employeeName: emp ? `${emp.firstName} ${emp.lastName}` : 'Desconocido',
          department: emp ? emp.department : '-'
        };
      });

      // Calculate stats
      const totalEmployees = employees.filter(e => e.status === 'active').length;
      const present = enrichedAttendance.filter(r => r.checkIn).length;
      const onLunch = enrichedAttendance.filter(r => r.lunchStart && !r.lunchEnd).length;
      // Absent is effectively those who haven't checked in yet OR are absent
      const absent = totalEmployees - present;

      setStats({
        totalEmployees,
        present,
        onLunch,
        absent
      });

      setTodaysAttendance(enrichedAttendance);

    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Cargando dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard RRHH</h1>
          <p className="text-gray-500 text-sm mt-1">Resumen de actividad para hoy, {format(new Date(), "d 'de' MMMM, yyyy", { locale: es })}</p>
        </div>
        <div className="flex items-center gap-2">
            <button 
                onClick={loadDashboardData} 
                disabled={loading}
                className="p-2 bg-white text-gray-500 hover:text-indigo-600 rounded-lg border border-gray-200 shadow-sm transition-colors disabled:opacity-50"
                title="Actualizar datos"
            >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm text-sm font-medium text-gray-600">
                <Calendar size={18} className="text-indigo-500" />
                {format(new Date(), "EEEE", { locale: es })}
            </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
            title="Total Personal" 
            value={stats.totalEmployees} 
            icon={<Users size={24} className="text-blue-600" />} 
            bg="bg-blue-50" 
            textColor="text-blue-900"
        />
        <StatCard 
            title="Presentes Hoy" 
            value={stats.present} 
            icon={<UserCheck size={24} className="text-green-600" />} 
            bg="bg-green-50" 
            textColor="text-green-900"
        />
        <StatCard 
            title="En Almuerzo" 
            value={stats.onLunch} 
            icon={<Clock size={24} className="text-orange-600" />} 
            bg="bg-orange-50" 
            textColor="text-orange-900"
        />
        <StatCard 
            title="Pendientes / Ausentes" 
            value={stats.absent} 
            icon={<UserX size={24} className="text-red-600" />} 
            bg="bg-red-50" 
            textColor="text-red-900"
        />
      </div>

      {/* Today's Activity Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Asistencia en Tiempo Real</h2>
            <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                {todaysAttendance.length} registros
            </span>
        </div>
        
        {todaysAttendance.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
                No hay registros de asistencia para el día de hoy.
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold">
                            <th className="px-6 py-4">Empleado</th>
                            <th className="px-6 py-4">Departamento</th>
                            <th className="px-6 py-4">Ingreso</th>
                            <th className="px-6 py-4">Estado Actual</th>
                            <th className="px-6 py-4 text-right">Salida</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {todaysAttendance.map((record) => (
                            <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    {record.employeeName}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {record.department}
                                </td>
                                <td className="px-6 py-4 font-mono text-sm text-gray-700">
                                    {record.checkIn || '--:--'}
                                </td>
                                <td className="px-6 py-4">
                                    <StatusBadge record={record} />
                                </td>
                                <td className="px-6 py-4 text-right font-mono text-sm text-gray-700">
                                    {record.checkOut || '--:--'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, bg, textColor }: { title: string, value: number, icon: React.ReactNode, bg: string, textColor: string }) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between transition-all hover:shadow-md">
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                <h3 className={`text-3xl font-bold ${textColor}`}>{value}</h3>
            </div>
            <div className={`p-3 rounded-lg ${bg}`}>
                {icon}
            </div>
        </div>
    );
}

function StatusBadge({ record }: { record: AttendanceRecord }) {
    if (record.checkOut) {
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Finalizado</span>;
    }
    if (record.lunchStart && !record.lunchEnd) {
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">En Almuerzo</span>;
    }
    if (record.checkIn) {
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Trabajando</span>;
    }
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Ausente</span>;
}
