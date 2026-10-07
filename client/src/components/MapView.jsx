import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Clock, DollarSign, Layers } from 'lucide-react';

// Fix default Leaflet icon paths in bundler
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Helper component to center and fly map when an item is selected
function MapController({ center, zoom }) {
  const map = useMap();
  React.useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

export default function MapView({ trip }) {
  const [selectedDayFilter, setSelectedDayFilter] = useState('all');
  const [focusedLocation, setFocusedLocation] = useState(null);

  const days = trip?.days || [];

  // Extract all activities that have coordinates
  const mappedActivities = useMemo(() => {
    const list = [];
    days.forEach(d => {
      if (selectedDayFilter !== 'all' && d.dayNumber !== Number(selectedDayFilter)) return;
      (d.activities || []).forEach(a => {
        if (a.lat && a.lng) {
          list.push({
            ...a,
            dayNumber: d.dayNumber,
            dayTitle: d.title
          });
        }
      });
    });
    return list;
  }, [days, selectedDayFilter]);

  // Center coordinates calculation
  const defaultCenter = useMemo(() => {
    if (mappedActivities.length > 0) {
      const avgLat = mappedActivities.reduce((sum, a) => sum + a.lat, 0) / mappedActivities.length;
      const avgLng = mappedActivities.reduce((sum, a) => sum + a.lng, 0) / mappedActivities.length;
      return [avgLat, avgLng];
    }
    // Fallback coordinates based on destination name or default
    return [35.6762, 139.6503]; // Tokyo default
  }, [mappedActivities]);

  // Line coordinates connecting route
  const routePolyline = useMemo(() => {
    return mappedActivities.map(a => [a.lat, a.lng]);
  }, [mappedActivities]);

  return (
    <div className="map-container-wrap">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-xl)' }}
      >
        <MapController 
          center={focusedLocation ? [focusedLocation.lat, focusedLocation.lng] : defaultCenter} 
          zoom={focusedLocation ? 15 : 13} 
        />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Connecting route line */}
        {routePolyline.length > 1 && (
          <Polyline
            positions={routePolyline}
            pathOptions={{
              color: '#0EA5E9',
              weight: 4,
              opacity: 0.8,
              dashArray: '8, 8'
            }}
          />
        )}

        {/* Activity Markers */}
        {mappedActivities.map((act) => (
          <Marker
            key={act.id}
            position={[act.lat, act.lng]}
          >
            <Popup>
              <div style={{ padding: '0.25rem', maxWidth: '240px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.2rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#0EA5E9', fontWeight: 700 }}>
                    Day {act.dayNumber} • {act.time}
                  </span>
                  <span style={{
                    fontSize: '0.7rem',
                    padding: '0.1rem 0.4rem',
                    background: '#6366F1',
                    color: '#FFF',
                    borderRadius: '4px'
                  }}>
                    {act.category}
                  </span>
                </div>
                <h4 style={{ margin: '0.2rem 0', fontSize: '0.95rem', color: '#0F172A' }}>{act.title}</h4>
                {act.location && (
                  <p style={{ margin: '0.2rem 0', fontSize: '0.8rem', color: '#64748B' }}>
                    📍 {act.location}
                  </p>
                )}
                {act.cost > 0 && (
                  <p style={{ margin: '0.2rem 0', fontSize: '0.8rem', color: '#10B981', fontWeight: 700 }}>
                    💰 Est. ${act.cost}
                  </p>
                )}
                {act.notes && (
                  <p style={{ margin: '0.4rem 0 0', fontSize: '0.78rem', color: '#475569', fontStyle: 'italic' }}>
                    "{act.notes}"
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Floating Interactive Route Sidebar */}
      <div className="map-sidebar-overlay">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.95rem' }}>
            <Layers size={16} style={{ color: 'var(--primary)' }} />
            <span>Route Stops ({mappedActivities.length})</span>
          </div>

          <select
            value={selectedDayFilter}
            onChange={(e) => setSelectedDayFilter(e.target.value)}
            style={{ fontSize: '0.8rem', padding: '0.3rem 0.5rem', borderRadius: 'var(--radius-sm)' }}
          >
            <option value="all">All Days</option>
            {days.map((d) => (
              <option key={d.dayNumber} value={d.dayNumber}>
                Day {d.dayNumber}
              </option>
            ))}
          </select>
        </div>

        {mappedActivities.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            No mapped coordinates found for this selection. Add coordinates when editing activities to plot them on the map!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {mappedActivities.map((act, idx) => (
              <div
                key={act.id}
                onClick={() => setFocusedLocation(act)}
                style={{
                  padding: '0.55rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  background: focusedLocation?.id === act.id ? 'var(--primary-glow)' : 'var(--bg-subtle)',
                  border: focusedLocation?.id === act.id ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                    Stop #{idx + 1} • Day {act.dayNumber}
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>{act.time}</span>
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', marginTop: '0.15rem' }}>
                  {act.title}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
