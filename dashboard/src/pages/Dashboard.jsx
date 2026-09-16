import React, { useMemo } from "react";
import HeroBanner from "../components/HeroBanner";
import StatCard from "../components/StatCard";
import MapView from "../components/MapView";
import RecentIncidents from "../components/RecentIncidents";
import IncidentDetails from "../components/IncidentDetails";
import {
  IconBus,
  IconWarning,
  IconCamera,
  IconClock,
  IconRefresh,
} from "../components/icons";
import { computeFromIncidents } from "../utils/analytics";

function matchesSearch(incident, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [
    incident.incident_type,
    incident.description,
    incident.bus_number,
    incident.status,
    incident.severity,
    incident.latitude,
    incident.longitude,
    incident.id,
  ].some((value) => value != null && String(value).toLowerCase().includes(q));
}

function formatTrend(pct) {
  return `${Math.abs(pct)}%`;
}

function FleetStrip({ stats, loading }) {
  const items = [
    {
      label: "Active Sensing Buses",
      value: stats?.active_buses ?? 0,
      sub: stats != null ? `of ${stats.total_buses} total registered` : "",
      icon: IconBus,
    },
    {
      label: "Critical Road Hazards",
      value: stats?.critical_incidents ?? 0,
      icon: IconWarning,
    },
    {
      label: "Pending Work Orders",
      value: stats?.pending_incidents ?? 0,
      icon: IconClock,
    },
    {
      label: "AI Object Detections",
      value: stats?.total_detections ?? 0,
      icon: IconCamera,
    },
  ];

  return (
    <section className="fleet-strip" aria-label="System status">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div className="fleet-item" key={item.label}>
            <span className="fleet-item__icon">
              <Icon size={16} />
            </span>
            <div className="fleet-item__text">
              <span className="fleet-item__label">{item.label}</span>
              <span className="fleet-item__value">
                {loading ? "—" : item.value}
                {item.sub && <span className="fleet-item__sub"> {item.sub}</span>}
              </span>
            </div>
          </div>
        );
      })}
    </section>
  );
}

export default function Dashboard({
  incidents = [],
  loading = false,
  error = null,
  refreshIncidents,
  stats = null,
  statsLoading = false,
  statsError = null,
  refreshStats,
  searchQuery = "",
  selectedIncident = null,
  onSelectIncident,
  onCloseIncident,
  onUpdateStatus,
  onDeleteIncident,
}) {
  const data = useMemo(() => computeFromIncidents(incidents, 7), [incidents]);

  const visibleIncidents = useMemo(
    () => incidents.filter((incident) => matchesSearch(incident, searchQuery)),
    [incidents, searchQuery]
  );

  const apiError = error || statsError;
  const retry = () => {
    refreshIncidents?.();
    refreshStats?.();
  };

  return (
    <div className="dashboard-page">
      {apiError && (
        <div className="api-banner">
          <span>{apiError}</span>
          <button type="button" className="retry-button" onClick={retry}>
            <IconRefresh size={12} /> Retry
          </button>
        </div>
      )}

      <section className="hero-row">
        <HeroWithCards data={data} loading={loading} />
      </section>

      <FleetStrip stats={stats} loading={statsLoading} />

      <section className="dashboard-grid">
        <MapView
          incidents={visibleIncidents}
          onSelect={onSelectIncident}
        />
        <RecentIncidents
          incidents={visibleIncidents}
          loading={loading}
          error={error}
          onSelect={onSelectIncident}
        />
      </section>

      {/* Selected Incident Details Modal / Inline Slide */}
      {selectedIncident && (
        <div className="details-grid">
          <IncidentDetails
            incident={selectedIncident}
            onClose={onCloseIncident}
            onUpdateStatus={onUpdateStatus}
            onDelete={onDeleteIncident}
          />
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
        {/* Total Damages */}
        <StatCard
          label="Total Road Damages"
          value={data.total}
          icon="warning"
          tone="red"
          trend={formatTrend(data.damagesChangePct)}
          trendDirection={data.damagesChangePct >= 0 ? "up" : "down"}
          sparkline={data.detected}
          loading={loading}
        />

        {/* Repaired */}
        <StatCard
          label="Repaired & Closed"
          value={data.repaired}
          icon="check"
          tone="green"
          trend={formatTrend(data.repairedChangePct)}
          trendDirection={data.repairedChangePct >= 0 ? "up" : "down"}
          sparkline={data.repairedTrend}
          loading={loading}
        />

        {/* Pending */}
        <StatCard
          label="Active Pending Repairs"
          value={data.pending}
          icon="clock"
          tone="amber"
          trend={formatTrend(data.pendingChangePct)}
          trendDirection={data.pendingChangePct >= 0 ? "up" : "down"}
          sparkline={data.detected.map((d, i) =>
            Math.max(0, d - (data.repairedTrend[i] || 0))
          )}
          loading={loading}
        />
      </div>
    </>
  );
}
