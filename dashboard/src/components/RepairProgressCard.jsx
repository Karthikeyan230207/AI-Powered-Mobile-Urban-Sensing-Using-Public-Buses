import React from "react";
import { IconCheck, IconGear } from "./icons";

const CIRCUMFERENCE = 2 * Math.PI * 42;

export default function RepairProgressCard({ total = 0, repaired = 0, pending = 0, improvement = 0 }) {
  const pct = total > 0 ? Math.round((repaired / total) * 100) : 0;
  const length = (pct / 100) * CIRCUMFERENCE;

  return (
    <section className="panel repair-card">
      <div className="panel__header">
        <div className="panel__title">
          <IconGear size={16} />
          <h2>Repair Progress</h2>
        </div>
      </div>

      <div className="repair-card__body">
        <div className="donut donut--repair">
          <svg viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#eef1f6" strokeWidth="14" />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="#16a34a"
              strokeWidth="14"
              strokeDasharray={`${length} ${CIRCUMFERENCE - length}`}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div className="donut__center">
            <span className="donut__value">{pct}%</span>
            <span className="donut__label">
              {repaired} of {total} repaired
            </span>
          </div>
        </div>

        <ul className="repair-legend">
          <li>
            <span className="repair-legend__dot" style={{ background: "#16a34a" }} />
            Repaired
            <span className="repair-legend__count">{repaired}</span>
          </li>
          <li>
            <span className="repair-legend__dot" style={{ background: "#f59e0b" }} />
            Pending
            <span className="repair-legend__count">{pending}</span>
          </li>
        </ul>
      </div>

      <div className="repair-card__banner">
        <span className="repair-card__banner-icon">
          <IconCheck size={13} strokeWidth={3} />
        </span>
        <div>
          <strong>{improvement >= 0 ? "+" : ""}{improvement}% improvement in repair rate</strong>
          <div>compared to last 7 days</div>
        </div>
      </div>
    </section>
  );
}
