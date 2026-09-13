import React from "react";
import { IconGear } from "./icons";

const CIRCUMFERENCE = 2 * Math.PI * 42;

export default function DamageBreakdownCard({ segments = [], total = 0 }) {
  let offsetAccum = 0;

  return (
    <section className="panel breakdown-card">
      <div className="panel__header">
        <div className="panel__title">
          <IconGear size={16} />
          <h2>Damage Type Breakdown</h2>
        </div>
      </div>

      <div className="breakdown-card__body">
        <div className="donut">
          <svg viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#eef1f6" strokeWidth="14" />
            {segments.map((segment) => {
              const fraction = total > 0 ? segment.value / total : 0;
              const length = fraction * CIRCUMFERENCE;
              const circle = (
                <circle
                  key={segment.key}
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke={segment.color}
                  strokeWidth="14"
                  strokeDasharray={`${length} ${CIRCUMFERENCE - length}`}
                  strokeDashoffset={-offsetAccum}
                  transform="rotate(-90 50 50)"
                  strokeLinecap="butt"
                />
              );
              offsetAccum += length;
              return circle;
            })}
          </svg>
          <div className="donut__center">
            <span className="donut__value">{total}</span>
            <span className="donut__label">Total Damages</span>
          </div>
        </div>

        <ul className="breakdown-legend">
          {segments.map((segment) => (
            <li key={segment.key}>
              <span className="breakdown-legend__dot" style={{ background: segment.color }} />
              <span className="breakdown-legend__label">{segment.label}</span>
              <span className="breakdown-legend__count">{segment.value}</span>
              <span className="breakdown-legend__pct">
                {total > 0 ? `${Math.round((segment.value / total) * 100)}%` : "0%"}
              </span>
            </li>
          ))}
          {segments.length === 0 && (
            <li className="state-message">No incidents recorded yet.</li>
          )}
        </ul>
      </div>
    </section>
  );
}
