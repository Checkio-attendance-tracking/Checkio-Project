import { useState, useEffect } from 'react';
import { addMilliseconds } from 'date-fns';
import api from '../services/api';

interface TimeState {
  time: Date | null;
  loading: boolean;
  error: string | null;
  isVerified: boolean; // True if time comes from server
}

export function usePeruTime() {
  const [state, setState] = useState<TimeState>({
    time: null,
    loading: true,
    error: null,
    isVerified: false,
  });

  const [offset, setOffset] = useState<number>(0);

  useEffect(() => {
    const syncTime = (serverTime: Date) => {
      const localTime = new Date();
      const timeOffset = serverTime.getTime() - localTime.getTime();
      
      setOffset(timeOffset);
      setState(prev => ({ ...prev, loading: false, isVerified: true, time: serverTime }));
    };

    const handleLocalFallback = () => {
      // Fallback: Calcular hora local UTC-5 manualmente
      // Esto no protege contra cambio de año/dia en PC, pero ajusta la zona horaria al menos.
      // Sin embargo, el requisito es estricto. Marcaremos como no verificado.
      const now = new Date();
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        isVerified: false, 
        time: now,
        error: "No se pudo verificar la hora con el servidor. Usando hora del dispositivo."
      }));
    };

    const fetchTime = async () => {
      // Intentar primero con Backend (más rápido y confiable localmente)
      try {
        const response = await api.get<{ time: string }>('/time');
        const serverTime = new Date(response.data.time);
        syncTime(serverTime);
        return;
      } catch (err) {
        console.warn("Backend time falló, intentando con APIs externas...", err);
      }

      // Intentar con WorldTimeAPI
      try {
        const response = await fetch('https://worldtimeapi.org/api/timezone/America/Lima', { 
            signal: AbortSignal.timeout(5000) // 5s timeout
        });
        if (!response.ok) throw new Error('WorldTimeAPI failed');
        
        const data = await response.json();
        const serverTime = new Date(data.datetime);
        syncTime(serverTime);
        return;
      } catch (err) {
        console.warn("WorldTimeAPI falló, intentando con TimeAPI.io...", err);
      }

      // Fallback a TimeAPI.io
      try {
        const response = await fetch('https://timeapi.io/api/Time/current/zone?timeZone=America/Lima', {
            signal: AbortSignal.timeout(5000)
        });
        if (!response.ok) throw new Error('TimeAPI.io failed');

        const data = await response.json();
        // TimeAPI retorna dateTime en formato ISO
        const serverTime = new Date(data.dateTime); 
        syncTime(serverTime);
        return;
      } catch (err) {
        console.error("Todas las APIs de tiempo fallaron:", err);
        handleLocalFallback();
      }
    };

    fetchTime();
  }, []);

  useEffect(() => {
    if (state.loading) return;

    const timer = setInterval(() => {
      setState(prev => ({
        ...prev,
        time: addMilliseconds(new Date(), offset)
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, [offset, state.loading]);

  return state;
}
