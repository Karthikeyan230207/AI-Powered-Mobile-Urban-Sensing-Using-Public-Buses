import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import {
  IconMapPin,
  IconChevronDown,
  IconPlus,
  IconMinus,
  IconLocate,
  IconLayers,
  IconMaximize,
  IconMinimize,
  IconActivity,
  IconExternalLink,
} from "./icons";

import {
  damageMeta,
  isRepaired,
  markerColor,
  relativeTime,
  normalizeType,
  severityLabel,
} from "../utils/damage";

const LEGEND = [
  { key: "all", label: "All Damages", color: "#3b82f6" },
  { key: "pothole", label: "Pothole", color: "#ef4444" },
  { key: "crack", label: "Crack", color: "#f59e0b" },
  { key: "surface_damage", label: "Surface Damage", color: "#8b5cf6" },
  { key: "waterlogging", label: "Waterlogging", color: "#06b6d4" },
  { key: "repaired", label: "Repaired", color: "#16a34a" },
];

const TILE_LAYERS = {
  standard: {
    name: "Standard",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  light: {
    name: "Light / Clean",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
  },
  dark: {
    name: "Dark Ops",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
  },
};

function buildIcon(color) {
  const html = `
    <span class="damage-marker-pin" style="
      display:block;
      width:26px;
      height:26px;
      border-radius:50% 50% 50% 0;
      background:${color};
      transform:rotate(-45deg);
      box-shadow:0 3px 8px rgba(0,0,0,0.32);
      border:2.5px solid #fff;
    "></span>
  `;

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
  if (!ICON_CACHE[color]) {
    ICON_CACHE[color] = buildIcon(color);
  }
  return ICON_CACHE[color];
}

/* =========================================================
   MAP CONTROLS: ZOOM, LOCATE, FIT BOUNDS
========================================================= */

function MapActions({ incidents }) {
  const map = useMap();

  const handleFitBounds = () => {
    if (!incidents || incidents.length === 0) return;
    const bounds = L.latLngBounds(
      incidents.map((i) => [Number(i.latitude), Number(i.longitude)])
    );
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  };

  return (
    <div className="map-controls">
      <button type="button" aria-label="Zoom in" title="Zoom in" onClick={() => map.zoomIn()}>
        <IconPlus size={15} />
      </button>

      <button type="button" aria-label="Zoom out" title="Zoom out" onClick={() => map.zoomOut()}>
        <IconMinus size={15} />
      </button>

      <button
        type="button"
        aria-label="My Location"
        title="Locate my position"
        onClick={() => map.locate({ setView: true, maxZoom: 14 })}
      >
        <IconLocate size={15} />
      </button>

      {incidents.length > 0 && (
        <button
          type="button"
          aria-label="Fit all incidents"
          title="Fit all markers in view"
          onClick={handleFitBounds}
        >
          <IconActivity size={14} />
        </button>
      )}
    </div>
  );
}

/* =========================================================
   REALTIME MAP UPDATER (with auto-follow toggle)
========================================================= */

function MapUpdater({ incidents, autoFollow = true }) {
  const map = useMap();
  const lastIncidentIdRef = useRef(null);

  useEffect(() => {
    if (!autoFollow || !incidents.length) return;

    const latest = incidents[0];
    if (!latest || latest.id === lastIncidentIdRef.current) return;
    lastIncidentIdRef.current = latest.id;

    const lat = Number(latest.latitude);
    const lng = Number(latest.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    map.flyTo([lat, lng], Math.max(map.getZoom(), 14), { duration: 1.2 });
  }, [incidents, autoFollow, map]);

  return null;
}

/* =========================================================
   MAP VIEW COMPONENT
========================================================= */

export default function MapView({ incidents = [], onSelect }) {
  const [filter, setFilter] = useState("all");
  const [menuOpen, setMenuOpen] = useState(false);
  const [tileKey, setTileKey] = useState("standard");
  const [layerMenuOpen, setLayerMenuOpen] = useState(false);
  const [autoFollow, setAutoFollow] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const panelRef = useRef(null);

  const toggleFullscreen = () => {
    if (!panelRef.current) return;
    if (!document.fullscreenElement) {
      panelRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const validIncidents = useMemo(
    () =>
      incidents.filter(
        (item) =>
          Number.isFinite(Number(item.latitude)) &&
          Number.isFinite(Number(item.longitude))
      ),
    [incidents]
  );

  const filtered = useMemo(() => {
    if (filter === "all") return validIncidents;
    if (filter === "repaired") return validIncidents.filter(isRepaired);
    return validIncidents.filter(
      (item) => normalizeType(item.incident_type) === filter
    );
  }, [validIncidents, filter]);

  const center = useMemo(() => {
    if (filtered.length > 0) {
      return [Number(filtered[0].latitude), Number(filtered[0].longitude)];
    }
    return [13.0827, 80.2707]; // Chennai default
  }, [filtered]);

  const filterLabel =
    filter === "all"
      ? "All Damages"
      : filter === "repaired"
      ? "Repaired"
      : damageMeta(filter).label;

  const currentTile = TILE_LAYERS[tileKey] || TILE_LAYERS.standard;

  return (
    <section
      ref={panelRef}
      className={`panel map-panel${isFullscreen ? " map-panel--fullscreen" : ""}`}
    >
      <div className="panel__header">
        <div className="panel__title">
          <IconMapPin size={18} />
          <div>
            <h2>Road Damage Map</h2>
            <span className="panel__subtitle">
              {filtered.length} {filtered.length === 1 ? "marker" : "markers"} displayed
            </span>
          </div>
        </div>

        <div className="map-panel__controls">
          {/* Tile Layer Selector */}
          <div className="map-dropdown">
            <button
              type="button"
              className="map-dropdown__trigger map-dropdown__trigger--subtle"
              title="Change map style"
              onClick={() => {
                setLayerMenuOpen((v) => !v);
                setMenuOpen(false);
              }}
            >
              <IconLayers size={14} />
              <span>{currentTile.name}</span>
              <IconChevronDown size={12} />
            </button>

            {layerMenuOpen && (
              <div
                className="map-dropdown__menu"
                onMouseLeave={() => setLayerMenuOpen(false)}
              >
                {Object.entries(TILE_LAYERS).map(([key, item]) => (
                  <button
                    key={key}
                    type="button"
                    className={tileKey === key ? "active" : ""}
                    onClick={() => {
                      setTileKey(key);
                      setLayerMenuOpen(false);
                    }}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Incident Type Filter */}
          <div className="map-dropdown">
            <button
              type="button"
              className="map-dropdown__trigger"
              onClick={() => {
                setMenuOpen((v) => !v);
                setLayerMenuOpen(false);
              }}
            >
              {filterLabel}
              <IconChevronDown size={13} />
            </button>

            {menuOpen && (
              <div
                className="map-dropdown__menu"
                onMouseLeave={() => setMenuOpen(false)}
              >
                {LEGEND.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    className={filter === item.key ? "active" : ""}
                    onClick={() => {
                      setFilter(item.key);
                      setMenuOpen(false);
                    }}
                  >
                    <span
                      className="map-dropdown__dot"
                      style={{ background: item.color }}
                    />
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Auto Follow Toggle */}
          <button
            type="button"
            className={`map-toggle-button${autoFollow ? " map-toggle-button--active" : ""}`}
            title={autoFollow ? "Auto-pan to new incidents is ON" : "Auto-pan to new incidents is OFF"}
            onClick={() => setAutoFollow((v) => !v)}
          >
            <span className="live-badge__dot" style={{ opacity: autoFollow ? 1 : 0.3 }} />
            <span>Follow Live</span>
          </button>

          {/* Fullscreen Button */}
          <button
            type="button"
            className="icon-button"
            aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen map"}
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen map"}
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <IconMinimize size={15} /> : <IconMaximize size={15} />}
          </button>
        </div>
      </div>

      {/* Interactive Legend Bar */}
      <div className="map-legend">
        {LEGEND.map((item) => {
          const isActive = filter === item.key;
          return (
            <button
              key={item.key}
              type="button"
              className={`map-legend__item map-legend__item--button${isActive ? " map-legend__item--active" : ""}`}
              onClick={() => setFilter(item.key)}
            >
              <span className="map-legend__dot" style={{ background: item.color }} />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Map Canvas */}
      <div className="map-panel__canvas">
        <MapContainer
          center={center}
          zoom={12}
          className="leaflet-map"
          zoomControl={false}
          scrollWheelZoom={true}
        >
          <TileLayer
            key={tileKey}
            attribution={currentTile.attribution}
            url={currentTile.url}
          />

          <MapActions incidents={filtered} />
          <MapUpdater incidents={filtered} autoFollow={autoFollow} />

          {filtered.map((incident, index) => {
            const meta = damageMeta(incident.incident_type);
            const repaired = isRepaired(incident);
            const color = markerColor(incident);
            const markerKey = incident.id || incident.incident_id || index;

            return (
              <Marker
                key={markerKey}
                position={[Number(incident.latitude), Number(incident.longitude)]}
                icon={iconFor(color)}
                eventHandlers={{
                  click: () => onSelect?.(incident),
                }}
              >
                <Popup>
                  <div className="map-popup">
                    <div className="map-popup__header">
                      <span
                        className="map-popup__badge"
                        style={{ background: meta.light, color: meta.color }}
                      >
                        {meta.label}
                      </span>
                      <span
                        className={`map-popup__status ${
                          repaired ? "status-pill--repaired" : "status-pill--pending"
                        }`}
                      >
                        {repaired ? "Resolved" : incident.status || "Pending"}
                      </span>
                    </div>

                    <div className="map-popup__title">
                      {incident.description || `Bus ${incident.bus_number || "Alert"}`}
                    </div>

                    <div className="map-popup__details">
                      <div>
                        <span>Severity:</span>
                        <strong style={{ color: meta.color }}>
                          {severityLabel(incident.severity)}
                        </strong>
                      </div>
                      <div>
                        <span>Confidence:</span>
                        <strong>
                          {incident.confidence != null
                            ? `${Math.round(Number(incident.confidence) * 100)}%`
                            : "—"}
                        </strong>
                      </div>
                      <div>
                        <span>Detected:</span>
                        <strong>{relativeTime(incident.detected_at)}</strong>
                      </div>
                      {incident.bus_number && (
                        <div>
                          <span>Bus ID:</span>
                          <strong>{incident.bus_number}</strong>
                        </div>
                      )}
                    </div>

                    <div className="map-popup__actions">
                      <button
                        type="button"
                        className="map-popup__button"
                        onClick={() => onSelect?.(incident)}
                      >
                        Inspect Details
                      </button>
                      <a
                        href={`https://www.google.com/maps?q=${incident.latitude},${incident.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="map-popup__link"
                        title="Open in Google Maps"
                      >
                        <IconExternalLink size={13} />
                      </a>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {filtered.length === 0 && (
          <div className="map-empty">
            No incidents with valid GPS coordinates match the "{filterLabel}" filter.
          </div>
        )}
      </div>
    </section>
  );
}