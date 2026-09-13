import React, { useState } from "react";
import { IconSearch, IconCalendar, IconBell, IconChevronDown } from "./icons";

function formatToday() {
  const today = new Date();
  return today.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function Topbar({
  user = { name: "Kannan", role: "Admin" },
  notificationCount = 0,
  live = true,
  onSearch,
}) {
  const [query, setQuery] = useState("");
  const todayLabel = formatToday();

  const handleSearch = (value) => {
    setQuery(value);
    onSearch?.(value);
  };

  return (
    <header className="topbar">
      <div className="topbar__search">
        <IconSearch size={16} />
        <input
          type="text"
          placeholder="Search location, road, or incident..."
          aria-label="Search"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      <div className="topbar__right">
        <span className={`live-badge${live ? "" : " live-badge--off"}`}>
          <span className="live-badge__dot" />
          {live ? "Live Data" : "Offline"}
        </span>

        <button type="button" className="date-range" title="All available time range">
          <IconCalendar size={15} />
          <span>{todayLabel} – {todayLabel}</span>
          <IconChevronDown size={14} />
        </button>

        <button type="button" className="icon-button" aria-label="Notifications">
          <IconBell size={18} />
          {notificationCount > 0 && <span className="icon-button__badge">{notificationCount}</span>}
        </button>

        <div className="profile">
          <div className="profile__avatar">{user.name?.[0] || "U"}</div>
          <div className="profile__meta">
            <div className="profile__name">{user.name}</div>
            <div className="profile__role">{user.role}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
