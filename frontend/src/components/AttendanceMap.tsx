import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { AttendanceRecord } from '../types/attendance';
import L from 'leaflet';

// Fix for default marker icon issues in React Leaflet
// We'll use a custom icon setup or just rely on the default if it works, 
// but often the default icon is broken in webpack/vite builds without this fix.
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface AttendanceMapProps {
  record: AttendanceRecord;
}

export function AttendanceMap({ record }: AttendanceMapProps) {
  // Collect points
  const points = [
    { type: 'Ingreso', lat: record.latCheckIn, lng: record.lngCheckIn, time: record.checkIn, color: 'green' },
    { type: 'Salida Almuerzo', lat: record.latLunchStart, lng: record.lngLunchStart, time: record.lunchStart, color: 'yellow' },
    { type: 'Regreso Almuerzo', lat: record.latLunchEnd, lng: record.lngLunchEnd, time: record.lunchEnd, color: 'blue' },
    { type: 'Salida Final', lat: record.latCheckOut, lng: record.lngCheckOut, time: record.checkOut, color: 'red' },
  ].filter(p => p.lat && p.lng);

  if (points.length === 0) {
    return <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">No hay datos de ubicación disponibles para este registro.</div>;
  }

  // Calculate center
  const centerLat = points.reduce((sum, p) => sum + (p.lat || 0), 0) / points.length;
  const centerLng = points.reduce((sum, p) => sum + (p.lng || 0), 0) / points.length;

  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden border border-gray-200 shadow-inner">
      <MapContainer center={[centerLat, centerLng]} zoom={15} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {points.map((point, idx) => (
          <Marker key={idx} position={[point.lat!, point.lng!]}>
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
