import React, { useMemo, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { IconMapPin, IconChevronDown, IconPlus, IconMinus, IconLocate } from "./icons";
import { damageMeta, isRepaired, markerColor, relativeTime, normalizeType } from "../utils/damage";

const LEGEND = [
  { key: "pothole", label: "Pothole", color: "#ef4444" },
  { key: "crack", label: "Crack", color: "#f59e0b" },
  { key: "surface_damage", label: "Surface Damage", color: "#8b5cf6" },
  { key: "repaired", label: "Repaired", color: "#16a34a" },
];

function buildIcon(color) {
  const html = `
    <span style="
      display:block;width:26px;height:26px;border-radius:50% 50% 50% 0;
      background:${color};transform:rotate(-45deg);
      box-shadow:0 2px 6px rgba(0,0,0,0.28);border:2px solid #fff;
    "></span>`;
  return L.divIcon({
    html,
    className: "damage-marker",
    iconSize: [26, 26],
    iconAnchor: [13, 26],
    popupAnchor: [0, -26],
  });
}

const ICON_CACHE = {};
function iconFor(color) {
  if (!ICON_CACHE[color]) ICON_CACHE[color] = buildIcon(color);
  return ICON_CACHE[color];
}

function ZoomControls() {
  const map = useMap();
  return (
    <div className="map-controls">
      <button type="button" aria-label="Zoom in" onClick={() => map.zoomIn()}>
        <IconPlus size={15} />
      </button>
      <button type="button" aria-label="Zoom out" onClick={() => map.zoomOut()}>
        <IconMinus size={15} />
      </button>
      <button
        type="button"
        aria-label="Locate"
        onClick={() => map.locate({ setView: true, maxZoom: 14 })}
      >
        <IconLocate size={15} />
      </button>
    </div>
  );
}

export default function MapView({ incidents = [], onSelect }) {
  const [filter, setFilter] = useState("all");
  const [menuOpen, setMenuOpen] = useState(false);

  const validIncidents = useMemo(
    () =>
      incidents.filter(
        (item) => Number.isFinite(Number(item.latitude)) && Number.isFinite(Number(item.longitude))
      ),
    [incidents]
  );

  const filtered = useMemo(() => {
    if (filter === "all") return validIncidents;
    if (filter === "repaired") return validIncidents.filter(isRepaired);
    return validIncidents.filter((item) => normalizeType(item.incident_type) === filter);
  }, [validIncidents, filter]);

  const center = filtered.length
    ? [Number(filtered[0].latitude), Number(filtered[0].longitude)]
    : [13.0827, 80.2707];

  const filterLabel =
    filter === "all"
      ? "All Damages"
      : filter === "repaired"
      ? "Repaired"
      : damageMeta(filter).label;

  return (
    <section className="panel map-panel">
      <div className="panel__header">
        <div className="panel__title">
          <IconMapPin size={17} />
          <h2>Road Damage Map</h2>
        </div>
        <div className="map-panel__controls">
          <div className="map-dropdown">
            <button type="button" className="map-dropdown__trigger" onClick={() => setMenuOpen((v) => !v)}>
              {filterLabel}
              <IconChevronDown size={13} />
            </button>
            {menuOpen && (
              <div className="map-dropdown__menu" onMouseLeave={() => setMenuOpen(false)}>
                {["all", "pothole", "crack", "surface_damage", "repaired"].map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setFilter(key);
                      setMenuOpen(false);
                    }}
                  >
                    {key === "all" ? "All Damages" : key === "repaired" ? "Repaired" : damageMeta(key).label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="map-legend">
            {LEGEND.map((item) => (
              <span key={item.key} className="map-legend__item">
                <span className="map-legend__dot" style={{ background: item.color }} />
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="map-panel__canvas">
        <MapContainer center={center} zoom={12} className="leaflet-map" zoomControl={false}>
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ZoomControls />
          {filtered.map((incident, index) => (
            <Marker
              key={incident.id || index}
              position={[Number(incident.latitude), Number(incident.longitude)]}
              icon={iconFor(markerColor(incident))}
              eventHandlers={{ click: () => onSelect?.(incident) }}
            >
              <Popup>
                <div className="map-popup">
                  <strong>{damageMeta(incident.incident_type).label} Detected</strong>
                  <div>Location: {incident.description || "—"}</div>
                  <div>Time: {relativeTime(incident.detected_at)}</div>
                  <div>
                    Severity: <span className="map-popup__severity">{incident.severity || "—"}</span>
                  </div>
                  <button type="button" className="map-popup__button" onClick={() => onSelect?.(incident)}>
                    View Details
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {!filtered.length && (
          <div className="map-empty">No incidents with valid GPS coordinates yet.</div>
        )}
      </div>
    </section>
  );
}
