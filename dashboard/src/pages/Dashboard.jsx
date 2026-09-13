import { useState } from "react";
import StatCard from "../components/StatCard";
import MapView from "../components/MapView";
import IncidentList from "../components/IncidentList";
import IncidentDetails from "../components/IncidentDetails";
import FilterBar from "../components/FilterBar";
import useIncidents from "../hooks/useIncidents";
import useDashboardStats from "../hooks/useDashboardStats";

export default function Dashboard() {
  const [filters, setFilters] = useState({});
  const [selectedIncident, setSelectedIncident] = useState(null);
  const { incidents, loading: incidentsLoading, error: incidentsError } = useIncidents(filters);
  const { stats, loading: statsLoading, error: statsError } = useDashboardStats();

  return (
    <main className="dashboard-page">
      <section className="hero">
        <div>
          <p className="eyebrow">Public bus sensing network</p>
          <h1>URBAN INTELLIGENCE DASHBOARD</h1>
          <p className="hero__description">
            Monitor road conditions, incidents, and fleet activity from mobile sensing buses.
          </p>
        </div>
        <div className="hero__time">
          <span className={`status-dot ${statsError ? "status-dot--offline" : ""}`} />
          {statsError ? "Backend offline" : "Connected to API"}
        </div>
      </section>

      <section className="stats-grid" aria-label="Dashboard statistics">
        <StatCard label="Total Buses" value={stats?.total_buses} detail="Registered fleet" icon="BUS" loading={statsLoading} />
        <StatCard label="Active Buses" value={stats?.active_buses} detail="Currently reporting" icon="LIVE" loading={statsLoading} />
        <StatCard label="Incidents" value={stats?.total_incidents} detail="Recorded incidents" icon="!" loading={statsLoading} />
        <StatCard label="Critical" value={stats?.critical_incidents} detail="Requires attention" icon="!" loading={statsLoading} />
      </section>

      <FilterBar onApply={setFilters} />

      {incidentsError && <div className="api-banner">Could not reach the FastAPI backend at the configured API URL.</div>}

      <section className="dashboard-grid">
        <MapView incidents={incidents} onSelect={setSelectedIncident} />
        <IncidentList
          incidents={incidents}
          loading={incidentsLoading}
          error={incidentsError}
          onSelect={setSelectedIncident}
        />
      </section>

      {selectedIncident && (
        <div className="details-grid">
          <IncidentDetails incident={selectedIncident} onClose={() => setSelectedIncident(null)} />
        </div>
      )}
    </main>
  );
}
