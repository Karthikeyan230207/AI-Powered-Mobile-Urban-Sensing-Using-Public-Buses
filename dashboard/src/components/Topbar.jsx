import React, { useState } from "react";
import {
  IconSearch,
  IconCalendar,
  IconBell,
  IconChevronDown,
  IconMenu,
  IconCheck,
  IconGear,
  IconWarning,
} from "./icons";
import { damageMeta, relativeTime } from "../utils/damage";

const DATE_RANGES = [
  { key: "all", label: "All Available Time" },
  { key: "today", label: "Today" },
  { key: "7days", label: "Last 7 Days" },
  { key: "30days", label: "Last 30 Days" },
];

export default function Topbar({
  user = { name: "Kannan", role: "Admin" },
  notificationCount = 0,
  recentAlerts = [],
  live = true,
  onSearch,
  onToggleMobileMenu,
  onSelectAlert,
  onClearAlerts,
  dateRange = "all",
  onDateRangeChange,
}) {
  const [query, setQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDateMenu, setShowDateMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentRole, setCurrentRole] = useState(user.role || "Admin");

  const handleSearch = (value) => {
    setQuery(value);
    onSearch?.(value);
  };

  const currentDateLabel =
    DATE_RANGES.find((r) => r.key === dateRange)?.label || "All Time";

  return (
    <header className="topbar">
      <div className="topbar__left">
        <button
          type="button"
          className="topbar__mobile-toggle"
          onClick={onToggleMobileMenu}
          aria-label="Open menu"
        >
          <IconMenu size={20} />
        </button>

        <div className="topbar__search">
          <IconSearch size={16} />
          <input
            type="text"
            placeholder="Search location, bus #, damage type, or ID…"
            aria-label="Search"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {query && (
            <button
              type="button"
              className="topbar__search-clear"
              onClick={() => handleSearch("")}
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="topbar__right">
        {/* Live / Offline Status */}
        <span
          className={`live-badge${live ? "" : " live-badge--off"}`}
          title={live ? "WebSocket & API connected" : "Server disconnected"}
        >
          <span className="live-badge__dot" />
          {live ? "Live Sensing" : "Offline"}
        </span>

        {/* Date Range Dropdown */}
        <div className="topbar-dropdown-wrap">
          <button
            type="button"
            className="date-range"
            onClick={() => {
              setShowDateMenu((v) => !v);
              setShowNotifications(false);
              setShowProfileMenu(false);
            }}
          >
            <IconCalendar size={15} />
            <span>{currentDateLabel}</span>
            <IconChevronDown size={13} />
          </button>

          {showDateMenu && (
            <div
              className="topbar-popover date-popover"
              onMouseLeave={() => setShowDateMenu(false)}
            >
              <div className="popover-header">Select Time Window</div>
              {DATE_RANGES.map((range) => (
                <button
                  key={range.key}
                  type="button"
                  className={`popover-item${dateRange === range.key ? " popover-item--active" : ""}`}
                  onClick={() => {
                    onDateRangeChange?.(range.key);
                    setShowDateMenu(false);
                  }}
                >
                  <span>{range.label}</span>
                  {dateRange === range.key && <IconCheck size={14} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification Bell with Dropdown Popover */}
        <div className="topbar-dropdown-wrap">
          <button
            type="button"
            className="icon-button"
            aria-label="Notifications"
            onClick={() => {
              setShowNotifications((v) => !v);
              setShowDateMenu(false);
              setShowProfileMenu(false);
            }}
          >
            <IconBell size={18} />
            {notificationCount > 0 && (
              <span className="icon-button__badge">{notificationCount}</span>
            )}
          </button>

          {showNotifications && (
            <div
              className="topbar-popover notification-popover"
              onMouseLeave={() => setShowNotifications(false)}
            >
              <div className="popover-header">
                <span>Real-Time Incident Alerts</span>
                {notificationCount > 0 && onClearAlerts && (
                  <button
                    type="button"
                    className="popover-clear-btn"
                    onClick={() => {
                      onClearAlerts();
                      setShowNotifications(false);
                    }}
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="notification-list">
                {recentAlerts.length > 0 ? (
                  recentAlerts.slice(0, 6).map((alert, idx) => {
                    const meta = damageMeta(alert.incident_type);
                    return (
                      <div
                        key={alert.id || idx}
                        className="notification-item"
                        onClick={() => {
                          onSelectAlert?.(alert);
                          setShowNotifications(false);
                        }}
                      >
                        <span
                          className="notification-item__dot"
                          style={{ background: meta.color }}
                        />
                        <div className="notification-item__body">
                          <strong>{meta.label} Detected</strong>
                          <p>{alert.description || `Bus ${alert.bus_number || "Alert"}`}</p>
                          <span className="notification-item__time">
                            {relativeTime(alert.detected_at)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="popover-empty">
                    <IconCheck size={20} />
                    <span>No unread incident alerts</span>
                  </div>
                )}
              </div>

              <a
                href="#/incidents"
                className="popover-footer"
                onClick={() => setShowNotifications(false)}
              >
                View Complete Incidents Log →
              </a>
            </div>
          )}
        </div>

        {/* Profile Popover */}
        <div className="topbar-dropdown-wrap">
          <div
            className="profile"
            onClick={() => {
              setShowProfileMenu((v) => !v);
              setShowNotifications(false);
              setShowDateMenu(false);
            }}
            role="button"
            tabIndex={0}
          >
            <div className="profile__avatar">{user.name?.[0] || "K"}</div>
            <div className="profile__meta">
              <div className="profile__name">{user.name}</div>
              <div className="profile__role">{currentRole}</div>
            </div>
            <IconChevronDown size={12} style={{ color: "var(--text-muted)" }} />
          </div>

          {showProfileMenu && (
            <div
              className="topbar-popover profile-popover"
              onMouseLeave={() => setShowProfileMenu(false)}
            >
              <div className="profile-popover__user">
                <strong>{user.name}</strong>
                <span>Urban Transit Control Room</span>
              </div>

              <div className="profile-popover__section">
                <span className="profile-popover__label">Active Role:</span>
                <select
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value)}
                  className="role-switcher"
                >
                  <option value="Admin">Admin (Full Access)</option>
                  <option value="Traffic Controller">Traffic Operations</option>
                  <option value="Field Engineer">Field Maintenance</option>
                </select>
              </div>

              <a
                href="#/settings"
                className="profile-popover__link"
                onClick={() => setShowProfileMenu(false)}
              >
                <IconGear size={14} /> System Settings
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
