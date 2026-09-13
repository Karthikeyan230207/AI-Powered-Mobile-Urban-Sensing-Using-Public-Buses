import React from "react";
import { IconWarning, IconMapPin, IconCheck, IconArrowRight, IconCamera } from "./icons";
import { damageMeta, isRepaired, relativeTime } from "../utils/damage";

function Thumbnail({ incident }) {
  if (incident.image_url) {
    return <img className="incident-row__thumb" src={incident.image_url} alt="" />;
  }
  return (
    <div className="incident-row__thumb incident-row__thumb--placeholder">
      <IconCamera size={18} strokeWidth={1.8} />
    </div>
  );
}

function SkeletonRows() {
  return (
    <>
      {[0, 1, 2, 3, 4].map((row) => (
        <div key={row} className="incident-row incident-row--skeleton" aria-hidden="true">
          <div className="skeleton skeleton--thumb" />
          <div className="incident-row__body">
            <div className="skeleton skeleton--line" style={{ width: "55%" }} />
            <div className="skeleton skeleton--line" style={{ width: "80%" }} />
            <div className="skeleton skeleton--line" style={{ width: "35%" }} />
          </div>
        </div>
      ))}
    </>
  );
}

export default function RecentIncidents({ incidents = [], loading, error, onSelect }) {
  const items = incidents.slice(0, 5);

  return (
    <section className="panel recent-incidents">
      <div className="panel__header">
        <div className="panel__title">
          <IconWarning size={17} />
          <h2>Recent Incidents</h2>
        </div>
        <a className="panel__link" href="#/incidents">
          View All <IconArrowRight size={13} />
        </a>
      </div>

      {error && <div className="state-message state-message--error">{error}</div>}
      {loading && <SkeletonRows />}
      {!loading && !error && items.length === 0 && (
        <div className="state-message">No incidents found.</div>
      )}

      <div className="incident-rows">
        {!loading &&
          items.map((incident, index) => {
            const meta = damageMeta(incident.incident_type);
            const repaired = isRepaired(incident);
            return (
              <button
                type="button"
                key={incident.id || index}
                className="incident-row"
                onClick={() => onSelect?.(incident)}
              >
                <Thumbnail incident={incident} />
                <div className="incident-row__body">
                  <div className="incident-row__top">
                    <span className="type-pill" style={{ color: meta.color }}>
                      <span className="type-pill__dot" style={{ background: meta.color }} />
                      {meta.label}
                    </span>
                    <span className={`status-pill ${repaired ? "status-pill--repaired" : "status-pill--pending"}`}>
                      {repaired && <IconCheck size={11} strokeWidth={3} />}
                      {repaired ? "Repaired" : "Pending"}
                    </span>
                  </div>
                  <div className="incident-row__location">
                    <IconMapPin size={12} />
                    {incident.description || incident.bus_number || "Unknown location"}
                  </div>
                  <div className="incident-row__time">{relativeTime(incident.detected_at)}</div>
                </div>
              </button>
            );
          })}
      </div>
    </section>
  );
}
