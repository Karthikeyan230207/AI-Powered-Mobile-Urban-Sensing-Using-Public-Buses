import React, { useState } from "react";
import { IconSliders } from "./icons";

const CIRCUMFERENCE = 2 * Math.PI * 42;

export default function DamageBreakdownCard({ segments = [], total = 0, onSelectType }) {
  const [hoveredKey, setHoveredKey] = useState(null);

  let offsetAccum = 0;
  const activeSegment = segments.find((s) => s.key === hoveredKey);

  return (
    <section className="panel breakdown-card">
      <div className="panel__header">
        <div className="panel__title">
          <IconSliders size={17} />
          <div>
            <h2>Damage Type Breakdown</h2>
            <span className="panel__subtitle">Categorical defect classification</span>
          </div>
        </div>
      </div>

      <div className="breakdown-card__body">
        <div className="donut">
          <svg viewBox="0 0 100 100" onMouseLeave={() => setHoveredKey(null)}>
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="var(--border)"
              strokeWidth="14"
            />
            {segments.map((segment) => {
              const fraction = total > 0 ? segment.value / total : 0;
              const length = fraction * CIRCUMFERENCE;
              const isHovered = hoveredKey === segment.key;
              const circle = (
                <circle
                  key={segment.key}
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke={segment.color}
                  strokeWidth={isHovered ? 17 : 14}
                  strokeDasharray={`${length} ${CIRCUMFERENCE - length}`}
                  strokeDashoffset={-offsetAccum}
                  transform="rotate(-90 50 50)"
                  strokeLinecap="butt"
                  style={{
                    transition: "stroke-width 0.2s ease, opacity 0.2s ease",
                    opacity: hoveredKey && !isHovered ? 0.45 : 1,
                    cursor: "pointer",
                  }}
                  onMouseEnter={() => setHoveredKey(segment.key)}
                  onClick={() => onSelectType?.(segment.key)}
                />
              );
              offsetAccum += length;
              return circle;
            })}
          </svg>

          <div className="donut__center">
            {activeSegment ? (
              <>
                <span className="donut__value" style={{ color: activeSegment.color }}>
                  {total > 0
                    ? `${Math.round((activeSegment.value / total) * 100)}%`
                    : "0%"}
                </span>
                <span className="donut__label">{activeSegment.label}</span>
              </>
            ) : (
              <>
                <span className="donut__value">{total}</span>
                <span className="donut__label">Total Defect Reports</span>
              </>
            )}
          </div>
        </div>

        <ul className="breakdown-legend">
          {segments.map((segment) => {
            const isHovered = hoveredKey === segment.key;
            return (
              <li
                key={segment.key}
                className={isHovered ? "breakdown-legend__item--hovered" : ""}
                onMouseEnter={() => setHoveredKey(segment.key)}
                onMouseLeave={() => setHoveredKey(null)}
                onClick={() => onSelectType?.(segment.key)}
                style={{ cursor: onSelectType ? "pointer" : "default" }}
              >
                <span
                  className="breakdown-legend__dot"
                  style={{ background: segment.color }}
                />
                <span className="breakdown-legend__label">{segment.label}</span>
                <span className="breakdown-legend__count">{segment.value}</span>
                <span className="breakdown-legend__pct">
                  {total > 0 ? `${Math.round((segment.value / total) * 100)}%` : "0%"}
                </span>
              </li>
            );
          })}
          {segments.length === 0 && (
            <li className="state-message">No incidents recorded yet.</li>
          )}
        </ul>
      </div>
    </section>
  );
}
