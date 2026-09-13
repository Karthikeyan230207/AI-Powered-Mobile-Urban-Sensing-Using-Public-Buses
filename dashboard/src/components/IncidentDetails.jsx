import React from "react";
import { damageMeta, isRepaired, relativeTime, severityLabel } from "../utils/damage";

export default function IncidentDetails({ incident, onClose }) {
  if (!incident) return null;

  const meta = damageMeta(incident.incident_type);
  const repaired = isRepaired(incident);

  return (
    <section className="panel incident-details">
      <div className="panel__header">
        <div className="panel__title">
          <span className="incident-details__dot" style={{ background: meta.color }} />
          <h2>{meta.label} Detected</h2>
        </div>
        <button className="text-button" onClick={onClose}>Close</button>
      </div>
      <dl>
        {incident.description && (
          <div className="incident-details__description">
            <dt>Description</dt>
            <dd>{incident.description}</dd>
          </div>
        )}
        <div><dt>Status</dt><dd>{repaired ? "Repaired" : incident.status || "Pending"}</dd></div>
        <div><dt>Severity</dt><dd>{severityLabel(incident.severity)}</dd></div>
        <div><dt>Priority</dt><dd>{incident.priority_score != null ? Math.round(Number(incident.priority_score)) : "—"}</dd></div>
        <div><dt>Bus</dt><dd>{incident.bus_number || "—"}</dd></div>
        <div><dt>Confidence</dt><dd>{incident.confidence != null ? `${Math.round(Number(incident.confidence) * 100)}%` : "—"}</dd></div>
        <div><dt>Verified</dt><dd>{incident.verified ? "Yes" : "No"}</dd></div>
        <div><dt>Detected</dt><dd>{relativeTime(incident.detected_at)}</dd></div>
        <div><dt>Location</dt><dd>{incident.latitude != null && incident.longitude != null ? `${Number(incident.latitude).toFixed(5)}, ${Number(incident.longitude).toFixed(5)}` : "—"}</dd></div>
      </dl>
    </section>
  );
}
