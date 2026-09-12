export default function IncidentDetails({ incident, onClose }) {
  if (!incident) {
    return (
      <section className="panel incident-details">
        <p className="eyebrow">Incident details</p>
        <h2>Select an incident</h2>
        <p className="muted">Choose an incident card to inspect its location and detection metadata.</p>
      </section>
    );
  }

  return (
    <section className="panel incident-details">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Incident details</p>
          <h2>{incident.incident_type || "Incident"}</h2>
        </div>
        <button className="text-button" onClick={onClose}>Close</button>
      </div>
      <dl>
        <div><dt>Severity</dt><dd>{incident.severity || "—"}</dd></div>
        <div><dt>Priority</dt><dd>{incident.priority_score ?? "—"}</dd></div>
        <div><dt>Bus</dt><dd>{incident.bus_number || "—"}</dd></div>
        <div><dt>Confidence</dt><dd>{incident.confidence != null ? `${Math.round(incident.confidence * 100)}%` : "—"}</dd></div>
        <div><dt>Status</dt><dd>{incident.status || "—"}</dd></div>
        <div><dt>Location</dt><dd>{incident.latitude != null && incident.longitude != null ? `${incident.latitude}, ${incident.longitude}` : "—"}</dd></div>
      </dl>
    </section>
  );
}
