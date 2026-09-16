import React from "react";
import { IconMapPin, IconArrowRight } from "./icons";

export default function TopLocationsCard({ locations = [], onLocationClick }) {
  return (
    <section className="panel top-locations">
      <div className="panel__header">
        <div className="panel__title">
          <IconMapPin size={17} />
          <div>
            <h2>Top Incident Hotspots</h2>
            <span className="panel__subtitle">Areas with highest defect density</span>
          </div>
        </div>
        <a className="panel__link" href="#/incidents">
          View Log <IconArrowRight size={13} />
        </a>
      </div>

      <ol className="top-locations__list">
        {locations.map((item, index) => (
          <li
            key={item.name}
            className="top-locations__item"
            onClick={() => onLocationClick?.(item.name)}
            style={{ cursor: onLocationClick ? "pointer" : "default" }}
            title={onLocationClick ? `Filter by ${item.name}` : undefined}
          >
            <span className="top-locations__rank">{index + 1}</span>
            <span className="top-locations__name">{item.name}</span>
            <span className="top-locations__count">{item.count} defects</span>
          </li>
        ))}
        {locations.length === 0 && (
          <li className="state-message">No location hotspot data yet.</li>
        )}
      </ol>
    </section>
  );
}
