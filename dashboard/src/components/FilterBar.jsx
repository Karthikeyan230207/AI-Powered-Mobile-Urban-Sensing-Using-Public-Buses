import React, { useState } from "react";
import { DAMAGE_TYPES } from "../utils/damage";

const TYPE_OPTIONS = Object.keys(DAMAGE_TYPES).filter((key) => key !== "other");
const SEVERITY_OPTIONS = ["critical", "high", "medium", "low"];
const STATUS_OPTIONS = ["pending", "verified", "resolved"];

export default function FilterBar({ onApply }) {
  const [type, setType] = useState("all");
  const [severity, setSeverity] = useState("all");
  const [status, setStatus] = useState("all");

  const apply = () => {
    const params = {};
    if (type !== "all") params.incident_type = type;
    if (severity !== "all") params.severity = severity;
    if (status !== "all") params.status = status;
    onApply?.(params);
  };

  const reset = () => {
    setType("all");
    setSeverity("all");
    setStatus("all");
    onApply?.({});
  };

  return (
    <div className="filter-bar">
      <label>
        <span>Incident type</span>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="all">All types</option>
          {TYPE_OPTIONS.map((key) => (
            <option key={key} value={key}>{DAMAGE_TYPES[key].label}</option>
          ))}
        </select>
      </label>
      <label>
        <span>Severity</span>
        <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
          <option value="all">All severity</option>
          {SEVERITY_OPTIONS.map((key) => (
            <option key={key} value={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</option>
          ))}
        </select>
      </label>
      <label>
        <span>Status</span>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All status</option>
          {STATUS_OPTIONS.map((key) => (
            <option key={key} value={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</option>
          ))}
        </select>
      </label>
      <button type="button" className="secondary-button" onClick={apply}>Apply filters</button>
      <button type="button" className="text-button" onClick={reset}>Reset</button>
    </div>
  );
}
