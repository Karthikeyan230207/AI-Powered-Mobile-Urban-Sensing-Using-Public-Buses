// Shared classification helpers so every widget (map, cards, charts, lists)
// agrees on the same colors/labels for a given incident.

// Canonical classes come from the backend + M4 intelligence layer
// (intelligence/config.py SEVERITY_BASE_SCORES). Anything else falls into
// "other" so unknown future classes never break the UI.
export const DAMAGE_TYPES = {
  pothole: { label: "Pothole", color: "#ef4444", light: "#fdecec" },
  crack: { label: "Road Crack", color: "#f59e0b", light: "#fef3e2" },
  surface_damage: { label: "Surface Damage", color: "#8b5cf6", light: "#f2ecfe" },
  waterlogging: { label: "Waterlogging", color: "#06b6d4", light: "#e0f7fb" },
  garbage: { label: "Garbage Dump", color: "#65a30d", light: "#f2f8e6" },
  streetlight_out: { label: "Street Light Out", color: "#64748b", light: "#eef1f5" },
  encroachment: { label: "Encroachment", color: "#d946ef", light: "#fae8fd" },
  damaged_sign: { label: "Damaged Sign", color: "#0ea5e9", light: "#e0f2fe" },
  pedestrian_risk: { label: "Pedestrian Risk", color: "#f43f5e", light: "#ffe4ec" },
  vehicle_obstruction: { label: "Vehicle Obstruction", color: "#7c3aed", light: "#f1eafd" },
  accident: { label: "Accident", color: "#b91c1c", light: "#fdecec" },
  other: { label: "Other", color: "#94a3b8", light: "#eef1f5" },
};

const ALIASES = {
  pothole: "pothole",
  potholes: "pothole",
  pot_hole: "pothole",
  crack: "crack",
  cracks: "crack",
  "road crack": "crack",
  road_crack: "crack",
  surface_crack: "crack",
  surface: "surface_damage",
  "surface damage": "surface_damage",
  surface_damage: "surface_damage",
  "road damage": "surface_damage",
  road_damage: "surface_damage",
  waterlogging: "waterlogging",
  water_logging: "waterlogging",
  flooding: "waterlogging",
  garbage: "garbage",
  trash: "garbage",
  streetlight_out: "streetlight_out",
  street_light_out: "streetlight_out",
  encroachment: "encroachment",
  illegal_encroachment: "encroachment",
  damaged_sign: "damaged_sign",
  damaged_signage: "damaged_sign",
  pedestrian_risk: "pedestrian_risk",
  pedestrian: "pedestrian_risk",
  vehicle_obstruction: "vehicle_obstruction",
  obstruction: "vehicle_obstruction",
  accident: "accident",
  collision: "accident",
};

export function normalizeType(incidentType) {
  if (!incidentType) return "other";
  const key = String(incidentType).trim().toLowerCase();
  return ALIASES[key] || (DAMAGE_TYPES[key] ? key : "other");
}

export function damageMeta(incidentType) {
  return DAMAGE_TYPES[normalizeType(incidentType)] || DAMAGE_TYPES.other;
}

// Severity labels arrive in mixed case (LOW, Medium, high...). Normalize to
// a consistent readable label and a stable class token.
const SEVERITY_ALIASES = {
  critical: "critical",
  high: "high",
  medium: "medium",
  med: "medium",
  moderate: "medium",
  low: "low",
  info: "low",
};

export function normalizeSeverity(severity) {
  if (!severity) return "unknown";
  const key = String(severity).trim().toLowerCase();
  return SEVERITY_ALIASES[key] || "unknown";
}

export function severityLabel(severity) {
  const key = normalizeSeverity(severity);
  return key === "unknown" ? String(severity || "Unknown").toUpperCase() : key.charAt(0).toUpperCase() + key.slice(1);
}

export function isRepaired(incident) {
  const status = String(incident?.status || "").toLowerCase();
  return status === "resolved" || status === "repaired" || status === "fixed" || status === "closed";
}

export function isPending(incident) {
  return !isRepaired(incident);
}

export const STATUS_COLORS = {
  repaired: "#16a34a",
  pending: "#f59e0b",
};

export function markerColor(incident) {
  if (isRepaired(incident)) return STATUS_COLORS.repaired;
  return damageMeta(incident?.incident_type).color;
}

export function relativeTime(dateLike) {
  if (!dateLike) return "—";
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function dayLabel(dateLike) {
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/** Coerce an unknown value to a finite number (handles null/undefined/strings). */
export function asNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}
