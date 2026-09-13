import React from "react";

export default function StatCard({ label, value, detail, icon, loading = false }) {
  return (
    <article className="stat-card">
      <div className="stat-card__top">
        <span className="stat-card__icon" aria-hidden="true">{icon}</span>
        <span className="stat-card__label">{label}</span>
      </div>
      <div className="stat-card__value">{loading ? "—" : value ?? 0}</div>
      {detail && <div className="stat-card__detail">{detail}</div>}
    </article>
  );
}
