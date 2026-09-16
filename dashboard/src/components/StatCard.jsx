import React from "react";
import { IconWarning, IconCheck, IconClock, IconArrowUp, IconArrowDown } from "./icons";

const ICONS = {
  warning: IconWarning,
  check: IconCheck,
  clock: IconClock,
};

function Sparkline({ points, color }) {
  const width = 74;
  const height = 28;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const step = width / (points.length - 1 || 1);
  const path = points
    .map((value, index) => {
      const x = index * step;
      const y = height - ((value - min) / range) * (height - 4) - 2;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="sparkline" preserveAspectRatio="none">
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function StatCard({
  label,
  value,
  icon = "warning",
  tone = "red",
  trend,
  trendDirection = "down",
  trendNote = "vs last 7 days",
  sparkline,
  loading = false,
}) {
  const Icon = ICONS[icon] || IconWarning;
  const TrendIcon = trendDirection === "up" ? IconArrowUp : IconArrowDown;

  return (
    <article className={`stat-card stat-card--${tone}`}>
      <div className="stat-card__icon">
        <Icon size={18} strokeWidth={2.2} />
      </div>
      <div className="stat-card__label">{label}</div>
      <div className="stat-card__value">{loading ? "—" : value ?? 0}</div>
      <div className="stat-card__foot">
        <div className={`stat-card__trend stat-card__trend--${trendDirection}`}>
          <TrendIcon size={13} strokeWidth={2.6} />
          <span>{trend}</span>
        </div>
        {sparkline && sparkline.length > 0 && <Sparkline points={sparkline} color={`var(--tone-${tone})`} />}
      </div>
      <div className="stat-card__note">{trendNote}</div>
    </article>
  );
}
