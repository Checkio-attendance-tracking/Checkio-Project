import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { AttendanceRecord } from '../types/attendance';
import L from 'leaflet';

interface AttendanceMapProps {
  record: AttendanceRecord;
}

export function AttendanceMap({ record }: AttendanceMapProps) {
  // Collect points
  const points = [
    { type: 'Ingreso', lat: record.latCheckIn, lng: record.lngCheckIn, time: record.checkIn, color: 'green' },
    { type: 'Inicio Almuerzo', lat: record.latLunchStart, lng: record.lngLunchStart, time: record.lunchStart, color: 'yellow' },
    { type: 'Fin Almuerzo', lat: record.latLunchEnd, lng: record.lngLunchEnd, time: record.lunchEnd, color: 'blue' },
    { type: 'Salida Final', lat: record.latCheckOut, lng: record.lngCheckOut, time: record.checkOut, color: 'red' },
  ].filter(p => p.lat && p.lng);

  if (points.length === 0) {
    return <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">No hay datos de ubicación disponibles para este registro.</div>;
  }

  // Create custom marker function
  const createCustomIcon = (color: string) => L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.4);"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });

  // Calculate center
  const centerLat = points.reduce((sum, p) => sum + (p.lat || 0), 0) / points.length;
  const centerLng = points.reduce((sum, p) => sum + (p.lng || 0), 0) / points.length;

  return (
    <div className="h-[280px] sm:h-[340px] lg:h-[420px] w-full rounded-lg overflow-hidden border border-gray-200 shadow-inner">
      <MapContainer center={[centerLat, centerLng]} zoom={15} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {points.map((point, idx) => (
          <Marker 
            key={idx} 
            position={[point.lat!, point.lng!]}
            icon={createCustomIcon(point.color)}
          >
            <Popup>
              <div className="text-center">
                <strong className="block text-indigo-600 mb-1">{point.type}</strong>
                <span className="text-gray-600">Hora: {point.time}</span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
