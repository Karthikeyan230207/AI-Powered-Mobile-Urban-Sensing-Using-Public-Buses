import React from "react";

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar__brand">
        <div className="navbar__logo">UI</div>
        <div>
          <div className="navbar__title">URBAN INTELLIGENCE</div>
          <div className="navbar__subtitle">Mobile Sensing Command Center</div>
        </div>
      </div>

      <nav className="navbar__links" aria-label="Main navigation">
        <a className="navbar__link navbar__link--active" href="#/">Dashboard</a>
        <a className="navbar__link" href="#/incidents">Incidents</a>
        <a className="navbar__link" href="#/analytics">Analytics</a>
      </nav>

      <div className="navbar__status">
        <span className="status-dot" />
        System Online
      </div>
    </header>
  );
}
