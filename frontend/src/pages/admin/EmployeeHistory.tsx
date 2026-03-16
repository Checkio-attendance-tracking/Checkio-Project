import { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowLeft, Calendar, MapPin, X, Pencil, Trash2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, getDay, parseISO, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { employeeService } from '../../services/employee';
import { attendanceService } from '../../services/attendance';
import type { User } from '../../types/user';
import type { AttendanceRecord } from '../../types/attendance';

// Lazy load the map component to prevent Leaflet initialization issues during startup
const AttendanceMap = lazy(() => import('../../components/AttendanceMap').then(module => ({ default: module.AttendanceMap })));

export function EmployeeHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [employee, setEmployee] = useState<User | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleExport = () => {
    const monthRecords = records.filter(r => {
      const recordDate = parseISO(r.date);
      return (
        recordDate.getMonth() === currentMonth.getMonth() &&
        recordDate.getFullYear() === currentMonth.getFullYear()
      );
    });

    if (monthRecords.length === 0) return;
    
    const escapeCsv = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`;
    const headers = ['Fecha', 'Estado', 'Ingreso', 'Inicio Almuerzo', 'Fin Almuerzo', 'Salida', 'Horas Trabajadas'];
    const csvContent = [
      headers.map(escapeCsv).join(','),
      ...monthRecords.map(r => ([
        r.date,
        r.status,
        r.checkIn || '',
        r.lunchStart || '',
        r.lunchEnd || '',
        r.checkOut || '',
        calculateHoursWorked(r)
      ]).map(escapeCsv).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `asistencia_${employee?.firstName || 'emp'}_${format(currentMonth, 'yyyy-MM')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatUserAgent = (ua?: string) => {
    if (!ua) return '-';
    const trimmed = ua.trim();
    if (trimmed.length <= 80) return trimmed;
    return `${trimmed.slice(0, 77)}...`;
  };

  const getMarkMetaRows = (record: AttendanceRecord) => ([
    { label: 'Ingreso', time: record.checkIn, meta: record.checkInMeta },
    { label: 'Inicio Almuerzo', time: record.lunchStart, meta: record.lunchStartMeta },
    { label: 'Fin Almuerzo', time: record.lunchEnd, meta: record.lunchEndMeta },
    { label: 'Salida', time: record.checkOut, meta: record.checkOutMeta },
  ]).filter(r => Boolean(r.time));

  const getDeviceChangeLabel = (record: AttendanceRecord) => {
    const metas = getMarkMetaRows(record).map(r => r.meta).filter(Boolean);
    const devices = Array.from(new Set(metas.map(m => m?.device).filter(Boolean))) as string[];
    const osList = Array.from(new Set(metas.map(m => m?.os).filter(Boolean))) as string[];
    if (devices.length > 1 || osList.length > 1) return 'Cambio detectado';
    if (devices.length === 1 || osList.length === 1) return 'Sin cambios';
    return 'Sin datos';
  };

  const handleUpdateRecord = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingRecord || !id) return;

    setIsUpdating(true);
    const formData = new FormData(e.currentTarget);
    
    const toPeruISOString = (dateStr: string, timeStr: string) => {
      if (!timeStr) return undefined;
      const [y, m, d] = dateStr.split('-').map(Number);
      const [hh, mm] = timeStr.split(':').map(Number);
      if (!y || !m || !d || Number.isNaN(hh) || Number.isNaN(mm)) return undefined;
      const utcMs = Date.UTC(y, m - 1, d, hh + 5, mm, 0, 0);
      return new Date(utcMs).toISOString();
    };

    const updateData = {
        checkIn: toPeruISOString(editingRecord.date, formData.get('checkIn') as string),
        lunchStart: toPeruISOString(editingRecord.date, formData.get('lunchStart') as string),
        lunchEnd: toPeruISOString(editingRecord.date, formData.get('lunchEnd') as string),
        checkOut: toPeruISOString(editingRecord.date, formData.get('checkOut') as string),
    };

    try {
        const updated = await attendanceService.update(editingRecord.id, updateData);
        setRecords(prev => prev.map(r => r.id === updated.id ? updated : r));
        setEditingRecord(null);
    } catch (error) {
        console.error("Error updating record:", error);
        alert("Error al actualizar el registro. Verifique la secuencia de horas.");
    } finally {
        setIsUpdating(false);
    }
  };

  const handleDeleteRecord = async () => {
    if (!editingRecord) return;

    const ok = window.confirm(`¿Eliminar la asistencia del ${editingRecord.date}? Esta acción no se puede deshacer.`);
    if (!ok) return;

    setIsDeleting(true);
    try {
      await attendanceService.delete(editingRecord.id);
      setRecords((prev) => prev.filter((r) => r.id !== editingRecord.id));
      setEditingRecord(null);
    } catch (error) {
      console.error('Error deleting record:', error);
      alert('Error al eliminar el registro.');
    } finally {
      setIsDeleting(false);
    }
  };

  const calculateHoursWorked = (record: AttendanceRecord | undefined): string => {
      if (!record || !record.checkIn || !record.checkOut) {
        return '-';
      }
    
      const parseTime = (timeStr: string) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
      };
    
      try {
        const start = parseTime(record.checkIn);
        let end = parseTime(record.checkOut);

        if (end < start) end += 24 * 60;

        let lunchMinutes = 0;
        if (record.lunchStart && record.lunchEnd) {
          let lunchS = parseTime(record.lunchStart);
          let lunchE = parseTime(record.lunchEnd);

          if (lunchS < start) lunchS += 24 * 60;
          if (lunchE < lunchS) lunchE += 24 * 60;

          const overlapStart = Math.max(start, lunchS);
          const overlapEnd = Math.min(end, lunchE);
          lunchMinutes = Math.max(0, overlapEnd - overlapStart);
        }
    
        const totalMinutes = (end - start) - lunchMinutes;
        
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
      case 'dayOff': return 'bg-gray-50 text-gray-400';
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
    <div className="space-y-6 pb-8 relative">
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
      </div>

      {/* Controles de Mes y Resumen */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-3">
                <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Calendar size={20} className="text-indigo-600" />
                    Calendario Mensual
                </h2>
                <div className="flex items-center bg-gray-50 rounded-lg p-1">
                    <button onClick={handlePrevMonth} className="p-1 hover:bg-white rounded shadow-sm transition-all text-gray-600">
                        <ChevronLeft size={20} />
                    </button>
                    <span className="px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-800 min-w-[96px] sm:min-w-[140px] text-center capitalize">
                        {format(currentMonth, 'MMMM yyyy', { locale: es })}
                    </span>
                    <button onClick={handleNextMonth} className="p-1 hover:bg-white rounded shadow-sm transition-all text-gray-600">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Grid del Calendario */}
            <div className="p-4 sm:p-6">
                <div className="sm:hidden">
                    <div className="divide-y divide-gray-100">
                        {daysInMonth.map((day) => {
                            const record = getRecordForDate(day);
                            const isToday = isSameDay(day, new Date());
                            const hasMap = Boolean(record && (record.latCheckIn || record.latCheckOut));
                            const dayLabel = format(day, "EEEE d 'de' MMMM", { locale: es });

                            return (
                                <div key={day.toISOString()} className="py-3">
                                    <div className="flex items-start gap-3">
                                        <div className="flex flex-col items-center pt-0.5">
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm ${
                                                isToday ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                                {format(day, 'd')}
                                            </div>
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <div className={`text-sm font-semibold truncate ${isToday ? 'text-indigo-700' : 'text-gray-900'}`}>
                                                        {dayLabel}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {record?.status === 'weekend'
                                                            ? 'Fin de semana'
                                                            : record?.status === 'dayOff'
                                                                ? 'Día libre'
                                                            : record?.status === 'absent'
                                                                ? 'Sin marcación'
                                                                : record
                                                                    ? 'Con marcación'
                                                                    : 'Sin datos'}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {record && record.status !== 'weekend' && record.status !== 'dayOff' && (
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${getStatusColor(record.status)}`}>
                                                            {record.status === 'present' ? 'Asistió' :
                                                             record.status === 'late' ? 'Tardanza' :
                                                             record.status === 'absent' ? 'Falta' : record.status}
                                                        </span>
                                                    )}
                                                    {record && record.status !== 'weekend' && record.status !== 'dayOff' && (
                                                        <button
                                                            onClick={() => setEditingRecord(record)}
                                                            className="p-2 -mr-2 text-gray-500 hover:text-indigo-600"
                                                            title="Editar asistencia"
                                                        >
                                                            <Pencil size={18} />
                                                        </button>
                                                    )}
                                                    {record && record.status !== 'weekend' && record.status !== 'dayOff' && hasMap && (
                                                        <button
                                                            onClick={() => setSelectedRecord(record)}
                                                            className="p-2 -mr-2 text-gray-500 hover:text-indigo-600"
                                                            title="Ver ubicación"
                                                        >
                                                            <MapPin size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {record && record.status !== 'weekend' && record.status !== 'dayOff' && record.status !== 'absent' ? (
                                                <div className="mt-2 grid grid-cols-3 gap-2">
                                                    <div className="bg-gray-50 rounded-lg px-2 py-1.5">
                                                        <div className="text-[10px] text-gray-500">In</div>
                                                        <div className="text-xs font-semibold text-gray-800">{record.checkIn || '--:--'}</div>
                                                    </div>
                                                    <div className="bg-gray-50 rounded-lg px-2 py-1.5">
                                                        <div className="text-[10px] text-gray-500">Out</div>
                                                        <div className="text-xs font-semibold text-gray-800">{record.checkOut || '--:--'}</div>
                                                    </div>
                                                    <div className="bg-indigo-50 rounded-lg px-2 py-1.5">
                                                        <div className="text-[10px] text-indigo-700">Total</div>
                                                        <div className="text-xs font-bold text-indigo-700">{calculateHoursWorked(record)}</div>
                                                    </div>
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="hidden sm:block overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                  <div className="min-w-[720px] sm:min-w-0">
                    <div className="grid grid-cols-7 gap-px mb-2">
                      {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
                          <div key={d} className="text-center text-xs sm:text-sm font-medium text-gray-500 py-1 sm:py-2">
                              {d}
                          </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {Array.from({ length: emptyDays }).map((_, i) => (
                          <div key={`empty-${i}`} className="h-24 sm:h-32 bg-gray-50/50 rounded-lg border border-transparent" />
                      ))}

                      {daysInMonth.map(day => {
                          const record = getRecordForDate(day);
                          const isToday = isSameDay(day, new Date());
                          
                          return (
                              <div 
                                  key={day.toISOString()}
                                  className={`h-24 sm:h-32 p-1.5 sm:p-2 rounded-lg border flex flex-col justify-between transition-all hover:shadow-md ${
                                      isToday ? 'border-indigo-500 ring-1 ring-indigo-500 bg-white' : 'border-gray-100 bg-white'
                                  }`}
                              >
                                  <div className="flex justify-between items-start">
                                      <span className={`text-xs sm:text-sm font-medium w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full ${
                                          isToday ? 'bg-indigo-600 text-white' : 'text-gray-700'
                                      }`}>
                                          {format(day, 'd')}
                                      </span>
                                      {record && record.status !== 'weekend' && record.status !== 'dayOff' && (
                                          <div className="flex items-center gap-1">
                                              <button 
                                                  onClick={() => setEditingRecord(record)}
                                                  className="hidden sm:inline-flex text-gray-400 hover:text-indigo-600 transition-colors p-1"
                                                  title="Editar asistencia"
                                              >
                                                  <Pencil size={14} />
                                              </button>
                                              {(record.latCheckIn || record.latCheckOut) && (
                                                  <button 
                                                      onClick={() => setSelectedRecord(record)}
                                                      className="hidden sm:inline-flex text-gray-400 hover:text-indigo-600 transition-colors"
                                                      title="Ver ubicación"
                                                  >
                                                      <MapPin size={14} />
                                                  </button>
                                              )}
                                              <span className={`hidden sm:inline-flex text-[10px] px-1.5 py-0.5 rounded font-medium capitalize ${getStatusColor(record.status)}`}>
                                                  {record.status === 'present' ? 'Asistió' : 
                                                   record.status === 'late' ? 'Tardanza' :
                                                   record.status === 'absent' ? 'Falta' :
                                                   record.status === 'vacation' ? 'Vacaciones' :
                                                   record.status === 'pending' ? 'Pendiente' :
                                                   record.status}
                                              </span>
                                          </div>
                                      )}
                                  </div>

                                  {record && record.status !== 'weekend' && record.status !== 'dayOff' && record.status !== 'absent' ? (
                                      <div className="space-y-1 mt-1">
                                          <div className="text-[10px] sm:text-xs text-gray-500 flex justify-between">
                                              <span>In:</span> <span className="font-medium text-gray-700">{record.checkIn}</span>
                                          </div>
                                          <div className="text-[10px] sm:text-xs text-gray-500 flex justify-between">
                                              <span>Out:</span> <span className="font-medium text-gray-700">{record.checkOut}</span>
                                          </div>
                                          <div className="mt-1 pt-1 border-t border-gray-50 flex justify-between items-center">
                                              <span className="text-[10px] text-gray-400">Total</span>
                                              <span className="text-[11px] sm:text-xs font-bold text-indigo-600">{calculateHoursWorked(record)}</span>
                                          </div>
                                      </div>
                                  ) : record?.status === 'weekend' ? (
                                      <div className="flex-1 flex items-center justify-center">
                                          <span className="text-[10px] sm:text-xs text-gray-300 italic">Fin de semana</span>
                                      </div>
                                  ) : record?.status === 'dayOff' ? (
                                      <div className="flex-1 flex items-center justify-center">
                                          <span className="text-[10px] sm:text-xs text-gray-300 italic">Día libre</span>
                                      </div>
                                  ) : null}
                              </div>
                          );
                      })}
                    </div>
                  </div>
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
                    Descarga el reporte completo de asistencias de este mes en formato CSV.
                </p>
                <button 
                    onClick={handleExport}
                    disabled={currentMonthRecords.length === 0}
                    className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    Descargar Reporte CSV
                </button>
            </div>
        </div>
      </div>

      {/* Modal de Mapa */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Ubicación de Marcaciones</h3>
                        <p className="text-sm text-gray-500">{format(parseISO(selectedRecord.date), "EEEE d 'de' MMMM, yyyy", { locale: es })}</p>
                    </div>
                    <button 
                        onClick={() => setSelectedRecord(null)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
                    >
                        <X size={24} />
                    </button>
                </div>
                <div className="p-4 bg-gray-50">
                    <Suspense fallback={<div className="h-[400px] w-full flex items-center justify-center bg-gray-100 rounded-lg">Cargando mapa...</div>}>
                        <AttendanceMap record={selectedRecord} />
                    </Suspense>
                </div>
                <div className="p-4 border-t border-gray-100 bg-white">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">Dispositivo / IP por marcación</h4>
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                            {getDeviceChangeLabel(selectedRecord)}
                        </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {getMarkMetaRows(selectedRecord).map((row) => (
                            <div key={row.label} className="border border-gray-200 rounded-lg p-3">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm font-semibold text-gray-900">{row.label}</div>
                                    <div className="text-sm font-mono text-gray-700">{row.time}</div>
                                </div>
                                <div className="mt-2 text-xs text-gray-600 space-y-1">
                                    <div className="flex justify-between gap-3">
                                        <span className="text-gray-500">Dispositivo</span>
                                        <span className="font-medium text-gray-800">{row.meta?.device || '-'}</span>
                                    </div>
                                    <div className="flex justify-between gap-3">
                                        <span className="text-gray-500">Sistema</span>
                                        <span className="font-medium text-gray-800">{row.meta?.os || '-'}</span>
                                    </div>
                                    <div className="flex justify-between gap-3">
                                        <span className="text-gray-500">IP</span>
                                        <span className="font-medium text-gray-800">{row.meta?.ipAddress || '-'}</span>
                                    </div>
                                    <div className="pt-1">
                                        <div className="text-gray-500">User-Agent</div>
                                        <div className="text-gray-800 break-words">{formatUserAgent(row.meta?.userAgent)}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="p-4 border-t border-gray-100 flex justify-end">
                    <button 
                        onClick={() => setSelectedRecord(null)}
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Modal de Edición */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Editar Asistencia - {editingRecord.date}</h3>
                    <button onClick={() => setEditingRecord(null)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><X size={20} /></button>
                </div>
                <form onSubmit={handleUpdateRecord} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ingreso</label>
                            <input type="time" name="checkIn" defaultValue={editingRecord.checkIn} className="w-full border border-gray-300 rounded-lg p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Inicio Almuerzo</label>
                            <input type="time" name="lunchStart" defaultValue={editingRecord.lunchStart} className="w-full border border-gray-300 rounded-lg p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fin Almuerzo</label>
                            <input type="time" name="lunchEnd" defaultValue={editingRecord.lunchEnd} className="w-full border border-gray-300 rounded-lg p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Salida</label>
                            <input type="time" name="checkOut" defaultValue={editingRecord.checkOut} className="w-full border border-gray-300 rounded-lg p-2" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
                        <button
                          type="button"
                          onClick={handleDeleteRecord}
                          disabled={isUpdating || isDeleting}
                          className="mr-auto inline-flex items-center gap-2 px-4 py-2 text-red-700 hover:bg-red-50 rounded-lg border border-red-200 disabled:opacity-50"
                        >
                          <Trash2 size={16} />
                          {isDeleting ? 'Eliminando...' : 'Eliminar'}
                        </button>
                        <button type="button" onClick={() => setEditingRecord(null)} disabled={isUpdating || isDeleting} className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-300 disabled:opacity-50">Cancelar</button>
                        <button type="submit" disabled={isUpdating || isDeleting} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-white disabled:opacity-50">
                            {isUpdating ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}
