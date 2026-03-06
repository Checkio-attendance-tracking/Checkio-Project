import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowLeft, Calendar, Download } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, getDay, parseISO, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { employeeService } from '../../services/employee';
import { attendanceService } from '../../services/attendance';
import type { User } from '../../types/user';
import type { AttendanceRecord } from '../../types/attendance';

export function EmployeeHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [employee, setEmployee] = useState<User | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load employee details
      const employees = await employeeService.getAll();
      const foundEmployee = employees.find(u => u.id === id);
      setEmployee(foundEmployee || null);

      // Load attendance records
      if (id) {
        const attendanceData = await attendanceService.getAll(undefined, id);
        setRecords(attendanceData);
      }
    } catch (error) {
      console.error('Error loading history data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const daysInMonth = useMemo(() => {
    return eachDayOfInterval({
      start: startOfMonth(currentMonth),
      end: endOfMonth(currentMonth)
    });
  }, [currentMonth]);

  const getRecordForDate = (date: Date) => {
    // Try exact string match first
    const dateStr = format(date, 'yyyy-MM-dd');
    let found = records.find(r => r.date === dateStr);
    
    // Fallback: Parse date to handle potential format differences
    if (!found) {
      found = records.find(r => {
        // Handle if r.date is full ISO or just date
        const rDate = parseISO(r.date); 
        return isSameDay(rDate, date);
      });
    }
    return found;
  };

  // Calcular espacios vacíos al inicio del mes para el grid
  const startDayOfWeek = getDay(startOfMonth(currentMonth)); // 0 = Domingo, 1 = Lunes...
  // Ajustar para que la semana empiece en Lunes (1)
  const emptyDays = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  const handlePrevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));

  const calculateHoursWorked = (record: AttendanceRecord | undefined): string => {
      if (!record || !record.checkIn || !record.checkOut || !record.lunchStart || !record.lunchEnd) {
        return '-';
      }
    
      const parseTime = (timeStr: string) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
      };
    
      try {
        const start = parseTime(record.checkIn);
        const lunchS = parseTime(record.lunchStart);
        const lunchE = parseTime(record.lunchEnd);
        const end = parseTime(record.checkOut);
    
        const totalMinutes = (lunchS - start) + (end - lunchE);
        
        if (totalMinutes < 0) return '-';
  
        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;
    
        return `${h}h ${m}m`;
      } catch {
        return '-';
      }
    };

  const getStatusColor = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-700';
      case 'late': return 'bg-yellow-100 text-yellow-700';
      case 'absent': return 'bg-red-100 text-red-700';
      case 'vacation': return 'bg-blue-100 text-blue-700';
      case 'weekend': return 'bg-gray-50 text-gray-400';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  // Filter records for current month for stats
  const currentMonthRecords = useMemo(() => {
    return records.filter(r => {
      const recordDate = parseISO(r.date);
      return (
        recordDate.getMonth() === currentMonth.getMonth() &&
        recordDate.getFullYear() === currentMonth.getFullYear()
      );
    });
  }, [records, currentMonth]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Cargando historial...</div>;
  }

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-500">
        <h2 className="text-xl font-semibold mb-2">Empleado no encontrado</h2>
        <button 
          onClick={() => navigate('/admin/employees')}
          className="text-indigo-600 hover:underline flex items-center gap-2"
        >
          <ArrowLeft size={20} />
          Volver a la lista
        </button>
      </div>
    );
  }

  // Resumen del mes
  const stats = {
    present: currentMonthRecords.filter(r => r.status === 'present').length,
    late: currentMonthRecords.filter(r => r.status === 'late').length,
    absent: currentMonthRecords.filter(r => r.status === 'absent').length,
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/employees')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Historial de Asistencia</h1>
            <p className="text-gray-500 text-sm">
              {employee.firstName} {employee.lastName} - {employee.department}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                <Download size={16} />
                Exportar
            </button>
        </div>
      </div>

      {/* Controles de Mes y Resumen */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Calendar size={20} className="text-indigo-600" />
                    Calendario Mensual
                </h2>
                <div className="flex items-center bg-gray-50 rounded-lg p-1">
                    <button onClick={handlePrevMonth} className="p-1 hover:bg-white rounded shadow-sm transition-all text-gray-600">
                        <ChevronLeft size={20} />
                    </button>
                    <span className="px-4 text-sm font-medium text-gray-800 min-w-[140px] text-center capitalize">
                        {format(currentMonth, 'MMMM yyyy', { locale: es })}
                    </span>
                    <button onClick={handleNextMonth} className="p-1 hover:bg-white rounded shadow-sm transition-all text-gray-600">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Grid del Calendario */}
              <div className="p-6">
                  <div className="grid grid-cols-7 gap-px mb-2">
                      {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
                          <div key={d} className="text-center text-sm font-medium text-gray-500 py-2">
                              {d}
                          </div>
                      ))}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                      {/* Espacios vacíos */}
                      {Array.from({ length: emptyDays }).map((_, i) => (
                          <div key={`empty-${i}`} className="h-32 bg-gray-50/50 rounded-lg border border-transparent" />
                      ))}
                      
                      {/* Días */}
                      {daysInMonth.map(day => {
                          const record = getRecordForDate(day);
                          const isToday = isSameDay(day, new Date());
                          
                          return (
                              <div 
                                  key={day.toISOString()}
                                className={`h-32 p-2 rounded-lg border flex flex-col justify-between transition-all hover:shadow-md ${
                                    isToday ? 'border-indigo-500 ring-1 ring-indigo-500 bg-white' : 'border-gray-100 bg-white'
                                }`}
                            >
                                <div className="flex justify-between items-start">
                                    <span className={`text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                                        isToday ? 'bg-indigo-600 text-white' : 'text-gray-700'
                                    }`}>
                                        {format(day, 'd')}
                                    </span>
                                    {record && record.status !== 'weekend' && (
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium capitalize ${getStatusColor(record.status)}`}>
                                            {record.status === 'present' ? 'Asistió' : 
                                             record.status === 'late' ? 'Tardanza' :
                                             record.status === 'absent' ? 'Falta' : record.status}
                                        </span>
                                    )}
                                </div>

                                {record && record.status !== 'weekend' && record.status !== 'absent' ? (
                                    <div className="space-y-1 mt-1">
                                        <div className="text-xs text-gray-500 flex justify-between">
                                            <span>In:</span> <span className="font-medium text-gray-700">{record.checkIn}</span>
                                        </div>
                                        <div className="text-xs text-gray-500 flex justify-between">
                                            <span>Out:</span> <span className="font-medium text-gray-700">{record.checkOut}</span>
                                        </div>
                                        <div className="mt-1 pt-1 border-t border-gray-50 flex justify-between items-center">
                                            <span className="text-[10px] text-gray-400">Total</span>
                                            <span className="text-xs font-bold text-indigo-600">{calculateHoursWorked(record)}</span>
                                        </div>
                                    </div>
                                ) : record?.status === 'weekend' ? (
                                    <div className="flex-1 flex items-center justify-center">
                                        <span className="text-xs text-gray-300 italic">Fin de semana</span>
                                    </div>
                                ) : null}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>

        {/* Panel Lateral de Resumen */}
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-4">Resumen Mensual</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <span className="text-sm font-medium text-gray-700">Asistencias</span>
                        </div>
                        <span className="text-lg font-bold text-green-700">{stats.present}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-yellow-500" />
                            <span className="text-sm font-medium text-gray-700">Tardanzas</span>
                        </div>
                        <span className="text-lg font-bold text-yellow-700">{stats.late}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                            <span className="text-sm font-medium text-gray-700">Faltas</span>
                        </div>
                        <span className="text-lg font-bold text-red-700">{stats.absent}</span>
                    </div>
                </div>
            </div>

            <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                <h3 className="font-semibold text-indigo-900 mb-2">Reporte Detallado</h3>
                <p className="text-sm text-indigo-700 mb-4">
                    Descarga el reporte completo de asistencias de este mes en formato PDF o Excel.
                </p>
                <button className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
                    Descargar Reporte
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}