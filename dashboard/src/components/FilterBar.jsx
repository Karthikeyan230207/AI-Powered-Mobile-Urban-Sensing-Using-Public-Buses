import { useState } from "react";

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

  return (
    <div className="filter-bar">
      <label>
        <span>Incident type</span>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="all">All types</option>
          <option value="pothole">Pothole</option>
          <option value="crack">Road crack</option>
        </select>
      </label>
      <label>
        <span>Severity</span>
        <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
          <option value="all">All severity</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </label>
      <label>
        <span>Status</span>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All status</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="resolved">Resolved</option>
        </select>
      </label>
      <button className="secondary-button" onClick={apply}>Apply filters</button>
    </div>
  );
}
