function severityClass(severity = "") {
  return `severity severity--${String(severity).toLowerCase()}`;
}

export default function IncidentCard({ incident, onSelect }) {
  return (
    <button className="incident-card incident-card--button" onClick={() => onSelect?.(incident)}>
      <div className="incident-card__header">
        <span className="incident-card__type">{incident.incident_type || "Incident"}</span>
        <span className={severityClass(incident.severity)}>
          {incident.severity || "Unknown"}
        </span>
      </div>
      <div className="incident-card__meta">
        <span>Bus {incident.bus_number || "—"}</span>
        <span>{incident.detected_at ? new Date(incident.detected_at).toLocaleString() : "—"}</span>
      </div>
      <div className="incident-card__confidence">
        Detection confidence: {incident.confidence != null ? `${Math.round(incident.confidence * 100)}%` : "—"}
      </div>
    </button>
  );
}
