import React, { useMemo } from "react";
import DamageBreakdownCard from "../components/DamageBreakdownCard";
import RepairProgressCard from "../components/RepairProgressCard";
import DamageTrendsCard from "../components/DamageTrendsCard";
import TopLocationsCard from "../components/TopLocationsCard";
import DetectionsCard from "../components/DetectionsCard";
import BusesCard from "../components/BusesCard";
import useDetections from "../hooks/useDetections";
import useBuses from "../hooks/useBuses";
import { computeFromIncidents } from "../utils/analytics";
import { IconRefresh } from "../components/icons";

/**
 * Detailed reporting page — the single source of truth for all analytics
 * visualizations. Incident data comes from the shared feed in App.jsx
 * (one REST fetch + realtime websocket), so charts update live.
 */
export default function Analytics({
  incidents = [],
  loading = false,
  error = null,
  refreshIncidents,
}) {
  const { detections, loading: detectionsLoading, error: detectionsError, refresh: refreshDetections } = useDetections();
  const { buses, loading: busesLoading, error: busesError, refresh: refreshBuses } = useBuses();

  const data = useMemo(() => computeFromIncidents(incidents), [incidents]);
  const apiError = error || detectionsError || busesError;
  const retry = () => {
    refreshIncidents();
    refreshDetections();
    refreshBuses();
  };

  return (
    <div className="dashboard-page analytics-page">
      <p className="eyebrow">Insights</p>
      <h1 className="page-title">Analytics</h1>

      {apiError && (
        <div className="api-banner">
          <span>{apiError}</span>
          <button type="button" className="retry-button" onClick={retry}>
            <IconRefresh size={12} /> Retry
          </button>
        </div>
      )}

      <section className="insights-grid">
        <DamageTrendsCard days={data.days} detected={data.detected} repaired={data.repairedTrend} />
        <DamageBreakdownCard segments={data.breakdown} total={data.total} />
        <RepairProgressCard
          total={data.total}
          repaired={data.repaired}
          pending={data.pending}
          improvement={data.repairedChangePct}
        />
        <TopLocationsCard locations={data.locations} />
      </section>

      <section className="analytics-grid">
        <DetectionsCard detections={detections} loading={detectionsLoading} error={detectionsError} />
        <BusesCard buses={buses} loading={busesLoading} error={busesError} />
      </section>
    </div>
  );
}