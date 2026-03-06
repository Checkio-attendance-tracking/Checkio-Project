import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react';

interface ClockProps {
  time: Date | null;
  loading: boolean;
  error: string | null;
  isVerified: boolean;
}

export function Clock({ time, loading, error, isVerified }: ClockProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-lg animate-pulse">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin mb-2" />
        <span className="text-gray-400 text-sm">Sincronizando hora segura...</span>
      </div>
    );
  }

  if (error && !time) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-xl shadow-lg border border-red-100">
        <AlertTriangle className="h-8 w-8 text-red-500 mb-2" />
        <span className="text-red-600 font-medium">Error de sincronización</span>
        <span className="text-red-400 text-xs mt-1">{error}</span>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 p-4 opacity-5">
        <CheckCircle size={120} />
      </div>

      <div className="z-10 text-center">
        <h2 className="text-gray-500 font-medium mb-1 uppercase tracking-wider text-sm">Hora Oficial (Perú)</h2>
        <div className="text-6xl md:text-8xl font-bold text-gray-800 tabular-nums tracking-tight">
          {time ? format(time, 'HH:mm:ss') : '--:--:--'}
        </div>
        <div className="text-lg text-gray-400 mt-2 font-light capitalize">
          {/* Se usan comillas simples dobles ('') para escapar texto literal en date-fns */}
          {time ? format(time, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es }) : '...'}
        </div>
        
        <div className={`mt-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
          {isVerified ? (
            <>
              <CheckCircle size={12} className="mr-1" />
              Sincronizado con servidor seguro
            </>
          ) : (
            <>
              <AlertTriangle size={12} className="mr-1" />
              Hora local (sin verificar)
            </>
          )}
        </div>
      </div>
    </div>
  );
}
