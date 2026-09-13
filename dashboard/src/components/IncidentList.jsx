import React from "react";

import IncidentCard from "./IncidentCard";
import { IconWarning, IconArrowDown, IconRefresh } from "./icons";

function SkeletonRows() {
  return (
    <>
      {[0, 1, 2, 3, 4].map((row) => (
        <div key={row} className="incident-card incident-card--skeleton" aria-hidden="true">
          <div className="skeleton skeleton--line" style={{ width: "45%" }} />
          <div className="skeleton skeleton--line" style={{ width: "70%" }} />
          <div className="skeleton skeleton--line" style={{ width: "55%" }} />
        </div>
      ))}
    </>
  );
}

export default function IncidentList({
  incidents = [],
  loading,
  error,
  onSelect,
  onRetry,
  limit = 5,
  emptyMessage = "No incidents found.",
}) {
  const items = incidents.slice(0, limit);

  return (
    <section className="panel incident-list-panel">
      <div className="panel__header">
        <div className="panel__title">
          <IconWarning size={16} />
          <h2>Incident Log</h2>
        </div>
        <span className="panel__count">{loading ? "Loading…" : incidents.length}</span>
      </div>

      {error && (
        <div className="state-message state-message--error">
          <span>{error}</span>
          {onRetry && (
            <button type="button" className="retry-button" onClick={onRetry}>
              <IconRefresh size={12} /> Retry
            </button>
          )}
        </div>
      )}

      {loading && <SkeletonRows />}

      {!loading && !error && incidents.length === 0 && (
        <div className="state-message">{emptyMessage}</div>
      )}

      <div className="incident-list">
        {!loading &&
          items.map((incident, index) => (
            <IncidentCard key={incident.id || index} incident={incident} onSelect={onSelect} />
          ))}
      </div>

      {!loading && !error && incidents.length > limit && (
        <div className="incident-list__more">
          <IconArrowDown size={13} />
          Showing {limit} of {incidents.length} — refine filters to narrow the list.
        </div>
      )}
    </section>
  );
}
