import { useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function MapView({ incidents = [], onSelect }) {
  const validIncidents = useMemo(
    () => incidents.filter((item) => Number.isFinite(Number(item.latitude)) && Number.isFinite(Number(item.longitude))),
    [incidents]
  );

  const center = validIncidents.length
    ? [Number(validIncidents[0].latitude), Number(validIncidents[0].longitude)]
    : [13.0827, 80.2707];

  return (
    <section className="map-panel">
      <div className="map-panel__overlay">
        <div>
          <p className="eyebrow">Live coverage</p>
          <h2>Urban Incident Map</h2>
        </div>
        <span className="map-panel__badge">OpenStreetMap / Leaflet</span>
      </div>

      <MapContainer center={center} zoom={12} className="leaflet-map">
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {validIncidents.map((incident, index) => (
          <Marker
            key={incident.id || index}
            position={[Number(incident.latitude), Number(incident.longitude)]}
            icon={markerIcon}
            eventHandlers={{ click: () => onSelect?.(incident) }}
          >
            <Popup>
              <strong>{incident.incident_type || "Incident"}</strong>
              <br />
              Severity: {incident.severity || "—"}
              <br />
              Bus: {incident.bus_number || "—"}
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {!validIncidents.length && (
        <div className="map-empty">No incidents with valid GPS coordinates yet.</div>
      )}
    </section>
  );
}
