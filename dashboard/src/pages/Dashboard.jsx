
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

import {
  DAMAGE_TYPES,
  isRepaired,
  normalizeType,
  dayLabel,
} from "../utils/damage";


// ============================================================
// Last 7 Days
// ============================================================

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


// ============================================================
// Compute Dashboard Data From Backend Incidents
// ============================================================

function computeFromIncidents(incidents) {
  // ----------------------------------------------------------
  // Total / Repaired / Pending
  // ----------------------------------------------------------

  const total = incidents.length;

  const repairedCount = incidents.filter(isRepaired).length;

  const pendingCount = total - repairedCount;


  // ----------------------------------------------------------
  // Damage Breakdown
  // ----------------------------------------------------------

  const typeCounts = {
    pothole: 0,
    crack: 0,
    surface_damage: 0,
    other: 0,
  };

  incidents.forEach((incident) => {
    const key = normalizeType(incident.incident_type);

    typeCounts[key] = (typeCounts[key] || 0) + 1;
  });

  const breakdown = Object.keys(typeCounts)
    .filter((key) => typeCounts[key] > 0)
    .map((key) => ({
      key,
      label: DAMAGE_TYPES[key]?.label || key,
      color: DAMAGE_TYPES[key]?.color || "#94a3b8",
      value: typeCounts[key],
    }));


  // ----------------------------------------------------------
  // Last 7 Days
  // ----------------------------------------------------------

  const window = last7Days();

  const days = window.map((d) => dayLabel(d));


  // ----------------------------------------------------------
  // Detected Trend
  // ----------------------------------------------------------

  const detected = window.map((d) => {
    const dayStr = d.toDateString();

    return incidents.filter(
      (incident) =>
        incident.detected_at &&
        new Date(incident.detected_at).toDateString() === dayStr
    ).length;
  });


  // ----------------------------------------------------------
  // Repaired Trend
  // ----------------------------------------------------------

  const repairedTrend = window.map((d) => {
    const dayStr = d.toDateString();

    return incidents.filter(
      (incident) =>
        incident.detected_at &&
        new Date(incident.detected_at).toDateString() === dayStr &&
        isRepaired(incident)
    ).length;
  });


  // ----------------------------------------------------------
  // Previous Week
  // ----------------------------------------------------------

  const prevWeekStart = new Date(window[0]);

  prevWeekStart.setDate(prevWeekStart.getDate() - 7);


  const prevWeekIncidents = incidents.filter((incident) => {
    if (!incident.detected_at) return false;

    const time = new Date(incident.detected_at);

    return time >= prevWeekStart && time < window[0];
  });


  // ----------------------------------------------------------
  // Current Week
  // ----------------------------------------------------------

  const currentWeekIncidents = incidents.filter((incident) => {
    if (!incident.detected_at) return false;

    const time = new Date(incident.detected_at);

    return time >= window[0];
  });


  // ----------------------------------------------------------
  // Percentage Change
  // ----------------------------------------------------------

  const pctChange = (current, previous) => {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }

    return Math.round(
      ((current - previous) / previous) * 100
    );
  };


  // ----------------------------------------------------------
  // Locations
  // ----------------------------------------------------------

  const locationCounts = new Map();

  incidents.forEach((incident) => {
    const name =
      incident.description ||
      incident.bus_number ||
      incident.location ||
      "Unknown location";

    locationCounts.set(
      name,
      (locationCounts.get(name) || 0) + 1
    );
  });


  const locations = Array.from(locationCounts.entries())
    .map(([name, count]) => ({
      name,
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);


  // ----------------------------------------------------------
  // Percentage Changes
  // ----------------------------------------------------------

  const damagesChangePct = pctChange(
    currentWeekIncidents.length,
    prevWeekIncidents.length
  );


  const repairedChangePct = pctChange(
    currentWeekIncidents.filter(isRepaired).length,
    prevWeekIncidents.filter(isRepaired).length
  );


  const pendingChangePct = pctChange(
    currentWeekIncidents.filter(
      (incident) => !isRepaired(incident)
    ).length,
    prevWeekIncidents.filter(
      (incident) => !isRepaired(incident)
    ).length
  );


  // ----------------------------------------------------------
  // Return Dashboard Data
  // ----------------------------------------------------------

  return {
    total,
    repaired: repairedCount,
    pending: pendingCount,

    breakdown,

    days,
    detected,
    repairedTrend,

    locations,

    damagesChangePct,
    repairedChangePct,
    pendingChangePct,
  };
}


// ============================================================
// Dashboard
// ============================================================

export default function Dashboard() {
  const [selectedIncident, setSelectedIncident] = useState(null);

  // ----------------------------------------------------------
  // Backend + WebSocket
  // ----------------------------------------------------------

  const {
    incidents,
    loading,
    error,
  } = useIncidents();


  // ----------------------------------------------------------
  // Build Dashboard Data
  // ----------------------------------------------------------

  const data = useMemo(() => {

    // While API is loading
    if (loading) {
      return {
        total: 0,
        repaired: 0,
        pending: 0,

        breakdown: [],

        days: [],
        detected: [],
        repairedTrend: [],

        locations: [],

        damagesChange: "0%",
        damagesDirection: "down",

        repairedChange: "0%",
        repairedDirection: "down",

        pendingChange: "0%",
        pendingDirection: "down",

        improvement: 0,
      };
    }


    // Calculate everything from backend incidents
    const live = computeFromIncidents(incidents);


    return {
      ...live,

      damagesChange:
        `${Math.abs(live.damagesChangePct)}%`,

      damagesDirection:
        live.damagesChangePct >= 0
          ? "up"
          : "down",


      repairedChange:
        `${Math.abs(live.repairedChangePct)}%`,

      repairedDirection:
        live.repairedChangePct >= 0
          ? "up"
          : "down",


      pendingChange:
        `${Math.abs(live.pendingChangePct)}%`,

      pendingDirection:
        live.pendingChangePct >= 0
          ? "up"
          : "down",


      improvement:
        live.repairedChangePct,
    };

  }, [incidents, loading]);


  // ==========================================================
  // Render
  // ==========================================================

  return (
    <div className="dashboard-page">

      {/* ======================================================
          API Error
      ====================================================== */}

      {error && (
        <div className="api-banner">
          Could not reach the FastAPI backend.
          Start the backend and refresh the dashboard.
        </div>
      )}


      {/* ======================================================
          Hero + Statistics
      ====================================================== */}

      <section className="hero-row">

        <HeroWithCards
          data={data}
          loading={loading}
        />

      </section>


      {/* ======================================================
          Map + Recent Incidents
      ====================================================== */}

      <section className="dashboard-grid">

        <MapView
          incidents={incidents}
          onSelect={setSelectedIncident}
        />


        <RecentIncidents
          incidents={incidents}
          loading={loading}
          error={error}
          onSelect={setSelectedIncident}
        />

      </section>


      {/* ======================================================
          Analytics
      ====================================================== */}

      <section className="insights-grid">

        <DamageBreakdownCard
          segments={data.breakdown}
          total={data.total}
        />


        <RepairProgressCard
          total={data.total}
          repaired={data.repaired}
          pending={data.pending}
          improvement={data.improvement}
        />


        <DamageTrendsCard
          days={data.days}
          detected={data.detected}
          repaired={data.repairedTrend}
        />


        <TopLocationsCard
          locations={data.locations}
        />

      </section>


      {/* ======================================================
          Incident Details
      ====================================================== */}

      {selectedIncident && (
        <div className="details-grid">

          <IncidentDetails
            incident={selectedIncident}
            onClose={() => setSelectedIncident(null)}
          />

        </div>
      )}

    </div>
  );
}


// ============================================================
// Hero Statistics
// ============================================================

function HeroWithCards({ data, loading }) {

  return (
    <>
      <HeroBanner />


      <div className="hero-stats">

        {/* Total Damages */}

        <StatCard
          label="Total Damages Detected"
          value={data.total}
          icon="warning"
          tone="red"

          trend={data.damagesChange}
          trendDirection={data.damagesDirection}

          sparkline={
            data.detected.length > 0
              ? data.detected
              : [0]
          }

          loading={loading}
        />


        {/* Repaired */}

        <StatCard
          label="Successfully Repaired"
          value={data.repaired}
          icon="check"
          tone="green"

          trend={data.repairedChange}
          trendDirection={data.repairedDirection}

          sparkline={
            data.repairedTrend.length > 0
              ? data.repairedTrend
              : [0]
          }

          loading={loading}
        />


        {/* Pending */}

        <StatCard
          label="Pending Repairs"
          value={data.pending}
          icon="clock"
          tone="amber"

          trend={data.pendingChange}
          trendDirection={data.pendingDirection}

          sparkline={
            data.detected.length > 0
              ? data.detected
              : [0]
          }

          loading={loading}
        />

      </div>
    </>
  );
}
