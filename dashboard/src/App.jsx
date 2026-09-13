import React, { useCallback, useEffect, useRef, useState } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Dashboard from "./pages/Dashboard";
import Incidents from "./pages/Incidents";
import Analytics from "./pages/Analytics";
import AlertPopup from "./components/AlertPopup";
import useIncidents from "./hooks/useIncidents";
import useDashboardStats from "./hooks/useDashboardStats";
import useIncidentWebSocket from "./hooks/useIncidentWebSocket";
import { damageMeta } from "./utils/damage";

/**
 * Lightweight hash-based routing (no router dependency to match the rest of
 * the stack). Routes: #/  #/incidents  #/analytics  #/settings
 */
function parseRoute() {
  const hash = window.location.hash.replace(/^#/, "");
  return hash === "" ? "/" : hash;
}

function useRoute() {
  const [route, setRoute] = useState(parseRoute);
  useEffect(() => {
    const onHashChange = () => setRoute(parseRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);
  return route;
}

const ACTIVE_BY_ROUTE = {
  "/": "overview",
  "/incidents": "incidents",
  "/analytics": "analytics",
  "/settings": "settings",
};

function SettingsPage() {
  return (
    <main className="dashboard-page page-placeholder">
      <p className="eyebrow">Configuration</p>
      <h1 className="page-title">Settings</h1>
      <p className="muted">
        Settings are managed through environment variables and the FastAPI backend configuration.
      </p>
    </main>
  );
}

export default function App() {
  const route = useRoute();
  const [searchQuery, setSearchQuery] = useState("");
  const [statsTick, setStatsTick] = useState(0);

  // Shared live data: aggregated stats + the incident feed every page may need.
  const { incidents, loading, error, refresh, prependIncident } = useIncidents();
  const { stats, loading: statsLoading, error: statsError, refresh: refreshStats } = useDashboardStats(statsTick);

  // Realtime NEW_INCIDENT events -> prepend to the feed + transient alert.
  const [alert, setAlert] = useState(null);
  const alertTimer = useRef(null);

  const handleWsEvent = useCallback(
    (incident) => {
      if (!incident) return;
      prependIncident(incident);
      // Refresh the aggregated KPIs after a realtime arrival.
      setStatsTick((tick) => tick + 1);
      const label = damageMeta(incident.incident_type).label;
      const where = incident.description || incident.bus_number || "";
      setAlert(`${label} detected${where ? ` — ${where}` : ""}`);
      if (alertTimer.current) clearTimeout(alertTimer.current);
      alertTimer.current = setTimeout(() => setAlert(null), 6000);
    },
    [prependIncident]
  );
  useIncidentWebSocket(handleWsEvent);

  const active = ACTIVE_BY_ROUTE[route] || "overview";
  const live = !error && !statsError;

  let page;
  if (route === "/incidents") {
    page = <Incidents searchQuery={searchQuery} />;
  } else if (route === "/analytics") {
    page = (
      <Analytics
        incidents={incidents}
        loading={loading}
        error={error}
        refreshIncidents={refresh}
      />
    );
  } else if (route === "/settings") {
    page = <SettingsPage />;
  } else {
    page = (
      <Dashboard
        incidents={incidents}
        loading={loading}
        error={error}
        refreshIncidents={refresh}
        stats={stats}
        statsLoading={statsLoading}
        statsError={statsError}
        refreshStats={refreshStats}
        searchQuery={searchQuery}
      />
    );
  }

  return (
    <div className="app-shell">
      <Sidebar active={active} />
      <div className="app-main">
        <Topbar
          live={live}
          notificationCount={stats?.pending_incidents ?? 0}
          onSearch={setSearchQuery}
        />
        {page}
      </div>
      {alert && <AlertPopup message={alert} onDismiss={() => setAlert(null)} />}
    </div>
  );
}