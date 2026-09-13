import React, { useMemo, useState } from "react";
import HeroBanner from "../components/HeroBanner";
import StatCard from "../components/StatCard";
import MapView from "../components/MapView";
import RecentIncidents from "../components/RecentIncidents";
import IncidentDetails from "../components/IncidentDetails";
import DamageBreakdownCard from "../components/DamageBreakdownCard";
import RepairProgressCard from "../components/RepairProgressCard";
import DamageTrendsCard from "../components/DamageTrendsCard";
import TopLocationsCard from "../components/TopLocationsCard";
import useIncidents from "../hooks/useIncidents";
import { DAMAGE_TYPES, isRepaired, normalizeType, dayLabel } from "../utils/damage";

// Fallback demo data so the dashboard always renders a complete, meaningful
// view even before the FastAPI backend has real incidents recorded.
const FALLBACK = {
  total: 48,
  repaired: 31,
  pending: 17,
  breakdown: [
    { key: "pothole", label: "Pothole", color: "#ef4444", value: 21 },
    { key: "crack", label: "Crack", color: "#f59e0b", value: 14 },
    { key: "surface_damage", label: "Surface Damage", color: "#8b5cf6", value: 9 },
    { key: "other", label: "Other", color: "#94a3b8", value: 4 },
  ],
  days: ["Apr 23", "Apr 24", "Apr 25", "Apr 26", "Apr 27", "Apr 28", "Apr 29"],
  detected: [10, 12, 15, 18, 25, 20, 20],
  repairedTrend: [8, 9, 10, 14, 20, 17, 18],
  locations: [
    { name: "Main St (Central Station)", count: 8 },
    { name: "Riverside Rd", count: 6 },
    { name: "Airport Rd", count: 5 },
    { name: "West End Rd", count: 4 },
    { name: "Lake View Rd", count: 3 },
  ],
};

function last7Days() {
  const out = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    out.push(d);
  }
  return out;
}

function computeFromIncidents(incidents) {
  const total = incidents.length;
  const repairedCount = incidents.filter(isRepaired).length;
  const pendingCount = total - repairedCount;

  const typeCounts = { pothole: 0, crack: 0, surface_damage: 0, other: 0 };
  incidents.forEach((incident) => {
    const key = normalizeType(incident.incident_type);
    typeCounts[key] = (typeCounts[key] || 0) + 1;
  });
  const breakdown = Object.keys(typeCounts)
    .filter((key) => typeCounts[key] > 0)
    .map((key) => ({ key, label: DAMAGE_TYPES[key].label, color: DAMAGE_TYPES[key].color, value: typeCounts[key] }));

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

export default function Dashboard() {
  const [selectedIncident, setSelectedIncident] = useState(null);
  const { incidents, loading, error } = useIncidents();

  const data = useMemo(() => {
    if (!loading && !error && incidents.length > 0) {
      const live = computeFromIncidents(incidents);
      return {
        ...live,
        damagesChange: `${Math.abs(live.damagesChangePct)}%`,
        damagesDirection: live.damagesChangePct >= 0 ? "up" : "down",
        repairedChange: `${Math.abs(live.repairedChangePct)}%`,
        repairedDirection: live.repairedChangePct >= 0 ? "up" : "down",
        pendingChange: `${Math.abs(live.pendingChangePct)}%`,
        pendingDirection: live.pendingChangePct >= 0 ? "up" : "down",
        improvement: live.repairedChangePct,
      };
    }
    return {
      ...FALLBACK,
      damagesChange: "32%",
      damagesDirection: "down",
      repairedChange: "68%",
      repairedDirection: "up",
      pendingChange: "15%",
      pendingDirection: "down",
      improvement: 68,
    };
  }, [incidents, loading, error]);

  return (
    <div className="dashboard-page">
      {error && (
        <div className="api-banner">
          Could not reach the FastAPI backend — showing sample data. Start the backend to see live incidents.
        </div>
      )}

      <section className="hero-row">
        <HeroWithCards data={data} loading={loading} />
      </section>

      <section className="dashboard-grid">
        <MapView incidents={incidents} onSelect={setSelectedIncident} />
        <RecentIncidents incidents={incidents} loading={loading} error={error} onSelect={setSelectedIncident} />
      </section>

      <section className="insights-grid">
        <DamageBreakdownCard segments={data.breakdown} total={data.total} />
        <RepairProgressCard total={data.total} repaired={data.repaired} pending={data.pending} improvement={data.improvement} />
        <DamageTrendsCard days={data.days} detected={data.detected} repaired={data.repairedTrend} />
        <TopLocationsCard locations={data.locations} />
      </section>

      {selectedIncident && (
        <div className="details-grid">
          <IncidentDetails incident={selectedIncident} onClose={() => setSelectedIncident(null)} />
        </div>
      )}
    </div>
  );
}

function HeroWithCards({ data, loading }) {
  return (
    <>
      <HeroBanner />
      <div className="hero-stats">
        <StatCard
          label="Total Damages Detected"
          value={data.total}
          icon="warning"
          tone="red"
          trend={data.damagesChange}
          trendDirection={data.damagesDirection}
          sparkline={[6, 8, 7, 10, 9, 12, 10]}
          loading={loading}
        />
        <StatCard
          label="Successfully Repaired"
          value={data.repaired}
          icon="check"
          tone="green"
          trend={data.repairedChange}
          trendDirection={data.repairedDirection}
          sparkline={[4, 5, 6, 8, 9, 11, 12]}
          loading={loading}
        />
        <StatCard
          label="Pending Repairs"
          value={data.pending}
          icon="clock"
          tone="amber"
          trend={data.pendingChange}
          trendDirection={data.pendingDirection}
          sparkline={[12, 11, 10, 9, 8, 7, 6]}
          loading={loading}
        />
      </div>
    </>
  );
}
