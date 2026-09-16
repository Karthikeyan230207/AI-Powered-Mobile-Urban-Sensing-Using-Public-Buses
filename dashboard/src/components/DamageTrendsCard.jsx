import React, { useState } from "react";
import { IconActivity } from "./icons";

const WIDTH = 480;
const HEIGHT = 200;
const PAD_LEFT = 34;
const PAD_BOTTOM = 26;
const PAD_TOP = 16;
const PAD_RIGHT = 16;

function buildPath(values, max, plotWidth, plotHeight) {
  if (!values || values.length === 0) return "";
  const step = plotWidth / (values.length - 1 || 1);
  return values
    .map((value, index) => {
      const x = PAD_LEFT + index * step;
      const y = PAD_TOP + plotHeight - (value / (max || 1)) * plotHeight;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export default function DamageTrendsCard({
  days = [],
  detected = [],
  repaired = [],
  activeRange = 7,
  onRangeChange,
}) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const plotWidth = WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const max = Math.max(1, ...detected, ...repaired);
  const niceMax = Math.ceil(max / 5) * 5 || 5;
  const gridLines = 4;

  const detectedPath = buildPath(detected, niceMax, plotWidth, plotHeight);
  const repairedPath = buildPath(repaired, niceMax, plotWidth, plotHeight);
  const step = plotWidth / (days.length - 1 || 1);

  return (
    <section className="panel trends-card">
      <div className="panel__header">
        <div className="panel__title">
          <IconActivity size={18} />
          <div>
            <h2>Damage vs. Repair Trends</h2>
            <span className="panel__subtitle">Daily detection and resolution timeline</span>
          </div>
        </div>

        <div className="trends-card__header-right">
          {onRangeChange && (
            <div className="trends-range-tabs">
              {[7, 14, 30].map((daysCount) => (
                <button
                  key={daysCount}
                  type="button"
                  className={`range-tab${activeRange === daysCount ? " range-tab--active" : ""}`}
                  onClick={() => onRangeChange(daysCount)}
                >
                  {daysCount}D
                </button>
              ))}
            </div>
          )}

          <div className="trends-card__legend">
            <span className="legend-chip">
              <span className="dot" style={{ background: "var(--red)" }} /> Detected
            </span>
            <span className="legend-chip">
              <span className="dot" style={{ background: "var(--green)" }} /> Repaired
            </span>
          </div>
        </div>
      </div>

      <div className="trends-chart-wrap">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="trends-chart"
          onMouseLeave={() => setHoveredIdx(null)}
        >
          {/* Grid lines */}
          {Array.from({ length: gridLines + 1 }).map((_, i) => {
            const y = PAD_TOP + (plotHeight / gridLines) * i;
            const label = Math.round(niceMax - (niceMax / gridLines) * i);
            return (
              <g key={i}>
                <line
                  x1={PAD_LEFT}
                  x2={WIDTH - PAD_RIGHT}
                  y1={y}
                  y2={y}
                  stroke="var(--border)"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <text
                  x={PAD_LEFT - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  className="trends-chart__axis"
                >
                  {label}
                </text>
              </g>
            );
          })}

          {/* X Axis Labels */}
          {days.map((day, index) => {
            // If many days (e.g. 14 or 30), show subset of labels to prevent overlap
            const skip = days.length > 14 ? 3 : days.length > 7 ? 2 : 1;
            if (index % skip !== 0 && index !== days.length - 1) return null;
            return (
              <text
                key={day + index}
                x={PAD_LEFT + index * step}
                y={HEIGHT - 6}
                textAnchor="middle"
                className="trends-chart__axis"
              >
                {day}
              </text>
            );
          })}

          {/* Lines */}
          <path
            d={detectedPath}
            fill="none"
            stroke="var(--red)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={repairedPath}
            fill="none"
            stroke="var(--green)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points & Hover Target Areas */}
          {days.map((day, index) => {
            const x = PAD_LEFT + index * step;
            const yDet = PAD_TOP + plotHeight - ((detected[index] || 0) / niceMax) * plotHeight;
            const yRep = PAD_TOP + plotHeight - ((repaired[index] || 0) / niceMax) * plotHeight;
            const isHovered = hoveredIdx === index;

            return (
              <g key={index}>
                {/* Hover vertical guide */}
                {isHovered && (
                  <line
                    x1={x}
                    x2={x}
                    y1={PAD_TOP}
                    y2={PAD_TOP + plotHeight}
                    stroke="var(--blue)"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                )}

                <circle
                  cx={x}
                  cy={yDet}
                  r={isHovered ? "5" : "3.5"}
                  fill="var(--red)"
                  stroke="#fff"
                  strokeWidth="1.5"
                />
                <circle
                  cx={x}
                  cy={yRep}
                  r={isHovered ? "5" : "3.5"}
                  fill="var(--green)"
                  stroke="#fff"
                  strokeWidth="1.5"
                />

                {/* Invisible hover trigger area */}
                <rect
                  x={x - step / 2}
                  y={PAD_TOP}
                  width={step}
                  height={plotHeight}
                  fill="transparent"
                  onMouseEnter={() => setHoveredIdx(index)}
                  style={{ cursor: "pointer" }}
                />
              </g>
            );
          })}
        </svg>

        {hoveredIdx !== null && (
          <div
            className="chart-tooltip"
            style={{
              left: `${((PAD_LEFT + hoveredIdx * step) / WIDTH) * 100}%`,
            }}
          >
            <div className="chart-tooltip__date">{days[hoveredIdx]}</div>
            <div className="chart-tooltip__val" style={{ color: "var(--red)" }}>
              Detected: <strong>{detected[hoveredIdx] || 0}</strong>
            </div>
            <div className="chart-tooltip__val" style={{ color: "var(--green)" }}>
              Repaired: <strong>{repaired[hoveredIdx] || 0}</strong>
            </div>
          </div>
        )}
      </div>

      {days.length === 0 && (
        <div className="state-message state-message--inset">
          No incident data recorded for the selected window.
        </div>
      )}
    </section>
  );
}
