import React from "react";
import { IconMapPin, IconArrowRight } from "./icons";

export default function TopLocationsCard({ locations = [] }) {
  return (
    <section className="panel top-locations">
      <div className="panel__header">
        <div className="panel__title">
          <IconMapPin size={16} />
          <h2>Top Locations</h2>
        </div>
        <a className="panel__link" href="#/incidents">
          View All <IconArrowRight size={13} />
        </a>
      </div>

      <ol className="top-locations__list">
        {locations.map((item, index) => (
          <li key={item.name}>
            <span className="top-locations__rank">{index + 1}</span>
            <span className="top-locations__name">{item.name}</span>
            <span className="top-locations__count">{item.count}</span>
          </li>
        ))}
        {locations.length === 0 && <li className="state-message">No location data yet.</li>}
      </ol>
    </section>
  );
}
