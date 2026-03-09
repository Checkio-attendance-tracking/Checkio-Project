import { useState, useEffect } from 'react';
import { Save, MapPin } from 'lucide-react';
import { companyService, CompanySettings } from '../../services/company';

export function CompanySettingsPage() {
  const [settings, setSettings] = useState<CompanySettings>({
    geofenceEnabled: false,
    geofenceRadius: 100
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const loadSettings = async () => {
    try {
      const data = await companyService.getSettings();
      setSettings(data);
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Error al cargar la configuración.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await companyService.updateSettings(settings);
      setMessage({ type: 'success', text: 'Configuración guardada correctamente.' });
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Error al guardar la configuración.' });
    } finally {
      setSaving(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocalización no soportada");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSettings(prev => ({
          ...prev,
          geofenceLat: pos.coords.latitude,
          geofenceLng: pos.coords.longitude
        }));
      },
      (err) => alert("Error obteniendo ubicación: " + err.message)
    );
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando configuración...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Configuración de Empresa</h1>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <MapPin className="text-indigo-600" size={24} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Geocerca (Geofence)</h2>
            <p className="text-sm text-gray-500">Restringe la ubicación desde donde los empleados pueden marcar asistencia.</p>
          </div>
        </div>
        
        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <input
              type="checkbox"
              id="geofenceEnabled"
              checked={settings.geofenceEnabled}
              onChange={e => setSettings({...settings, geofenceEnabled: e.target.checked})}
              className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
            />
            <label htmlFor="geofenceEnabled" className="font-medium text-gray-700 cursor-pointer select-none">
              Activar validación de ubicación
            </label>
          </div>

          <div className={`space-y-6 transition-opacity duration-200 ${!settings.geofenceEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Latitud Central</label>
                <input
                  type="number"
                  step="any"
                  value={settings.geofenceLat || ''}
                  onChange={e => setSettings({...settings, geofenceLat: parseFloat(e.target.value)})}
                  placeholder="-12.046374"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Longitud Central</label>
                <input
                  type="number"
                  step="any"
                  value={settings.geofenceLng || ''}
                  onChange={e => setSettings({...settings, geofenceLng: parseFloat(e.target.value)})}
                  placeholder="-77.042793"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex justify-end">
               <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 px-3 py-1.5 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
               >
                  <MapPin size={16} />
                  Usar mi ubicación actual como centro
               </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Radio permitido (metros)</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="50"
                  max="5000"
                  step="50"
                  value={settings.geofenceRadius || 100}
                  onChange={e => setSettings({...settings, geofenceRadius: parseInt(e.target.value)})}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-gray-600 min-w-[60px] text-center">
                  {settings.geofenceRadius || 100}m
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Distancia máxima permitida desde el punto central.</p>
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-lg text-sm flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {message.type === 'success' ? <div className="w-2 h-2 rounded-full bg-green-500" /> : <div className="w-2 h-2 rounded-full bg-red-500" />}
              {message.text}
            </div>
          )}

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-sm font-medium"
            >
              <Save size={18} />
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
