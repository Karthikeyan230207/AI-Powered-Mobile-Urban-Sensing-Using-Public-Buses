import React from "react";
import { IconCamera } from "./icons";
import { DAMAGE_TYPES, normalizeType, relativeTime } from "../utils/damage";

function SkeletonRows() {
  return (
    <>
      {[0, 1, 2].map((row) => (
        <div key={row} className="skeleton-row" aria-hidden="true">
          <div className="skeleton skeleton--line" style={{ width: "40%" }} />
          <div className="skeleton skeleton--line" style={{ width: "20%" }} />
        </div>
      ))}
    </>
  );
}

/**
 * Live object-detection feed panel. Backed by GET /api/detections.
 */
export default function DetectionsCard({ detections = [], loading, error }) {
  const total = detections.length;

  const breakdown = React.useMemo(() => {
    const counts = new Map();
    detections.forEach((detection) => {
      const key = normalizeType(detection.object_type);
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([key, count]) => ({ key, label: DAMAGE_TYPES[key].label, color: DAMAGE_TYPES[key].color, count }))
      .sort((a, b) => b.count - a.count);
  }, [detections]);

  return (
    <section className="panel detections-card">
      <div className="panel__header">
        <div className="panel__title">
          <IconCamera size={16} />
          <h2>Live Detections</h2>
        </div>
        <span className="panel__count">{loading ? "…" : total}</span>
      </div>

      {error && <div className="state-message state-message--error">{error}</div>}
      {loading && <SkeletonRows />}
      {!loading && !error && total === 0 && (
        <div className="state-message">No object detections recorded yet.</div>
      )}

      <ul className="detections-list">
        {!loading &&
          breakdown.map((item) => (
            <li key={item.key}>
              <span className="detections-list__dot" style={{ background: item.color }} />
              <span className="detections-list__label">{item.label}</span>
              <span className="detections-list__count">{item.count}</span>
            </li>
          ))}
      </ul>

      {!loading && !error && detections.length > 0 && (
        <div className="detections-card__foot">
          Latest: {relativeTime(detections[0].detected_at)}
        </div>
      )}
    </section>
  );
}