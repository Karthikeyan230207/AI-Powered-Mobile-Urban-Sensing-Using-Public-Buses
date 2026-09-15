import React, { useMemo, useState } from "react";
import DamageBreakdownCard from "../components/DamageBreakdownCard";
import RepairProgressCard from "../components/RepairProgressCard";
import DamageTrendsCard from "../components/DamageTrendsCard";
import TopLocationsCard from "../components/TopLocationsCard";
import DetectionsCard from "../components/DetectionsCard";
import BusesCard from "../components/BusesCard";
import useDetections from "../hooks/useDetections";
import useBuses from "../hooks/useBuses";
import { computeFromIncidents } from "../utils/analytics";
import { IconRefresh, IconDownload } from "../components/icons";
import { downloadCSV } from "../utils/export";

export default function Analytics({
  incidents = [],
  loading = false,
  error = null,
  refreshIncidents,
}) {
  const [rangeDays, setRangeDays] = useState(7);
  const {
    detections,
    loading: detectionsLoading,
    error: detectionsError,
    refresh: refreshDetections,
  } = useDetections();
  const {
    buses,
    loading: busesLoading,
    error: busesError,
    refresh: refreshBuses,
  } = useBuses();

  const data = useMemo(
    () => computeFromIncidents(incidents, rangeDays),
    [incidents, rangeDays]
  );

  const apiError = error || detectionsError || busesError;
  const retry = () => {
    refreshIncidents?.();
    refreshDetections?.();
    refreshBuses?.();
  };

  const handleLocationClick = (locationName) => {
    window.location.hash = "#/incidents";
  };

  return (
    <div className="dashboard-page analytics-page">
      <div className="page-header-row">
        <div>
          <p className="eyebrow">Intelligence & Insights</p>
          <h1 className="page-title">Urban Analytics Engine</h1>
        </div>

        <div className="page-header-actions">
          <button
            type="button"
            className="secondary-button secondary-button--outline"
            onClick={() => downloadCSV(incidents, `sensing_analytics_${Date.now()}.csv`)}
            disabled={incidents.length === 0}
          >
            <IconDownload size={14} /> Export Report
          </button>
          <button type="button" className="retry-button" onClick={retry} title="Refresh all datasets">
            <IconRefresh size={13} /> Refresh All
          </button>
        </div>
      </div>

      {apiError && (
        <div className="api-banner">
          <span>{apiError}</span>
          <button type="button" className="retry-button" onClick={retry}>
            <IconRefresh size={12} /> Retry
          </button>
        </div>
      )}

      {/* Top Insights Row: Trends & Breakdown & Repair */}
      <section className="insights-grid">
        <DamageTrendsCard
          days={data.days}
          detected={data.detected}
          repaired={data.repairedTrend}
          activeRange={rangeDays}
          onRangeChange={setRangeDays}
        />
        <DamageBreakdownCard segments={data.breakdown} total={data.total} />
        <RepairProgressCard
          total={data.total}
          repaired={data.repaired}
          pending={data.pending}
          improvement={data.repairedChangePct}
        />
        <TopLocationsCard
          locations={data.locations}
          onLocationClick={handleLocationClick}
        />
      </section>

      {/* Fleet & Detections Row */}
      <section className="analytics-grid">
        <DetectionsCard
          detections={detections}
          loading={detectionsLoading}
          error={detectionsError}
        />
        <BusesCard
          buses={buses}
          loading={busesLoading}
          error={busesError}
          onRefresh={refreshBuses}
        />
      </section>
    </div>
  );
}