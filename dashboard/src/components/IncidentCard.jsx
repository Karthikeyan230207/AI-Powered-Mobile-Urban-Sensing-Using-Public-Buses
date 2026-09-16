import React from "react";
import {
  damageMeta,
  isRepaired,
  relativeTime,
  severityLabel,
  normalizeSeverity,
} from "../utils/damage";
import { IconMapPin, IconCheck } from "./icons";

function severityClass(severity = "") {
  const key = normalizeSeverity(severity);
  return `severity severity--${key === "unknown" ? "unknown" : key}`;
}

export default function IncidentCard({ incident, isSelected = false, onSelect }) {
  const repaired = isRepaired(incident);
  const meta = damageMeta(incident.incident_type);
  const severityKey = normalizeSeverity(incident.severity);

  return (
    <button
      className={`incident-card incident-card--button${
        isSelected ? " incident-card--selected" : ""
      }`}
      onClick={() => onSelect?.(incident)}
      aria-label={`${meta.label}, severity ${severityKey}, status ${
        repaired ? "resolved" : incident.status || "pending"
      }`}
    >
      <div className="incident-card__header">
        <span className="incident-card__type">
          <span
            className="type-pill__dot"
            style={{ background: meta.color }}
            aria-hidden="true"
          />{" "}
          {meta.label}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {incident.priority_score != null && (
            <span className="priority-badge" title="Intelligence Priority Score">
              P{Math.round(Number(incident.priority_score))}
            </span>
          )}
          <span className={severityClass(incident.severity)}>
            {severityLabel(incident.severity)}
          </span>
        </div>
      </div>

      {incident.description && (
        <div className="incident-card__desc">
          <IconMapPin size={12} />
          <span>{incident.description}</span>
        </div>
      )}

      <div className="incident-card__meta">
        <span>Bus {incident.bus_number || "—"}</span>
        <span>•</span>
        <span>{relativeTime(incident.detected_at)}</span>
      </div>

      <div className="incident-card__foot">
        <div
          className={`status-pill ${
            repaired ? "status-pill--repaired" : "status-pill--pending"
          }`}
        >
          {repaired && <IconCheck size={11} strokeWidth={3} />}
          {repaired ? "Resolved" : incident.status || "Pending"}
        </div>

        <div className="incident-card__confidence">
          AI Confidence:{" "}
          <strong>
            {incident.confidence != null
              ? `${Math.round(Number(incident.confidence) * 100)}%`
              : "—"}
          </strong>
        </div>
      </div>
    </button>
  );
}
