import IncidentCard from "./IncidentCard";

export default function IncidentList({ incidents = [], loading, error, onSelect }) {
  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Latest detections</p>
          <h2>Recent Incidents</h2>
        </div>
        <span className="panel__count">{loading ? "Loading…" : incidents.length}</span>
      </div>

      {error && (
        <div className="state-message">
          Backend unavailable. Start the FastAPI server to load live incidents.
        </div>
      )}

      {!loading && !error && incidents.length === 0 && (
        <div className="state-message">No incidents found.</div>
      )}

      <div className="incident-list">
        {incidents.slice(0, 5).map((incident, index) => (
          <IncidentCard
            key={incident.id || index}
            incident={incident}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
}
