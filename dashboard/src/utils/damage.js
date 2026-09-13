// Shared classification helpers so every widget (map, cards, charts, lists)
// agrees on the same colors/labels for a given incident.

export const DAMAGE_TYPES = {
  pothole: { label: "Pothole", color: "#ef4444", light: "#fdecec" },
  crack: { label: "Road Crack", color: "#f59e0b", light: "#fef3e2" },
  surface_damage: { label: "Surface Damage", color: "#8b5cf6", light: "#f2ecfe" },
  other: { label: "Other", color: "#94a3b8", light: "#eef1f5" },
};

const ALIASES = {
  pothole: "pothole",
  potholes: "pothole",
  crack: "crack",
  cracks: "crack",
  "road crack": "crack",
  road_crack: "crack",
  surface: "surface_damage",
  "surface damage": "surface_damage",
  surface_damage: "surface_damage",
};

export function normalizeType(incidentType) {
  if (!incidentType) return "other";
  const key = String(incidentType).trim().toLowerCase();
  return ALIASES[key] || (DAMAGE_TYPES[key] ? key : "other");
}

export function damageMeta(incidentType) {
  return DAMAGE_TYPES[normalizeType(incidentType)] || DAMAGE_TYPES.other;
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
