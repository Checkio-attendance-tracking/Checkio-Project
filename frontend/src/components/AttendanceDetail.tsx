import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Coffee, LogIn, LogOut, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfWeek, addDays, subWeeks, addWeeks, isSameDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { AttendanceRecord } from '../types/attendance';
import { attendanceService } from '../services/attendance';
import type { WorkDayKey, WorkSchedule } from '../types/user';

interface AttendanceDetailProps {
  employeeId: string;
  workSchedule?: WorkSchedule;
}

export function AttendanceDetail({ employeeId, workSchedule }: AttendanceDetailProps) {
  const navigate = useNavigate();
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadAttendance = async () => {
      setLoading(true);
      try {
        const allRecords = await attendanceService.getAll(undefined, employeeId);
        setRecords(allRecords);
      } catch (error) {
        console.error('Error loading attendance:', error);
      } finally {
        setLoading(false);
      }
    };
    loadAttendance();
  }, [employeeId]);
  
  const handlePrevWeek = () => setCurrentWeekStart(prev => subWeeks(prev, 1));
  const handleNextWeek = () => setCurrentWeekStart(prev => addWeeks(prev, 1));

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  const fallbackDayKey = (date: Date): WorkDayKey => {
    const map: Record<number, WorkDayKey> = { 0: 'sun', 1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri', 6: 'sat' };
    return map[date.getDay()] ?? 'mon';
  };

  const getWorkDayKey = (date: Date): WorkDayKey => {
    const timeZone = workSchedule?.timezone || 'America/Lima';
    const weekday = new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'short' }).format(date);

    const map: Record<string, WorkDayKey> = {
      Mon: 'mon',
      Tue: 'tue',
      Wed: 'wed',
      Thu: 'thu',
      Fri: 'fri',
      Sat: 'sat',
      Sun: 'sun'
    };

    return map[weekday] ?? fallbackDayKey(date);
  };

  const isOffDay = (date: Date) => {
    if (!workSchedule) {
      return date.getDay() === 0 || date.getDay() === 6;
    }
    const key = getWorkDayKey(date);
    return !workSchedule.days[key]?.enabled;
  };

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-700 border-green-200';
      case 'late': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'absent': return 'bg-red-100 text-red-700 border-red-200';
      case 'vacation': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'weekend': return 'bg-gray-50 text-gray-400 border-gray-100';
      case 'pending': return 'bg-gray-50 text-gray-400 border-dashed border-gray-200';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'present': return 'Asistió';
      case 'late': return 'Tardanza';
      case 'absent': return 'Falta';
      case 'vacation': return 'Vacaciones';
      case 'weekend': return 'Fin de Semana';
      case 'pending': return 'Pendiente';
      default: return '-';
    }
  };

  const calculateHoursWorked = (record: AttendanceRecord | undefined): string => {
    if (!record || !record.checkIn || !record.checkOut || !record.lunchStart || !record.lunchEnd) {
      return '0h 0m';
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
  
      // Morning shift: Start -> LunchStart
      const morningMinutes = lunchS - start;
      // Afternoon shift: LunchEnd -> End
      const afternoonMinutes = end - lunchE;
  
      const totalMinutes = morningMinutes + afternoonMinutes;
      
      if (totalMinutes < 0) return '0h 0m'; // Error case

      const h = Math.floor(totalMinutes / 60);
      const m = totalMinutes % 60;
  
      return `${h}h ${m}m`;
    } catch {
      return '0h 0m';
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 animate-fade-in border border-indigo-100 shadow-inner bg-indigo-50/30">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <CalendarIcon className="mr-2 text-indigo-600" size={20} />
          Historial de Asistencia
        </h3>
        
        <div className="flex items-center space-x-2 bg-white rounded-lg shadow-sm p-1 border border-gray-200">
          <button 
            onClick={handlePrevWeek}
            className="p-1 hover:bg-gray-100 rounded text-gray-600 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-medium px-2 text-gray-600 min-w-[140px] text-center">
            {format(currentWeekStart, "d 'de' MMMM", { locale: es })} - {format(addDays(currentWeekStart, 6), "d 'de' MMMM", { locale: es })}
          </span>
          <button 
            onClick={handleNextWeek}
            className="p-1 hover:bg-gray-100 rounded text-gray-600 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => {
          const record = getRecordForDate(day);
          const isToday = isSameDay(day, new Date());
          const offDay = isOffDay(day);
          const status = record?.status || (offDay ? 'weekend' : 'absent');
          
          // Only show absent if date is in the past
          const isPast = day < new Date();
          const displayStatus = (!record && !isPast && !offDay) ? 'pending' : status;

          return (
            <div 
              key={day.toISOString()} 
              className={`
                rounded-lg border p-3 transition-all
                ${isToday ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}
                ${getStatusColor(displayStatus as string)}
              `}
            >
              <div className="text-center mb-2 pb-2 border-b border-gray-200/50">
                <div className="text-xs font-medium uppercase tracking-wider opacity-75">
                  {format(day, 'EEE', { locale: es })}
                </div>
                <div className="text-lg font-bold">
                  {format(day, 'd')}
                </div>
              </div>
              
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 flex items-center" title="Ingreso">
                    <LogIn size={12} className="mr-1" /> In
                  </span>
                  <span className="font-mono font-medium">{record?.checkIn || '--:--'}</span>
                </div>
                
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 flex items-center" title="Almuerzo">
                    <Coffee size={12} className="mr-1" /> Lun
                  </span>
                  <span className="font-mono font-medium">
                    {record?.lunchStart ? `${record.lunchStart}-${record.lunchEnd || '??'}` : '--:--'}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 flex items-center" title="Salida">
                    <LogOut size={12} className="mr-1" /> Out
                  </span>
                  <span className="font-mono font-medium">{record?.checkOut || '--:--'}</span>
                </div>
              </div>
              
              <div className="mt-2 pt-2 border-t border-gray-200/50 flex justify-between items-center">
                <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-white/50`}>
                  {getStatusLabel(displayStatus as string)}
                </span>
                <span className="text-[10px] font-mono text-gray-500" title="Horas trabajadas">
                  {calculateHoursWorked(record)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <div className="text-xs text-gray-400">
           {loading ? 'Cargando...' : `Registros encontrados: ${records.length}`}
        </div>
        <button 
          onClick={() => navigate(`/admin/employees/${employeeId}/history`)}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium hover:underline flex items-center"
        >
          Ver historial completo <ChevronRight size={16} className="ml-1" />
        </button>
      </div>
    </div>
  );
}
