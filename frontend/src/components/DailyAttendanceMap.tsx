import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

type DailyAttendanceMapRecord = {
  id: string;
  employeeName: string;
  checkIn?: string;
  latCheckIn?: number;
  lngCheckIn?: number;
};

export function DailyAttendanceMap({ records }: { records: DailyAttendanceMapRecord[] }) {
  const points = records
    .map((r) => ({
      id: r.id,
      employeeName: r.employeeName,
      time: r.checkIn,
      lat: r.latCheckIn,
      lng: r.lngCheckIn,
    }))
    .filter((p) => typeof p.lat === 'number' && typeof p.lng === 'number');

  if (points.length === 0) {
    return <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">No hay datos de ubicación para hoy.</div>;
  }

  const createIcon = () =>
    L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: #2563eb; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.35);"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6],
    });

  const centerLat = points.reduce((sum, p) => sum + (p.lat as number), 0) / points.length;
  const centerLng = points.reduce((sum, p) => sum + (p.lng as number), 0) / points.length;

  return (
    <div className="h-[440px] w-full rounded-lg overflow-hidden border border-gray-200 shadow-inner">
      <MapContainer center={[centerLat, centerLng]} zoom={15} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {points.map((p) => (
          <Marker key={p.id} position={[p.lat as number, p.lng as number]} icon={createIcon()}>
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">{p.employeeName}</div>
                <div className="text-gray-600">Ingreso: {p.time || '--:--'}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
