import { DAMAGE_TYPES, isRepaired, normalizeType, dayLabel } from "./damage";

/**
 * Shared incident aggregation used by the Dashboard and Analytics pages.
 * Everything renders from the live incident list returned by GET /api/incidents.
 */

export function last7Days() {
  const out = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    out.push(d);
  }
  return out;
}

export function computeFromIncidents(incidents = []) {
  const total = incidents.length;
  const repairedCount = incidents.filter(isRepaired).length;
  const pendingCount = total - repairedCount;

  const typeCounts = {};
  incidents.forEach((incident) => {
    const key = normalizeType(incident.incident_type);
    typeCounts[key] = (typeCounts[key] || 0) + 1;
  });
  const breakdown = Object.keys(typeCounts)
    .filter((key) => typeCounts[key] > 0)
    .map((key) => ({ key, label: DAMAGE_TYPES[key].label, color: DAMAGE_TYPES[key].color, value: typeCounts[key] }))
    .sort((a, b) => b.value - a.value);

  const window = last7Days();
  const days = window.map((d) => dayLabel(d));
  const detected = window.map((d) => {
    const dayStr = d.toDateString();
    return incidents.filter((i) => i.detected_at && new Date(i.detected_at).toDateString() === dayStr).length;
  });
  const repairedTrend = window.map((d) => {
    const dayStr = d.toDateString();
    return incidents.filter(
      (i) => i.detected_at && new Date(i.detected_at).toDateString() === dayStr && isRepaired(i)
    ).length;
  });

  const prevWeekStart = new Date(window[0]);
  prevWeekStart.setDate(prevWeekStart.getDate() - 7);
  const prevWeekIncidents = incidents.filter((i) => {
    if (!i.detected_at) return false;
    const t = new Date(i.detected_at);
    return t >= prevWeekStart && t < window[0];
  });
  const currentWeekIncidents = incidents.filter((i) => {
    if (!i.detected_at) return false;
    const t = new Date(i.detected_at);
    return t >= window[0];
  });
  const pctChange = (curr, prev) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return Math.round(((curr - prev) / prev) * 100);
  };

  const locationCounts = new Map();
  incidents.forEach((incident) => {
    const name = incident.description || incident.bus_number || "Unknown location";
    locationCounts.set(name, (locationCounts.get(name) || 0) + 1);
  });
  const locations = Array.from(locationCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    total,
    repaired: repairedCount,
    pending: pendingCount,
    breakdown,
    days,
    detected,
    repairedTrend,
    locations,
    damagesChangePct: pctChange(currentWeekIncidents.length, prevWeekIncidents.length),
    repairedChangePct: pctChange(
      currentWeekIncidents.filter(isRepaired).length,
      prevWeekIncidents.filter(isRepaired).length
    ),
    pendingChangePct: pctChange(
      currentWeekIncidents.filter((i) => !isRepaired(i)).length,
      prevWeekIncidents.filter((i) => !isRepaired(i)).length
    ),
  };
}