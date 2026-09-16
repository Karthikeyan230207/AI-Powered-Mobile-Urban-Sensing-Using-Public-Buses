import React from "react";
import {
  IconHome,
  IconWarning,
  IconDocument,
  IconGear,
  IconBus,
  IconX,
} from "./icons";

const NAV_ITEMS = [
  { key: "overview", label: "Overview", icon: IconHome, href: "#/" },
  { key: "incidents", label: "Incidents", icon: IconWarning, href: "#/incidents", hasBadge: true },
  { key: "analytics", label: "Analytics", icon: IconDocument, href: "#/analytics" },
  { key: "settings", label: "Settings", icon: IconGear, href: "#/settings" },
];

export default function Sidebar({
  active = "overview",
  mobileOpen = false,
  onCloseMobile,
  pendingCount = 0,
}) {
  return (
    <>
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar${mobileOpen ? " sidebar--mobile-open" : ""}`}>
        <div className="sidebar__brand">
          <div className="sidebar__logo">
            <IconBus size={20} strokeWidth={2.2} />
          </div>
          <div>
            <div className="sidebar__title">
              Smart<span>Bus</span>Sense
            </div>
            <div className="sidebar__subtitle">AI-Powered Mobile Urban Sensing</div>
          </div>

          {mobileOpen && (
            <button
              type="button"
              className="sidebar__mobile-close"
              onClick={onCloseMobile}
              aria-label="Close menu"
            >
              <IconX size={18} />
            </button>
          )}
        </div>

        <nav className="sidebar__nav" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.key === active;
            return (
              <a
                key={item.key}
                href={item.href}
                className={`sidebar__link${isActive ? " sidebar__link--active" : ""}`}
                aria-current={isActive ? "page" : undefined}
                onClick={onCloseMobile}
              >
                <Icon size={18} strokeWidth={isActive ? 2.4 : 2} />
                <span>{item.label}</span>
                {item.hasBadge && pendingCount > 0 && (
                  <span className="sidebar__badge">{pendingCount}</span>
                )}
              </a>
            );
          })}
        </nav>

        <div className="sidebar__promo">
          <svg viewBox="0 0 200 140" className="sidebar__illustration" aria-hidden="true">
            <rect x="0" y="92" width="200" height="48" fill="#eaf3ff" />
            <rect x="10" y="52" width="18" height="42" rx="2" fill="#cfe3ff" />
            <rect x="34" y="38" width="22" height="56" rx="2" fill="#bcd8ff" />
            <rect x="150" y="46" width="20" height="48" rx="2" fill="#cfe3ff" />
            <rect x="172" y="60" width="16" height="34" rx="2" fill="#bcd8ff" />
            <rect x="0" y="94" width="200" height="6" fill="#dcecff" />
            <g transform="translate(58,70)">
              <rect x="0" y="8" width="86" height="34" rx="8" fill="#2f6fee" />
              <rect x="6" y="14" width="20" height="14" rx="2" fill="#eaf3ff" />
              <rect x="30" y="14" width="20" height="14" rx="2" fill="#eaf3ff" />
              <rect x="54" y="14" width="20" height="14" rx="2" fill="#eaf3ff" />
              <circle cx="16" cy="44" r="6" fill="#1f2937" />
              <circle cx="70" cy="44" r="6" fill="#1f2937" />
            </g>
          </svg>
          <p className="sidebar__tagline">
            Safer Roads
            <br />
            Smarter Cities
            <br />
            Together
          </p>
        </div>

        <div className="sidebar__footer">
          <div className="sidebar__footer-title">SmartBusSense</div>
          <div className="sidebar__footer-subtitle">Autonomous Transit Sensing Network</div>
        </div>
      </aside>
    </>
  );
}
