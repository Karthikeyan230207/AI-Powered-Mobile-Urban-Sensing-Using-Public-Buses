import React from "react";
import { damageMeta, isRepaired, relativeTime, severityLabel, normalizeSeverity } from "../utils/damage";

function severityClass(severity = "") {
  const key = normalizeSeverity(severity);
  return `severity severity--${key === "unknown" ? "unknown" : key}`;
}

export default function IncidentCard({ incident, onSelect }) {
  const repaired = isRepaired(incident);
  const meta = damageMeta(incident.incident_type);
  const severityKey = normalizeSeverity(incident.severity);

  return (
    <button
      className="incident-card incident-card--button"
      onClick={() => onSelect?.(incident)}
      aria-label={`${meta.label}, severity ${severityKey}, status ${repaired ? "resolved" : incident.status || "pending"}`}
    >
      <div className="incident-card__header">
        <span className="incident-card__type">
          <span className="type-pill__dot" style={{ background: meta.color }} aria-hidden="true" />{" "}
          {meta.label}
        </span>
        <span className={severityClass(incident.severity)}>
          {severityLabel(incident.severity)}
        </span>
      </div>
      <div className="incident-card__meta">
        <span>Bus {incident.bus_number || "—"}</span>
        <span>{relativeTime(incident.detected_at)}</span>
      </div>
      <div className={`incident-card__status${repaired ? " incident-card__status--resolved" : ""}`}>
        {repaired ? "✓ Resolved" : incident.status || "Pending"}
      </div>
      <div className="incident-card__confidence">
        Detection confidence: {incident.confidence != null ? `${Math.round(Number(incident.confidence) * 100)}%` : "—"}
      </div>
    </button>
  );
}
