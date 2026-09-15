import React from "react";
import { IconCheckCircle } from "./icons";

const CIRCUMFERENCE = 2 * Math.PI * 42;

export default function RepairProgressCard({
  total = 0,
  repaired = 0,
  pending = 0,
  improvement = 0,
}) {
  const pct = total > 0 ? Math.round((repaired / total) * 100) : 0;
  const length = (pct / 100) * CIRCUMFERENCE;

  return (
    <section className="panel repair-card">
      <div className="panel__header">
        <div className="panel__title">
          <IconCheckCircle size={18} />
          <div>
            <h2>Resolution & Repair Progress</h2>
            <span className="panel__subtitle">Fleet maintenance work order status</span>
          </div>
        </div>
      </div>

      <div className="repair-card__body">
        <div className="donut donut--repair">
          <svg viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="var(--border)"
              strokeWidth="14"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="var(--green)"
              strokeWidth="14"
              strokeDasharray={`${length} ${CIRCUMFERENCE - length}`}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
              style={{ transition: "stroke-dasharray 0.5s ease" }}
            />
          </svg>
          <div className="donut__center">
            <span className="donut__value" style={{ color: "var(--green)" }}>
              {pct}%
            </span>
            <span className="donut__label">
              {repaired} of {total} Fixed
            </span>
          </div>
        </div>

        <ul className="repair-legend">
          <li>
            <span
              className="repair-legend__dot"
              style={{ background: "var(--green)" }}
            />
            <span>Repaired & Closed</span>
            <span className="repair-legend__count">{repaired}</span>
          </li>
          <li>
            <span
              className="repair-legend__dot"
              style={{ background: "var(--orange)" }}
            />
            <span>Pending Action</span>
            <span className="repair-legend__count">{pending}</span>
          </li>
          <li>
            <span
              className="repair-legend__dot"
              style={{ background: "var(--blue)" }}
            />
            <span>Total Recorded</span>
            <span className="repair-legend__count">{total}</span>
          </li>
        </ul>
      </div>

      <div className="repair-card__banner" hidden={total <= 0}>
        <span className="repair-card__banner-icon">
          <IconCheckCircle size={15} strokeWidth={2.4} />
        </span>
        <div>
          <strong>
            {improvement >= 0 ? "+" : ""}
            {improvement}% resolution pace
          </strong>
          <div>compared to previous window</div>
        </div>
      </div>
    </section>
  );
}
