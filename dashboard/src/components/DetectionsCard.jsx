import React, { useState } from "react";
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

export default function DetectionsCard({ detections = [], loading, error }) {
  const [activeTab, setActiveTab] = useState("breakdown");
  const total = detections.length;

  const breakdown = React.useMemo(() => {
    const counts = new Map();
    detections.forEach((detection) => {
      const key = normalizeType(detection.object_type);
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([key, count]) => ({
        key,
        label: DAMAGE_TYPES[key]?.label || key,
        color: DAMAGE_TYPES[key]?.color || "#94a3b8",
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [detections]);

  return (
    <section className="panel detections-card">
      <div className="panel__header">
        <div className="panel__title">
          <IconCamera size={18} />
          <div>
            <h2>Live AI Object Detections</h2>
            <span className="panel__subtitle">
              Raw bounding box detections from onboard cameras
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div className="trends-range-tabs">
            <button
              type="button"
              className={`range-tab${activeTab === "breakdown" ? " range-tab--active" : ""}`}
              onClick={() => setActiveTab("breakdown")}
            >
              Summary
            </button>
            <button
              type="button"
              className={`range-tab${activeTab === "stream" ? " range-tab--active" : ""}`}
              onClick={() => setActiveTab("stream")}
            >
              Live Feed
            </button>
          </div>
          <span className="panel__count">{loading ? "…" : total}</span>
        </div>
      </div>

      {error && <div className="state-message state-message--error">{error}</div>}
      {loading && <SkeletonRows />}
      {!loading && !error && total === 0 && (
        <div className="state-message">No object detections recorded yet.</div>
      )}

      {!loading && activeTab === "breakdown" && (
        <ul className="detections-list">
          {breakdown.map((item) => (
            <li key={item.key}>
              <span
                className="detections-list__dot"
                style={{ background: item.color }}
              />
              <span className="detections-list__label">{item.label}</span>
              <span className="detections-list__count">{item.count} items</span>
            </li>
          ))}
        </ul>
      )}

      {!loading && activeTab === "stream" && (
        <div className="detections-stream">
          {detections.slice(0, 10).map((det, idx) => {
            const meta = DAMAGE_TYPES[normalizeType(det.object_type)] || DAMAGE_TYPES.other;
            return (
              <div key={det.id || idx} className="detection-stream-item">
                <span
                  className="type-pill__dot"
                  style={{ background: meta.color }}
                />
                <div className="detection-stream-body">
                  <div className="detection-stream-title">
                    <strong>{meta.label}</strong>
                    <span>Confidence: {det.confidence != null ? `${Math.round(det.confidence * 100)}%` : "—"}</span>
                  </div>
                  <div className="detection-stream-meta">
                    <span>Bus: {det.bus_number || "—"}</span>
                    <span>•</span>
                    <span>{relativeTime(det.detected_at)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && !error && detections.length > 0 && (
        <div className="detections-card__foot">
          Latest stream packet: {relativeTime(detections[0].detected_at)}
        </div>
      )}
    </section>
  );
}