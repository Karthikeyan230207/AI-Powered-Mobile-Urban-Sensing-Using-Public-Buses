import React, { useState } from "react";
import { DAMAGE_TYPES } from "../utils/damage";
import { IconFilter, IconRefresh } from "./icons";

const TYPE_OPTIONS = Object.keys(DAMAGE_TYPES).filter((key) => key !== "other");
const SEVERITY_OPTIONS = ["critical", "high", "medium", "low"];
const STATUS_OPTIONS = ["pending", "verified", "resolved"];

export default function FilterBar({ onApply, onSortChange, currentSort = "newest" }) {
  const [type, setType] = useState("all");
  const [severity, setSeverity] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState(currentSort);

  const apply = () => {
    const params = {};
    if (type !== "all") params.incident_type = type;
    if (severity !== "all") params.severity = severity;
    if (status !== "all") params.status = status;
    onApply?.(params);
    onSortChange?.(sort);
  };

  const reset = () => {
    setType("all");
    setSeverity("all");
    setStatus("all");
    setSort("newest");
    onApply?.({});
    onSortChange?.("newest");
  };

  const activeCount =
    (type !== "all" ? 1 : 0) +
    (severity !== "all" ? 1 : 0) +
    (status !== "all" ? 1 : 0);

  return (
    <div className="filter-bar">
      <div className="filter-bar__filters">
        <label>
          <span>Incident Type</span>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="all">All types</option>
            {TYPE_OPTIONS.map((key) => (
              <option key={key} value={key}>
                {DAMAGE_TYPES[key].label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Severity</span>
          <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
            <option value="all">All severities</option>
            {SEVERITY_OPTIONS.map((key) => (
              <option key={key} value={key}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All statuses</option>
            {STATUS_OPTIONS.map((key) => (
              <option key={key} value={key}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Sort By</span>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              onSortChange?.(e.target.value);
            }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="severity">Highest Severity</option>
            <option value="priority">Priority Score</option>
            <option value="confidence">Confidence (High to Low)</option>
          </select>
        </label>
      </div>

      <div className="filter-bar__actions">
        <button type="button" className="secondary-button" onClick={apply}>
          <IconFilter size={13} />
          <span>Apply Filters {activeCount > 0 ? `(${activeCount})` : ""}</span>
        </button>

        <button type="button" className="text-button" onClick={reset}>
          <IconRefresh size={12} /> Reset
        </button>
      </div>
    </div>
  );
}
