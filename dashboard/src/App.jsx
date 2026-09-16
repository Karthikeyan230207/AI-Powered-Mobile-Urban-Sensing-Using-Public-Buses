import React, { useCallback, useEffect, useRef, useState, useMemo } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Dashboard from "./pages/Dashboard";
import Incidents from "./pages/Incidents";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import AlertPopup from "./components/AlertPopup";
import useIncidents from "./hooks/useIncidents";
import useDashboardStats from "./hooks/useDashboardStats";
import useIncidentWebSocket from "./hooks/useIncidentWebSocket";
import { damageMeta } from "./utils/damage";
import { playAlertChime } from "./utils/audio";
import { updateIncident, deleteIncident } from "./services/api";

/**
 * Lightweight hash-based routing: #/  #/incidents  #/analytics  #/settings
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

export default function App() {
  const route = useRoute();
  const [searchQuery, setSearchQuery] = useState("");
  const [statsTick, setStatsTick] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [dateRange, setDateRange] = useState("all");
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [audioEnabled, setAudioEnabled] = useState(() => {
    const saved = localStorage.getItem("urban_sensing_audio");
    return saved === null ? true : saved === "true";
  });

  // Shared live data: aggregated stats + the incident feed every page needs.
  const {
    incidents,
    loading,
    error,
    refresh,
    prependIncident,
    patchIncident,
    removeIncident,
  } = useIncidents();

  const {
    stats,
    loading: statsLoading,
    error: statsError,
    refresh: refreshStats,
  } = useDashboardStats(statsTick);

  // Realtime NEW_INCIDENT events -> prepend to the feed + alert popup + audio chime.
  const [alert, setAlert] = useState(null);
  const alertTimer = useRef(null);

  const handleWsEvent = useCallback(
    (incident) => {
      if (!incident) return;
      prependIncident(incident);
      setStatsTick((tick) => tick + 1);

      const label = damageMeta(incident.incident_type).label;
      const where = incident.description || incident.bus_number || "Transit Corridor";

      setRecentAlerts((prev) => [incident, ...prev.slice(0, 19)]);

      setAlert({
        title: `Live Defect: ${label}`,
        message: `${where} detected via bus dashcam sensor.`,
        incident,
      });

      if (audioEnabled) {
        playAlertChime();
      }

      const durationMs =
        (Number(localStorage.getItem("urban_sensing_toast_duration")) || 6) * 1000;

      if (alertTimer.current) clearTimeout(alertTimer.current);
      alertTimer.current = setTimeout(() => setAlert(null), durationMs);
    },
    [prependIncident, audioEnabled]
  );

  useIncidentWebSocket(handleWsEvent);

  const toggleAudio = () => {
    setAudioEnabled((prev) => {
      const next = !prev;
      localStorage.setItem("urban_sensing_audio", String(next));
      return next;
    });
  };

  const handleInspectAlert = (inc) => {
    setSelectedIncident(inc);
    setAlert(null);
    if (route !== "/" && route !== "/incidents") {
      window.location.hash = "#/";
    }
  };

  // Filter incidents based on selected Topbar date range
  const filteredIncidents = useMemo(() => {
    if (dateRange === "all") return incidents;
    const now = new Date();
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    if (dateRange === "today") {
      return incidents.filter((i) => {
        if (!i.detected_at) return false;
        return new Date(i.detected_at) >= start;
      });
    }
    if (dateRange === "7days") {
      start.setDate(start.getDate() - 7);
      return incidents.filter((i) => {
        if (!i.detected_at) return false;
        return new Date(i.detected_at) >= start;
      });
    }
    if (dateRange === "30days") {
      start.setDate(start.getDate() - 30);
      return incidents.filter((i) => {
        if (!i.detected_at) return false;
        return new Date(i.detected_at) >= start;
      });
    }
    return incidents;
  }, [incidents, dateRange]);

  const handleUpdateIncidentStatus = async (newStatus, isVerified = false) => {
    if (!selectedIncident) return;
    try {
      const payload = {
        status: newStatus,
        verified: isVerified || newStatus === "verified" || newStatus === "resolved",
      };
      const updated = await updateIncident(selectedIncident.id, payload);
      patchIncident(selectedIncident.id, updated);
      setSelectedIncident(updated);
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  const handleDeleteIncident = async () => {
    if (!selectedIncident) return;
    if (
      !window.confirm(
        `Are you sure you want to permanently delete incident #${selectedIncident.id}?`
      )
    ) {
      return;
    }
    try {
      await deleteIncident(selectedIncident.id);
      removeIncident(selectedIncident.id);
      setSelectedIncident(null);
    } catch (err) {
      alert("Failed to delete incident: " + err.message);
    }
  };

  const active = ACTIVE_BY_ROUTE[route] || "overview";
  const live = !error && !statsError;

  let page;
  if (route === "/incidents") {
    page = <Incidents searchQuery={searchQuery} />;
  } else if (route === "/analytics") {
    page = (
      <Analytics
        incidents={filteredIncidents}
        loading={loading}
        error={error}
        refreshIncidents={refresh}
      />
    );
  } else if (route === "/settings") {
    page = (
      <Settings
        audioEnabled={audioEnabled}
        onToggleAudio={toggleAudio}
        onTriggerWsAlert={handleWsEvent}
      />
    );
  } else {
    page = (
      <Dashboard
        incidents={filteredIncidents}
        loading={loading}
        error={error}
        refreshIncidents={refresh}
        stats={stats}
        statsLoading={statsLoading}
        statsError={statsError}
        refreshStats={refreshStats}
        searchQuery={searchQuery}
        selectedIncident={selectedIncident}
        onSelectIncident={setSelectedIncident}
        onCloseIncident={() => setSelectedIncident(null)}
        onUpdateStatus={handleUpdateIncidentStatus}
        onDeleteIncident={handleDeleteIncident}
      />
    );
  }

  return (
    <div className="app-shell">
      <Sidebar
        active={active}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        pendingCount={stats?.pending_incidents ?? 0}
      />

      <div className="app-main">
        <Topbar
          live={live}
          notificationCount={recentAlerts.length}
          recentAlerts={recentAlerts}
          onSearch={setSearchQuery}
          onToggleMobileMenu={() => setMobileOpen((v) => !v)}
          onSelectAlert={handleInspectAlert}
          onClearAlerts={() => setRecentAlerts([])}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
        {page}
      </div>

      {alert && (
        <AlertPopup
          alert={alert}
          onDismiss={() => setAlert(null)}
          onInspect={handleInspectAlert}
        />
      )}
    </div>
  );
}