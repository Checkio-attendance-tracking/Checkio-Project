import { useEffect, useState } from 'react';
import { usePeruTime } from '../hooks/usePeruTime';
import { Clock } from '../components/Clock';
import { ActionButton } from '../components/ActionButton';
import { Logo } from '../components/Logo';
import { LogOut, LogIn, Utensils, Briefcase, User as UserIcon, Settings, MapPin, X, RefreshCw, AlertTriangle, CheckCircle2, Calendar, Menu, ClipboardList } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { attendanceService } from '../services/attendance';
import type { User } from '../types/user';
import type { AttendanceRecord } from '../types/attendance';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  const { time, loading, error, isVerified } = usePeruTime();
  const [isMarking, setIsMarking] = useState(false);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [successToast, setSuccessToast] = useState<{ actionLabel: string; at: Date } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  type LocationHelpKind = 'denied' | 'timeout' | 'unavailable' | 'unsupported' | 'inAppBrowser' | 'required' | 'outside';
  const [locationHelpOpen, setLocationHelpOpen] = useState(false);
  const [locationHelpKind, setLocationHelpKind] = useState<LocationHelpKind>('denied');
  const [locationHelpDetails, setLocationHelpDetails] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<{ label: string; type: 'checkIn' | 'lunchStart' | 'lunchEnd' | 'checkOut' } | null>(null);
  const navigate = useNavigate();

  const pickCurrentRecord = (history: AttendanceRecord[]) => {
    const open = history.find((r) => Boolean(r.checkIn) && !r.checkOut);
    if (open) return open;
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    return history.find((r) => r.date === todayStr) || null;
  };

  useEffect(() => {
    const loadToday = async () => {
      try {
        const history = await attendanceService.getMyHistory();
        setTodayRecord(pickCurrentRecord(history));
      } catch {
        // silent
      }
    };
    loadToday();
  }, []);

  const translateError = (msg: string) => {
    const m = msg?.toLowerCase() || '';
    if (m.includes('must check-in first')) return 'Debe marcar Ingreso primero';
    if (m.includes('must check-out first')) return 'Tiene una asistencia abierta. Marque Salida para cerrar.';
    if (m.includes('already checked in')) return 'Ya marcó Ingreso hoy';
    if (m.includes('already started lunch')) return 'Ya marcó Inicio de Almuerzo';
    if (m.includes('must start lunch first')) return 'Debe marcar Inicio de Almuerzo primero';
    if (m.includes('already ended lunch')) return 'Ya marcó Fin de Almuerzo';
    if (m.includes('already checked out')) return 'Ya marcó Salida hoy';
    if (m.includes('location is required')) return 'Debe permitir el acceso a su ubicación';
    if (m.includes('outside the allowed area')) return 'Está fuera del área permitida para marcar';
    return msg || 'Error al marcar asistencia';
  };

  const getDeviceContext = () => {
    const ua = navigator.userAgent || '';
    const isAndroid = /Android/i.test(ua);
    const isInAppBrowser = isAndroid && /(wv|FBAN|FBAV|Instagram|Line|MicroMessenger|WhatsApp)/i.test(ua);
    return { isAndroid, isInAppBrowser };
  };

  const openLocationHelp = (kind: LocationHelpKind, details?: string) => {
    setLocationHelpKind(kind);
    setLocationHelpDetails(details || null);
    setLocationHelpOpen(true);
  };

  const requestHighAccuracyLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject({ kind: 'unsupported' as const });
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => {
          if (err.code === 1) reject({ kind: 'denied' as const, message: err.message });
          else if (err.code === 2) reject({ kind: 'unavailable' as const, message: err.message });
          else reject({ kind: 'timeout' as const, message: err.message });
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    });
  };

  const extractApiMessage = (error: unknown): string | undefined => {
    if (typeof error !== 'object' || !error) return undefined;
    if (!('response' in error)) return undefined;
    const response = (error as { response?: unknown }).response;
    if (typeof response !== 'object' || !response) return undefined;
    if (!('data' in response)) return undefined;
    const data = (response as { data?: unknown }).data;
    if (typeof data !== 'object' || !data) return undefined;
    if (!('message' in data)) return undefined;
    const message = (data as { message?: unknown }).message;
    return typeof message === 'string' ? message : undefined;
  };

  const handleAction = async (actionLabel: string) => {
    if (isMarking) return;
    setIsMarking(true);

    let type: 'checkIn' | 'lunchStart' | 'lunchEnd' | 'checkOut';
    
    switch (actionLabel) {
      case 'Ingreso': type = 'checkIn'; break;
      case 'Inicio de Almuerzo': type = 'lunchStart'; break;
      case 'Fin de Almuerzo': type = 'lunchEnd'; break;
      case 'Salida': type = 'checkOut'; break;
      default: setIsMarking(false); return;
    }

    try {
      setPendingAction({ label: actionLabel, type });

      const { isInAppBrowser } = getDeviceContext();
      if (isInAppBrowser) {
        openLocationHelp('inAppBrowser');
        setIsMarking(false);
        return;
      }

      let location: { lat: number; lng: number };
      try {
        location = await requestHighAccuracyLocation();
      } catch (e: unknown) {
        const kind: LocationHelpKind =
          typeof e === 'object' && e && 'kind' in e
            ? (e as { kind: LocationHelpKind }).kind
            : 'timeout';
        const message = typeof e === 'object' && e && 'message' in e ? String((e as { message?: string }).message || '') : undefined;
        openLocationHelp(kind, message);
        setIsMarking(false);
        return;
      }

      await attendanceService.mark(type, location);
      const now = time || new Date();
      // Refresh state for buttons
      const history = await attendanceService.getMyHistory();
      setTodayRecord(pickCurrentRecord(history));
      setSuccessToast({ actionLabel, at: now });
    } catch (error: unknown) {
      console.error(error);
      const message = extractApiMessage(error);
      if (message?.includes('outside the allowed area')) {
        openLocationHelp('outside', message);
      } else if (message?.includes('Location is required')) {
        openLocationHelp('required', message);
      } else {
        alert(translateError(message || ''));
      }
    } finally {
      setIsMarking(false);
    }
  };

  const { isAndroid } = getDeviceContext();
  const helpTitle =
    locationHelpKind === 'inAppBrowser' ? 'Abre la app en Chrome' :
    locationHelpKind === 'denied' ? 'Permite el acceso a tu ubicación' :
    locationHelpKind === 'timeout' ? 'No se pudo obtener tu ubicación a tiempo' :
    locationHelpKind === 'unavailable' ? 'No se pudo determinar tu ubicación' :
    locationHelpKind === 'unsupported' ? 'Tu dispositivo no soporta geolocalización' :
    locationHelpKind === 'outside' ? 'Estás fuera del área permitida' :
    'Se requiere ubicación para marcar';

  const helpPrimaryText =
    locationHelpKind === 'outside' ? 'Acércate al punto permitido y vuelve a intentar.' :
    locationHelpKind === 'inAppBrowser' ? 'Algunos navegadores internos no muestran el permiso de ubicación.' :
    'Sigue estos pasos para habilitar la ubicación y registrar tu marcación con mapa.';

  const androidSteps = [
    'Si abriste desde WhatsApp/Instagram/Facebook: menú (⋮) → “Abrir en Chrome”.',
    'En Chrome: toca el candado → “Permisos del sitio” → “Ubicación” → “Permitir”.',
    'En Android: Ajustes → Ubicación → Activar y elegir “Ubicación precisa” si aparece.',
    'Si sigue sin salir: Ajustes → Apps → Chrome → Permisos → Ubicación → “Permitir mientras se usa”.',
    'Desactiva ahorro de batería temporalmente y reintenta.'
  ];

  const genericSteps = [
    'Permite la ubicación del navegador cuando lo solicite.',
    'Verifica que la página esté en https:// (candado en la barra).',
    'Reintenta la marcación.'
  ];

  const helpSteps =
    isAndroid ? androidSteps : genericSteps;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Logo size={32} />
            <span className="text-xl font-bold text-gray-800 hidden md:block">Checkio</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-3 bg-gray-100 px-3 py-1.5 rounded-full pr-1">
              <div className="flex items-center space-x-2">
                <UserIcon size={16} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-700">{user.firstName}</span>
              </div>
              
              {user.role === 'admin' && (
                <button 
                  onClick={() => navigate('/admin')}
                  className="p-1.5 bg-white rounded-full text-gray-400 hover:text-indigo-600 shadow-sm transition-colors"
                  title="Configuración y RRHH"
                >
                  <Settings size={14} />
                </button>
              )}
              <button 
                onClick={() => navigate('/dashboard/history')}
                className="p-1.5 bg-white rounded-full text-gray-400 hover:text-indigo-600 shadow-sm transition-colors"
                title="Mi historial"
              >
                <Calendar size={14} />
              </button>
            </div>

            <button 
              onClick={onLogout}
              className="hidden md:inline-flex p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
              title="Cerrar sesión"
            >
              <LogOut size={20} />
            </button>

            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
              title="Menú"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Cerrar menú"
          />
          <div className="absolute top-0 right-0 h-full w-72 bg-white shadow-2xl border-l border-gray-100 flex flex-col">
            <div className="p-4 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Logo size={28} />
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">{user.firstName} {user.lastName}</div>
                  <div className="text-xs text-gray-500 truncate">{user.email}</div>
                </div>
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
                onClick={() => { setMobileMenuOpen(false); navigate('/dashboard/history'); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <Calendar size={18} className="text-indigo-600" />
                <span className="text-sm font-medium">Historial</span>
              </button>

              <button
                onClick={() => { setMobileMenuOpen(false); navigate('/dashboard/history?tab=solicitudes'); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <ClipboardList size={18} className="text-indigo-600" />
                <span className="text-sm font-medium">Solicitudes</span>
              </button>

              <button
                onClick={() => { setMobileMenuOpen(false); onLogout(); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50"
              >
                <LogOut size={18} />
                <span className="text-sm font-semibold">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 flex flex-col items-center">
        
        <div className="w-full max-w-4xl space-y-8 mt-8">
          {/* Clock Section */}
          <section>
            <Clock 
              time={time} 
              loading={loading} 
              error={error} 
              isVerified={isVerified} 
            />
          </section>

          {/* Feedback Section */}
          {isMarking && (
            <div className="bg-indigo-50 border border-indigo-100 text-indigo-800 px-4 py-3 rounded-lg flex items-center justify-between animate-pulse">
              <span className="font-medium flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                Procesando registro...
              </span>
              <span className="text-sm opacity-75">
                Obteniendo ubicación...
              </span>
            </div>
          )}

          {/* Actions Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <ActionButton 
              label="Ingreso" 
              sublabel="Marcar inicio de jornada"
              icon={<LogIn />} 
              color="green" 
              disabled={Boolean(todayRecord?.checkIn)}
              onClick={() => handleAction('Ingreso')}
            />
            
            <ActionButton 
              label="Inicio de Almuerzo" 
              sublabel="Marcar inicio de refrigerio"
              icon={<Utensils />} 
              color="orange" 
              disabled={!(todayRecord?.checkIn) || Boolean(todayRecord?.lunchStart) || Boolean(todayRecord?.checkOut)}
              onClick={() => handleAction('Inicio de Almuerzo')}
            />
            
            <ActionButton 
              label="Fin de Almuerzo" 
              sublabel="Marcar fin de refrigerio"
              icon={<Utensils />} 
              color="blue" 
              disabled={!todayRecord?.lunchStart || Boolean(todayRecord?.lunchEnd) || Boolean(todayRecord?.checkOut)}
              onClick={() => handleAction('Fin de Almuerzo')}
            />
            
            <ActionButton 
              label="Salida" 
              sublabel="Marcar fin de jornada"
              icon={<Briefcase />} 
              color="red" 
              disabled={!(todayRecord?.checkIn) || Boolean(todayRecord?.checkOut)}
              onClick={() => handleAction('Salida')}
            />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} Checkio. Sistema de Control de Asistencia.
      </footer>

      {successToast && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200"
          >
            <div className="p-8 text-center">
              <div className="mx-auto w-20 h-20 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                <CheckCircle2 size={36} className="text-white" />
              </div>

              <div className="mt-4 text-2xl font-bold text-gray-900">Éxito</div>
              <div className="mt-2 text-base text-gray-700">
                Has marcado de manera exitosa tu <span className="font-semibold">{successToast.actionLabel}</span> a las{' '}
                <span className="font-semibold">{format(successToast.at, 'HH:mm:ss')}</span>.
              </div>

              <button
                type="button"
                onClick={() => setSuccessToast(null)}
                className="mt-6 w-full px-6 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {locationHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  {locationHelpKind === 'outside' ? <MapPin size={20} /> : <AlertTriangle size={20} />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{helpTitle}</h3>
                  <p className="text-sm text-gray-500">{helpPrimaryText}</p>
                </div>
              </div>
              <button
                onClick={() => setLocationHelpOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
                aria-label="Cerrar"
              >
                <X size={22} />
              </button>
            </div>

            <div className="p-4 bg-gray-50 space-y-3">
              {locationHelpDetails && (
                <div className="text-xs text-gray-600 bg-white border border-gray-200 rounded-lg p-3">
                  {locationHelpDetails}
                </div>
              )}
              <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700">
                {helpSteps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            </div>

            <div className="p-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setLocationHelpOpen(false)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                type="button"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  setLocationHelpOpen(false);
                  if (pendingAction) handleAction(pendingAction.label);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center gap-2"
                type="button"
              >
                <RefreshCw size={18} />
                Reintentar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
