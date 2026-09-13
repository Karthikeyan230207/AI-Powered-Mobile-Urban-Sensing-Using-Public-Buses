import React from "react";
import { IconGear } from "./icons";

const WIDTH = 300;
const HEIGHT = 160;
const PAD_LEFT = 26;
const PAD_BOTTOM = 22;
const PAD_TOP = 12;

function buildPath(values, max, plotWidth, plotHeight) {
  const step = plotWidth / (values.length - 1 || 1);
  return values
    .map((value, index) => {
      const x = PAD_LEFT + index * step;
      const y = PAD_TOP + plotHeight - (value / (max || 1)) * plotHeight;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export default function DamageTrendsCard({ days = [], detected = [], repaired = [] }) {
  const plotWidth = WIDTH - PAD_LEFT - 10;
  const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const max = Math.max(1, ...detected, ...repaired);
  const niceMax = Math.ceil(max / 10) * 10 || 10;
  const gridLines = 4;

  const detectedPath = buildPath(detected, niceMax, plotWidth, plotHeight);
  const repairedPath = buildPath(repaired, niceMax, plotWidth, plotHeight);
  const step = plotWidth / (days.length - 1 || 1);

  return (
    <section className="panel trends-card">
      <div className="panel__header">
        <div className="panel__title">
          <IconGear size={16} />
          <h2>Damage Trends</h2>
        </div>
        <div className="trends-card__legend">
          <span>
            <span className="dot" style={{ background: "#ef4444" }} /> Detected
          </span>
          <span>
            <span className="dot" style={{ background: "#16a34a" }} /> Repaired
          </span>
        </div>
      </div>

      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="trends-chart">
        {Array.from({ length: gridLines + 1 }).map((_, i) => {
          const y = PAD_TOP + (plotHeight / gridLines) * i;
          const label = Math.round(niceMax - (niceMax / gridLines) * i);
          return (
            <g key={i}>
              <line x1={PAD_LEFT} x2={WIDTH - 10} y1={y} y2={y} stroke="#f0f2f6" strokeWidth="1" />
              <text x={PAD_LEFT - 6} y={y + 3} textAnchor="end" className="trends-chart__axis">
                {label}
              </text>
            </g>
          );
        })}

        {days.map((day, index) => (
          <text
            key={day}
            x={PAD_LEFT + index * step}
            y={HEIGHT - 4}
            textAnchor="middle"
            className="trends-chart__axis"
          >
            {day}
          </text>
        ))}

        <path d={detectedPath} fill="none" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d={repairedPath} fill="none" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

        {detected.map((value, index) => (
          <circle
            key={`d-${index}`}
            cx={PAD_LEFT + index * step}
            cy={PAD_TOP + plotHeight - (value / niceMax) * plotHeight}
            r="2.6"
            fill="#ef4444"
          />
        ))}
        {repaired.map((value, index) => (
          <circle
            key={`r-${index}`}
            cx={PAD_LEFT + index * step}
            cy={PAD_TOP + plotHeight - (value / niceMax) * plotHeight}
            r="2.6"
            fill="#16a34a"
          />
        ))}
      </svg>

      {days.length === 0 && !(detected.length || repaired.length) && (
        <div className="state-message state-message--inset">No incident data for the selected period yet.</div>
      )}
    </section>
  );
}
