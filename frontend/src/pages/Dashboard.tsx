import { useState } from 'react';
import { usePeruTime } from '../hooks/usePeruTime';
import { Clock } from '../components/Clock';
import { ActionButton } from '../components/ActionButton';
import { Logo } from '../components/Logo';
import { LogOut, LogIn, Utensils, Briefcase, User as UserIcon, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { attendanceService } from '../services/attendance';
import type { User } from '../types/user';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  const { time, loading, error, isVerified } = usePeruTime();
  const [lastAction, setLastAction] = useState<{ type: string; time: Date } | null>(null);
  const [isMarking, setIsMarking] = useState(false);
  const navigate = useNavigate();

  const handleAction = async (actionLabel: string) => {
    if (isMarking) return;
    setIsMarking(true);

    let type: 'checkIn' | 'lunchStart' | 'lunchEnd' | 'checkOut';
    
    switch (actionLabel) {
      case 'Ingreso': type = 'checkIn'; break;
      case 'Salida al Almuerzo': type = 'lunchStart'; break;
      case 'Regreso del Almuerzo': type = 'lunchEnd'; break;
      case 'Salida': type = 'checkOut'; break;
      default: setIsMarking(false); return;
    }

    try {
      await attendanceService.mark(type);
      const now = time || new Date();
      setLastAction({ type: actionLabel, time: now });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || 'Error al marcar asistencia. Verifique que ha permitido el acceso a su ubicación.');
    } finally {
      setIsMarking(false);
    }
  };

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
            <div className="flex items-center space-x-3 bg-gray-100 px-3 py-1.5 rounded-full pr-1">
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
            </div>

            <button 
              onClick={onLogout}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
              title="Cerrar sesión"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

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

          {!isMarking && lastAction && (
            <div className="bg-indigo-50 border border-indigo-100 text-indigo-800 px-4 py-3 rounded-lg flex items-center justify-between animate-fade-in">
              <span className="font-medium">
                Último registro: <span className="font-bold">{lastAction.type}</span>
              </span>
              <span className="text-sm opacity-75">
                {format(lastAction.time, 'HH:mm:ss')}
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
              onClick={() => handleAction('Ingreso')}
            />
            
            <ActionButton 
              label="Salida al Almuerzo" 
              sublabel="Marcar inicio de refrigerio"
              icon={<Utensils />} 
              color="orange" 
              onClick={() => handleAction('Salida al Almuerzo')}
            />
            
            <ActionButton 
              label="Regreso del Almuerzo" 
              sublabel="Marcar fin de refrigerio"
              icon={<Utensils />} 
              color="blue" 
              onClick={() => handleAction('Regreso del Almuerzo')}
            />
            
            <ActionButton 
              label="Salida" 
              sublabel="Marcar fin de jornada"
              icon={<Briefcase />} 
              color="red" 
              onClick={() => handleAction('Salida')}
            />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} Checkio. Sistema de Control de Asistencia.
      </footer>
    </div>
  );
}
