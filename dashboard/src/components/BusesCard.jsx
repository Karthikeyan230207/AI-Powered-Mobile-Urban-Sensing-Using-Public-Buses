import React from "react";
import { IconBus } from "./icons";
import { relativeTime } from "../utils/damage";

function statusClass(status = "") {
  const key = String(status).toLowerCase();
  if (key === "active") return "bus-status bus-status--active";
  if (key === "maintenance" || key === "offline") return "bus-status bus-status--offline";
  return "bus-status";
}

/**
 * Live bus fleet panel. Backed by GET /api/buses.
 */
export default function BusesCard({ buses = [], loading, error }) {
  const activeCount = buses.filter((bus) => String(bus.status || "").toLowerCase() === "active").length;

  return (
    <section className="panel buses-card">
      <div className="panel__header">
        <div className="panel__title">
          <IconBus size={16} />
          <h2>Bus Fleet</h2>
        </div>
        {!loading && !error && (
          <span className="panel__count">{activeCount} active / {buses.length}</span>
        )}
      </div>

      {error && <div className="state-message state-message--error">{error}</div>}
      {loading && (
        <div className="skeleton-row" aria-hidden="true">
          <div className="skeleton skeleton--line" style={{ width: "60%" }} />
          <div className="skeleton skeleton--line" style={{ width: "30%" }} />
        </div>
      )}
      {!loading && !error && buses.length === 0 && (
        <div className="state-message">No buses registered yet.</div>
      )}

      {!loading && buses.length > 0 && (
        <div className="bus-table" role="table" aria-label="Bus fleet">
          <div className="bus-table__row bus-table__head" role="row">
            <span>Bus number</span>
            <span>Route</span>
            <span>Status</span>
            <span>Last seen</span>
          </div>
          {buses.slice(0, 8).map((bus) => (
            <div className="bus-table__row" key={bus.id} role="row">
              <span className="bus-table__number">{bus.bus_number}</span>
              <span className="bus-table__route">{bus.route || "—"}</span>
              <span className={statusClass(bus.status)}>{bus.status || "unknown"}</span>
              <span className="bus-table__seen">{relativeTime(bus.last_seen)}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}