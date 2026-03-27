import { useEffect, useMemo, useState, Suspense, lazy } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, MapPin, X, ArrowLeft, Menu, ClipboardList, LogOut, CheckCircle2, AlertTriangle } from 'lucide-react';
import { addMonths, eachDayOfInterval, endOfMonth, format, isSameDay, startOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { useLocation, useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { attendanceService } from '../services/attendance';
import { authService } from '../services/auth';
import { workScheduleChangeService } from '../services/workScheduleChange';
import type { AttendanceRecord } from '../types/attendance';
import type { AttendanceCorrectionMarkType, AttendanceCorrectionRequest } from '../types/workScheduleChange';

const AttendanceMap = lazy(() => import('../components/AttendanceMap').then(m => ({ default: m.AttendanceMap })));

export function MyHistory() {
  const navigate = useNavigate();
  const location = useLocation();
  const tabParam = useMemo(() => new URLSearchParams(location.search).get('tab'), [location.search]);
  const activeTab: 'historial' | 'solicitudes' = tabParam === 'solicitudes' ? 'solicitudes' : 'historial';
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [correctionOpen, setCorrectionOpen] = useState<{ record: AttendanceRecord } | null>(null);
  const [correctionMark, setCorrectionMark] = useState<AttendanceCorrectionMarkType>("checkIn");
  const [correctionTime, setCorrectionTime] = useState<string>("");
  const [correctionReason, setCorrectionReason] = useState<string>("");
  const [isSubmittingCorrection, setIsSubmittingCorrection] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [myRequests, setMyRequests] = useState<AttendanceCorrectionRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [toast, setToast] = useState<{ kind: "success" | "warning" | "error"; title: string; message?: string } | null>(null);
  const daysInMonth = useMemo(() => eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) }), [currentMonth]);

  const normalizeDate = (isoOrDate?: string | null) => {
    if (!isoOrDate) return undefined;
    return isoOrDate.includes("T") ? isoOrDate.split("T")[0] : isoOrDate;
  };

  const reloadHistory = async (month: Date) => {
    const data = await attendanceService.getMyHistory(month);
    setRecords(data);
  };

  const reloadMyRequests = async (showLoading: boolean) => {
    if (showLoading) setIsLoadingRequests(true);
    try {
      const data = await workScheduleChangeService.listMine();
      setMyRequests(data);
    } finally {
      if (showLoading) setIsLoadingRequests(false);
    }
  };

  useEffect(() => {
    if (activeTab !== 'historial') return;
    reloadHistory(currentMonth);
  }, [currentMonth, activeTab]);

  useEffect(() => {
    void reloadMyRequests(activeTab === 'solicitudes');
  }, [activeTab]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(t);
  }, [toast]);

  const handlePrevMonth = () => setCurrentMonth((d) => addMonths(d, -1));
  const handleNextMonth = () => setCurrentMonth((d) => addMonths(d, 1));

  const getRecordForDate = (day: Date) => {
    const key = format(day, 'yyyy-MM-dd');
    return records.find(r => r.date === key);
  };

  const parseDateForDisplay = (value: string) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(`${value}T00:00:00`);
    return new Date(value);
  };

  const calculateHoursWorked = (record: AttendanceRecord | undefined): string => {
    if (!record || !record.checkIn || !record.checkOut) return '-';
    const parseTime = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
    try {
      const start = parseTime(record.checkIn);
      let end = parseTime(record.checkOut);
      if (end < start) end += 24 * 60;
      let lunch = 0;
      if (record.lunchStart && record.lunchEnd) {
        let ls = parseTime(record.lunchStart);
        let le = parseTime(record.lunchEnd);
        if (ls < start) ls += 24 * 60;
        if (le < ls) le += 24 * 60;
        const s = Math.max(start, ls);
        const e = Math.min(end, le);
        lunch = Math.max(0, e - s);
      }
      const total = (end - start) - lunch;
      if (total < 0) return '-';
      const h = Math.floor(total / 60);
      const m = total % 60;
      return `${h}h ${m}m`;
    } catch {
      return '-';
    }
  };

  const getStatusColor = (status: AttendanceRecord['status']) => {
    if (status === 'present') return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    if (status === 'late') return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
    if (status === 'absent') return 'bg-red-50 text-red-700 border border-red-200';
    if (status === 'weekend' || status === 'dayOff') return 'bg-gray-50 text-gray-500 border border-gray-200';
    return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
  };

  const getAvailableMarks = (record: AttendanceRecord) => {
    const all = [
      { key: "checkIn" as const, label: "Ingreso", time: record.checkIn },
      { key: "lunchStart" as const, label: "Inicio almuerzo", time: record.lunchStart },
      { key: "lunchEnd" as const, label: "Fin almuerzo", time: record.lunchEnd },
      { key: "checkOut" as const, label: "Salida", time: record.checkOut },
    ];
    return all.filter((m) => Boolean(m.time));
  };

  const openCorrection = (record: AttendanceRecord) => {
    const marks = getAvailableMarks(record);
    if (marks.length === 0) return;
    setCorrectionOpen({ record });
    setCorrectionMark(marks[0]!.key);
    setCorrectionTime(marks[0]!.time || "");
    setCorrectionReason("");
  };

  const closeCorrection = () => {
    if (isSubmittingCorrection) return;
    setCorrectionOpen(null);
    setCorrectionReason("");
    setCorrectionTime("");
    setCorrectionMark("checkIn");
  };

  const hasPendingDuplicate = (date: string, mark: AttendanceCorrectionMarkType) => {
    const key = date;
    return myRequests.some((r) => r.status === "pending" && normalizeDate(r.attendance?.date) === key && r.markType === mark);
  };

  const submitCorrection = async () => {
    if (!correctionOpen) return;
    if (isSubmittingCorrection) return;
    const reason = correctionReason.trim();
    if (reason.length < 3) return;
    if (!correctionTime) return;

    const targetDate = correctionOpen.record.date;
    const willOverwrite = hasPendingDuplicate(targetDate, correctionMark);

    setIsSubmittingCorrection(true);
    try {
      await workScheduleChangeService.create({
        date: targetDate,
        markType: correctionMark,
        requestedTime: correctionTime,
        reason,
      });
      closeCorrection();
      await reloadMyRequests(activeTab === 'solicitudes');
      if (activeTab === 'historial') await reloadHistory(currentMonth);
      setToast(
        willOverwrite
          ? {
              kind: "warning",
              title: "Solicitud actualizada",
              message: "Ya tenías una solicitud pendiente. Se reemplazó por la última enviada.",
            }
          : {
              kind: "success",
              title: "Solicitud enviada",
              message: "RRHH revisará tu solicitud. Puedes ver el estado en “Solicitudes”.",
            }
      );
    } catch (e) {
      console.error(e);
      setToast({
        kind: "error",
        title: "No se pudo enviar",
        message: "Verifica tu conexión e inténtalo nuevamente.",
      });
    } finally {
      setIsSubmittingCorrection(false);
    }
  };

  const goTab = (tab: 'historial' | 'solicitudes') => {
    setMobileMenuOpen(false);
    if (tab === 'historial') navigate('/dashboard/history');
    else navigate('/dashboard/history?tab=solicitudes');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-between gap-3 sm:justify-start min-w-0">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => navigate("/dashboard")}
                className="inline-flex p-2 -ml-2 text-gray-500 hover:text-indigo-600 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 items-center gap-2"
                title="Volver al inicio"
              >
                <ArrowLeft size={18} />
                <span className="hidden sm:inline text-sm font-medium">Inicio</span>
              </button>

              <div className="flex items-center gap-3 min-w-0">
                <Logo size={28} />
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-2xl font-bold text-gray-900 leading-tight">
                    {activeTab === 'solicitudes' ? 'Mis Solicitudes' : 'Mi Historial de Asistencias'}
                  </h1>
                  <p className="text-gray-500 text-sm flex items-center gap-2">
                    <CalendarIcon className="text-indigo-600" size={16} />
                    {activeTab === 'solicitudes' ? 'Revisa el estado de tus solicitudes' : 'Consulta tus marcaciones mensuales'}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setMobileMenuOpen(true)}
              className="sm:hidden p-2 text-gray-500 hover:text-indigo-600 hover:bg-white rounded-lg border border-transparent hover:border-gray-200"
              title="Menú"
            >
              <Menu size={20} />
            </button>
          </div>

          {activeTab === 'historial' ? (
            <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm w-full sm:w-auto justify-between">
              <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-50"><ChevronLeft /></button>
              <span className="px-3 font-medium text-center capitalize flex-1 sm:flex-none sm:min-w-[160px]">
                {format(currentMonth, 'MMMM yyyy', { locale: es })}
              </span>
              <button onClick={handleNextMonth} className="p-2 hover:bg-gray-50"><ChevronRight /></button>
            </div>
          ) : null}
        </div>

        {activeTab === 'historial' ? (
          <div className="sm:hidden bg-white rounded-xl shadow-sm border border-gray-100 p-4">
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
                            {record.overtimeMinutes && record.overtimeMinutes > 0 ? (
                              <div className="col-span-3 mt-1 text-[10px] text-rose-700 bg-rose-50 border border-rose-100 rounded px-1.5 py-0.5 inline-block w-max">
                                HE: {Math.floor(record.overtimeMinutes/60)}h
                              </div>
                            ) : null}
                          </div>
                        ) : null}

                        {record && record.status !== 'weekend' && record.status !== 'dayOff' && record.status !== 'absent' ? (
                          <div className="mt-3 flex justify-end">
                            <button
                              onClick={() => openCorrection(record)}
                              className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-medium"
                            >
                              Solicitar corrección
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="sm:hidden bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            {isLoadingRequests ? (
              <div className="text-sm text-gray-500">Cargando solicitudes...</div>
            ) : myRequests.length === 0 ? (
              <div className="text-sm text-gray-500">No tienes solicitudes registradas.</div>
            ) : (
              <div className="space-y-3">
                {myRequests.map((r) => {
                  const statusLabel = r.status === 'pending' ? 'Pendiente' : r.status === 'approved' ? 'Aprobada' : 'Rechazada';
                  const statusClass =
                    r.status === 'pending'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : r.status === 'approved'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-50 text-red-700 border border-red-200';
                  const markLabel =
                    r.markType === 'checkIn' ? 'Ingreso' :
                    r.markType === 'lunchStart' ? 'Inicio almuerzo' :
                    r.markType === 'lunchEnd' ? 'Fin almuerzo' :
                    'Salida';
                  const dateLabel = r.attendance?.date || r.createdAt;
                  return (
                    <div key={r.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-gray-900 truncate">
                            {markLabel} · {format(parseDateForDisplay(dateLabel), "d 'de' MMMM yyyy", { locale: es })}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {r.previousTimeAtRequest} → <span className="font-semibold text-gray-700">{r.requestedTime}</span>
                          </div>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusClass}`}>{statusLabel}</span>
                      </div>

                      <div className="mt-2 text-xs text-gray-700">
                        <div className="text-[10px] text-gray-500">Motivo</div>
                        <div className="mt-0.5">{r.reason}</div>
                      </div>

                      {r.status !== 'pending' && (r.reviewComment || r.reviewedByUser) ? (
                        <div className="mt-2 text-xs text-gray-700">
                          <div className="text-[10px] text-gray-500">Revisión</div>
                          <div className="mt-0.5">
                            {r.reviewComment ? r.reviewComment : 'Sin comentario'}
                            {r.reviewedByUser?.name ? ` · ${r.reviewedByUser.name}` : ''}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Desktop: calendario */}
        <div className={`${activeTab === 'historial' ? 'hidden sm:block' : 'hidden'} bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6`}>
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
              <div key={d} className="text-center text-xs sm:text-sm font-medium text-gray-500 py-1 sm:py-2">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: (startOfMonth(currentMonth).getDay() + 6) % 7 }).map((_, i) => (
              <div key={`empty-${i}`} className="h-24 sm:h-32 bg-gray-50/50 rounded-lg border border-transparent" />
            ))}
            {daysInMonth.map(day => {
              const record = getRecordForDate(day);
              const isToday = isSameDay(day, new Date());
              return (
                <div key={day.toISOString()} className={`h-24 sm:h-32 p-1.5 sm:p-2 rounded-lg border flex flex-col justify-between ${isToday ? 'border-indigo-500 ring-1 ring-indigo-500 bg-white' : 'border-gray-100 bg-white'}`}>
                  <div className="flex justify-between items-start">
                    <span className={`text-xs sm:text-sm font-medium w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 text-white' : 'text-gray-700'}`}>
                      {format(day, 'd')}
                    </span>
                    {record && record.status !== 'weekend' && record.status !== 'dayOff' && (
                      <div className="flex items-center gap-1">
                        {(record.latCheckIn || record.latCheckOut) && (
                          <button onClick={() => setSelectedRecord(record)} className="hidden sm:inline-flex text-gray-400 hover:text-indigo-600 transition-colors" title="Ver ubicación">
                            <MapPin size={14} />
                          </button>
                        )}
                        <span className={`hidden sm:inline-flex text-[10px] px-1.5 py-0.5 rounded font-medium capitalize ${getStatusColor(record.status)}`}>
                          {record.status === 'present' ? 'Asistió' : record.status === 'late' ? 'Tardanza' : record.status === 'absent' ? 'Falta' : record.status}
                        </span>
                      </div>
                    )}
                  </div>

                  {record && record.status !== 'weekend' && record.status !== 'dayOff' && record.status !== 'absent' ? (
                    <div className="space-y-1 mt-1">
                      <div className="text-[10px] sm:text-xs text-gray-500 flex justify-between">
                        <span>In:</span> <span className="font-medium text-gray-700">{record.checkIn || '--:--'}</span>
                      </div>
                      <div className="text-[10px] sm:text-xs text-gray-500 flex justify-between">
                        <span>Out:</span> <span className="font-medium text-gray-700">{record.checkOut || '--:--'}</span>
                      </div>
                      <div className="mt-1 pt-1 border-t border-gray-50 flex justify-between items-center">
                        <span className="text-[10px] text-gray-400">Total</span>
                        <span className="text-[11px] sm:text-xs font-bold text-indigo-600">{calculateHoursWorked(record)}</span>
                      </div>
                      {record.overtimeMinutes && record.overtimeMinutes > 0 ? (
                        <div className="mt-1 text-[10px] text-rose-700 bg-rose-50 border border-rose-100 rounded px-1.5 py-0.5 inline-block">
                          HE: {Math.floor(record.overtimeMinutes/60)}h
                        </div>
                      ) : null}
                      <button
                        onClick={() => openCorrection(record)}
                        className="mt-1 text-[10px] text-indigo-600 hover:text-indigo-700 font-medium text-left"
                      >
                        Solicitar corrección
                      </button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        {activeTab === 'solicitudes' ? (
          <div className="hidden sm:block bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            {isLoadingRequests ? (
              <div className="text-sm text-gray-500">Cargando solicitudes...</div>
            ) : myRequests.length === 0 ? (
              <div className="text-sm text-gray-500">No tienes solicitudes registradas.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                      <th className="py-2 pr-4 font-medium">Fecha</th>
                      <th className="py-2 pr-4 font-medium">Marcación</th>
                      <th className="py-2 pr-4 font-medium">Cambio</th>
                      <th className="py-2 pr-4 font-medium">Estado</th>
                      <th className="py-2 pr-4 font-medium">Motivo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {myRequests.map((r) => {
                      const statusLabel = r.status === 'pending' ? 'Pendiente' : r.status === 'approved' ? 'Aprobada' : 'Rechazada';
                      const statusClass =
                        r.status === 'pending'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : r.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-200';
                      const markLabel =
                        r.markType === 'checkIn' ? 'Ingreso' :
                        r.markType === 'lunchStart' ? 'Inicio almuerzo' :
                        r.markType === 'lunchEnd' ? 'Fin almuerzo' :
                        'Salida';
                      const dateLabel = r.attendance?.date || r.createdAt;
                      return (
                        <tr key={r.id} className="align-top">
                          <td className="py-3 pr-4 whitespace-nowrap">
                            {format(parseDateForDisplay(dateLabel), 'dd/MM/yyyy')}
                          </td>
                          <td className="py-3 pr-4 whitespace-nowrap">{markLabel}</td>
                          <td className="py-3 pr-4 whitespace-nowrap">
                            {r.previousTimeAtRequest} → <span className="font-semibold text-gray-900">{r.requestedTime}</span>
                          </td>
                          <td className="py-3 pr-4 whitespace-nowrap">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusClass}`}>{statusLabel}</span>
                          </td>
                          <td className="py-3 pr-4 min-w-[280px]">
                            <div className="text-gray-800">{r.reason}</div>
                            {r.status !== 'pending' && (r.reviewComment || r.reviewedByUser) ? (
                              <div className="mt-1 text-xs text-gray-500">
                                {r.reviewComment ? r.reviewComment : 'Sin comentario'}
                                {r.reviewedByUser?.name ? ` · ${r.reviewedByUser.name}` : ''}
                              </div>
                            ) : null}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <button
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Cerrar menú"
          />
          <div className="absolute top-0 right-0 h-full w-72 bg-white shadow-2xl border-l border-gray-100 flex flex-col">
            <div className="p-4 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Logo size={28} />
                <div className="text-sm font-semibold text-gray-900">Menú</div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3 space-y-1">
              <button
                onClick={() => goTab('historial')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <CalendarIcon size={18} className="text-indigo-600" />
                <span className="text-sm font-medium">Historial</span>
              </button>

              <button
                onClick={() => goTab('solicitudes')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <ClipboardList size={18} className="text-indigo-600" />
                <span className="text-sm font-medium">Solicitudes</span>
              </button>

              <button
                onClick={() => { setMobileMenuOpen(false); authService.logout(); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50"
              >
                <LogOut size={18} />
                <span className="text-sm font-semibold">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Ubicación</h3>
                <p className="text-sm text-gray-500">{format(new Date(selectedRecord.date), "EEEE d 'de' MMMM, yyyy", { locale: es })}</p>
              </div>
              <button onClick={() => setSelectedRecord(null)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><X size={20} /></button>
            </div>
            <div className="p-4 bg-gray-50">
              <Suspense fallback={<div className="h-[320px] w-full flex items-center justify-center bg-gray-100 rounded-lg">Cargando mapa...</div>}>
                <AttendanceMap record={selectedRecord} />
              </Suspense>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end">
              <button onClick={() => setSelectedRecord(null)} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {correctionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Solicitar corrección</h3>
                <p className="text-sm text-gray-500">{format(new Date(correctionOpen.record.date), "EEEE d 'de' MMMM, yyyy", { locale: es })}</p>
              </div>
              <button onClick={closeCorrection} disabled={isSubmittingCorrection} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marcación</label>
                <select
                  value={correctionMark}
                  onChange={(e) => {
                    const next = e.target.value as AttendanceCorrectionMarkType;
                    setCorrectionMark(next);
                    const r = correctionOpen.record;
                    const map: Record<AttendanceCorrectionMarkType, string | undefined> = {
                      checkIn: r.checkIn,
                      lunchStart: r.lunchStart,
                      lunchEnd: r.lunchEnd,
                      checkOut: r.checkOut,
                    };
                    setCorrectionTime(map[next] || "");
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                >
                  {getAvailableMarks(correctionOpen.record).map((m) => (
                    <option key={m.key} value={m.key}>
                      {m.label} (actual: {m.time})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hora correcta</label>
                <input
                  type="time"
                  value={correctionTime}
                  onChange={(e) => setCorrectionTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
                <textarea
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  rows={3}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
                {correctionReason.trim().length < 3 && (
                  <div className="mt-1 text-xs text-red-600">El motivo es obligatorio.</div>
                )}

                {hasPendingDuplicate(correctionOpen.record.date, correctionMark) && (
                  <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    Ya existe una solicitud pendiente para esta marcación. Si envías otra, se reemplazará por la última.
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button
                onClick={closeCorrection}
                disabled={isSubmittingCorrection}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                onClick={() => submitCorrection()}
                disabled={isSubmittingCorrection || correctionReason.trim().length < 3 || !correctionTime}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-60"
              >
                {isSubmittingCorrection ? "Enviando..." : "Enviar a RRHH"}
              </button>
            </div>
          </div>
        </div>
      )}


      {toast && (
        <div className="fixed inset-x-0 bottom-4 z-[70] px-4 sm:inset-auto sm:bottom-6 sm:right-6 sm:left-auto">
          <div
            className={`mx-auto sm:mx-0 max-w-md rounded-xl shadow-xl border px-4 py-3 bg-white flex items-start gap-3 ${
              toast.kind === 'success'
                ? 'border-emerald-200'
                : toast.kind === 'warning'
                  ? 'border-amber-200'
                  : 'border-red-200'
            }`}
            role="status"
          >
            {toast.kind === 'success' ? (
              <CheckCircle2 className="text-emerald-600 mt-0.5" size={20} />
            ) : toast.kind === 'warning' ? (
              <AlertTriangle className="text-amber-600 mt-0.5" size={20} />
            ) : (
              <X className="text-red-600 mt-0.5" size={20} />
            )}

            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-gray-900">{toast.title}</div>
              {toast.message ? <div className="text-sm text-gray-600 mt-0.5">{toast.message}</div> : null}
            </div>

            <button
              type="button"
              onClick={() => setToast(null)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50"
              aria-label="Cerrar"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
