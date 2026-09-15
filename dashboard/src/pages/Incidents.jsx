import React, { useCallback, useMemo, useState } from "react";
import FilterBar from "../components/FilterBar";
import IncidentList from "../components/IncidentList";
import IncidentDetails from "../components/IncidentDetails";
import useIncidents from "../hooks/useIncidents";
import {
  createIncident,
  updateIncident,
  deleteIncident,
  getErrorMessage,
} from "../services/api";
import {
  IconPlus,
  IconDownload,
  IconLocate,
  IconSend,
  IconCheckCircle,
} from "../components/icons";
import { DAMAGE_TYPES, normalizeSeverity } from "../utils/damage";
import { downloadCSV, downloadJSON } from "../utils/export";

const EMPTY_FORM = {
  incident_type: "pothole",
  severity: "medium",
  confidence: "0.92",
  latitude: "13.0827",
  longitude: "80.2707",
  bus_number: "TN-01-AB-1234",
  description: "",
};

const SEVERITY_OPTIONS = ["critical", "high", "medium", "low"];
const TYPE_OPTIONS = Object.keys(DAMAGE_TYPES).filter((key) => key !== "other");

const SAMPLE_PRESETS = [
  {
    name: "Anna Salai Pothole (Critical)",
    data: {
      incident_type: "pothole",
      severity: "critical",
      confidence: "0.95",
      latitude: "13.0604",
      longitude: "80.2496",
      bus_number: "TN-01-AS-4412",
      description: "Severe 30cm pothole near Spencer Plaza, bus lane obstructed.",
    },
  },
  {
    name: "Guindy Road Crack (High)",
    data: {
      incident_type: "crack",
      severity: "high",
      confidence: "0.89",
      latitude: "13.0067",
      longitude: "80.2023",
      bus_number: "TN-09-GD-8812",
      description: "Transverse longitudinal road cracking along GST road overpass.",
    },
  },
  {
    name: "T. Nagar Waterlogging (Medium)",
    data: {
      incident_type: "waterlogging",
      severity: "medium",
      confidence: "0.91",
      latitude: "13.0418",
      longitude: "80.2341",
      bus_number: "TN-02-TN-1055",
      description: "Waterlogging at Usman Road underpass after morning rain.",
    },
  },
  {
    name: "OMR Surface Damage (High)",
    data: {
      incident_type: "surface_damage",
      severity: "high",
      confidence: "0.94",
      latitude: "12.9165",
      longitude: "80.2285",
      bus_number: "TN-14-OM-9901",
      description: "Asphalt raveling and patch degradation near Sholinganallur junction.",
    },
  },
];

const SEVERITY_WEIGHTS = { critical: 4, high: 3, medium: 2, low: 1, unknown: 0 };

export default function Incidents({ searchQuery = "" }) {
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState("newest");
  const {
    incidents,
    loading,
    error,
    refresh,
    prependIncident,
    patchIncident,
    removeIncident,
  } = useIncidents(filters);

  const [selected, setSelected] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [actionBusy, setActionBusy] = useState(false);

  // Form State
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState(null);
  const [formBusy, setFormBusy] = useState(false);
  const [formOk, setFormOk] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [locating, setLocating] = useState(false);

  const applyFilters = useCallback((params) => {
    setFilters(params);
    setSelected(null);
  }, []);

  // Search & Sorting Filter
  const visibleIncidents = useMemo(() => {
    let result = [...incidents];
    const q = searchQuery.trim().toLowerCase();

    if (q) {
      result = result.filter((incident) =>
        [
          incident.incident_type,
          incident.description,
          incident.bus_number,
          incident.status,
          incident.severity,
          incident.id,
        ].some((value) => value != null && String(value).toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      if (sortBy === "newest") {
        return (new Date(b.detected_at || 0).getTime() || b.id) - (new Date(a.detected_at || 0).getTime() || a.id);
      }
      if (sortBy === "oldest") {
        return (new Date(a.detected_at || 0).getTime() || a.id) - (new Date(b.detected_at || 0).getTime() || b.id);
      }
      if (sortBy === "severity") {
        const sa = SEVERITY_WEIGHTS[normalizeSeverity(a.severity)] || 0;
        const sb = SEVERITY_WEIGHTS[normalizeSeverity(b.severity)] || 0;
        return sb - sa;
      }
      if (sortBy === "priority") {
        return Number(b.priority_score || 0) - Number(a.priority_score || 0);
      }
      if (sortBy === "confidence") {
        return Number(b.confidence || 0) - Number(a.confidence || 0);
      }
      return 0;
    });

    return result;
  }, [incidents, searchQuery, sortBy]);

  // Status Action Handlers
  const handleUpdateStatus = async (newStatus, isVerified = false) => {
    if (!selected) return;
    setActionError(null);
    setActionBusy(true);

    try {
      const payload = {
        status: newStatus,
        verified: isVerified || newStatus === "verified" || newStatus === "resolved",
      };
      const updated = await updateIncident(selected.id, payload);
      patchIncident(selected.id, updated);
      setSelected(updated);
    } catch (err) {
      setActionError(getErrorMessage(err, "Failed to update incident status."));
    } finally {
      setActionBusy(false);
    }
  };

  const handleDeleteIncident = async () => {
    if (!selected) return;
    if (!window.confirm(`Are you sure you want to permanently delete incident #${selected.id}?`)) {
      return;
    }
    setActionError(null);
    setActionBusy(true);

    try {
      await deleteIncident(selected.id);
      removeIncident(selected.id);
      setSelected(null);
    } catch (err) {
      setActionError(getErrorMessage(err, "Failed to delete incident."));
    } finally {
      setActionBusy(false);
    }
  };

  const updateForm = (key) => (event) => setForm({ ...form, [key]: event.target.value });

  const applyPreset = (preset) => {
    setForm({ ...EMPTY_FORM, ...preset.data });
    setFormError(null);
    setFormOk(null);
  };

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setFormError("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
        setLocating(false);
      },
      () => {
        setFormError("Could not retrieve your GPS location. Please check location permissions.");
        setLocating(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const submitCreate = async (event) => {
    event.preventDefault();
    setFormError(null);
    setFormOk(null);

    const payload = {
      incident_type: form.incident_type,
      severity: form.severity,
      confidence: Number(form.confidence),
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
      bus_number: form.bus_number.trim() || null,
      description: form.description.trim() || null,
      status: "pending",
      verified: false,
    };

    if (!Number.isFinite(payload.latitude) || !Number.isFinite(payload.longitude)) {
      setFormError("Latitude and longitude must be valid floating numbers.");
      return;
    }
    if (!Number.isFinite(payload.confidence) || payload.confidence < 0 || payload.confidence > 1) {
      setFormError("Confidence must be a number between 0 and 1.");
      return;
    }

    setFormBusy(true);
    try {
      const created = await createIncident(payload);
      prependIncident(created);
      setSelected(created);
      setForm(EMPTY_FORM);
      setFormOk("Incident reported successfully! Broadcasted live to all command displays.");
    } catch (err) {
      setFormError(getErrorMessage(err, "Could not report the incident."));
    } finally {
      setFormBusy(false);
    }
  };

  return (
    <div className="dashboard-page incidents-page">
      <div className="page-header-row">
        <div>
          <p className="eyebrow">Operations & Dispatch</p>
          <h1 className="page-title">Road Damage Incidents</h1>
        </div>

        <div className="page-header-actions">
          <button
            type="button"
            className="secondary-button secondary-button--outline"
            onClick={() => downloadCSV(visibleIncidents, `incidents_export_${Date.now()}.csv`)}
            disabled={visibleIncidents.length === 0}
            title="Export filtered records to CSV"
          >
            <IconDownload size={14} /> Export CSV
          </button>

          <button
            type="button"
            className="action-button action-button--primary"
            onClick={() => setFormOpen((v) => !v)}
          >
            <IconPlus size={14} /> {formOpen ? "Close Form" : "Report Incident"}
          </button>
        </div>
      </div>

      {formOpen && (
        <section className="panel create-incident-panel">
          <div className="panel__header">
            <div className="panel__title">
              <IconPlus size={17} />
              <div>
                <h2>Report New Road Damage</h2>
                <span className="panel__subtitle">
                  Creates database record & triggers WebSocket broadcast
                </span>
              </div>
            </div>
            <button
              type="button"
              className="text-button"
              onClick={() => setFormOpen(false)}
            >
              Cancel
            </button>
          </div>

          <div className="preset-row">
            <span className="preset-label">Quick Test Presets:</span>
            {SAMPLE_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                className="preset-btn"
                onClick={() => applyPreset(preset)}
              >
                {preset.name}
              </button>
            ))}
          </div>

          <form className="incident-form" onSubmit={submitCreate}>
            <label>
              <span>Incident Type</span>
              <select value={form.incident_type} onChange={updateForm("incident_type")}>
                {TYPE_OPTIONS.map((key) => (
                  <option key={key} value={key}>
                    {DAMAGE_TYPES[key].label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Severity</span>
              <select value={form.severity} onChange={updateForm("severity")}>
                {SEVERITY_OPTIONS.map((key) => (
                  <option key={key} value={key}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Latitude</span>
              <input
                type="number"
                step="any"
                value={form.latitude}
                onChange={updateForm("latitude")}
                required
              />
            </label>

            <label>
              <span>Longitude</span>
              <div className="input-with-action">
                <input
                  type="number"
                  step="any"
                  value={form.longitude}
                  onChange={updateForm("longitude")}
                  required
                />
                <button
                  type="button"
                  className="input-addon-btn"
                  onClick={handleDetectGPS}
                  title="Detect Device GPS"
                  disabled={locating}
                >
                  <IconLocate size={14} /> {locating ? "Locating…" : "My GPS"}
                </button>
              </div>
            </label>

            <label>
              <span>AI Confidence (0.0 to 1.0)</span>
              <input
                type="number"
                step="0.01"
                min="0.1"
                max="1.0"
                value={form.confidence}
                onChange={updateForm("confidence")}
                required
              />
            </label>

            <label>
              <span>Bus Fleet Number</span>
              <input
                type="text"
                value={form.bus_number}
                onChange={updateForm("bus_number")}
                placeholder="e.g. TN-01-AN-4412"
              />
            </label>

            <label className="incident-form__wide">
              <span>Location / Description Note</span>
              <input
                type="text"
                value={form.description}
                onChange={updateForm("description")}
                placeholder="e.g. Deep pothole on right lane near bus shelter"
              />
            </label>

            {formError && (
              <div className="action-error incident-form__wide" role="alert">
                {formError}
              </div>
            )}
            {formOk && (
              <div className="action-ok incident-form__wide" role="status">
                <IconCheckCircle size={15} /> {formOk}
              </div>
            )}

            <div className="incident-form__wide form-actions">
              <button
                type="submit"
                className="action-button action-button--primary"
                disabled={formBusy}
              >
                <IconSend size={14} /> {formBusy ? "Submitting…" : "Broadcast Incident"}
              </button>
            </div>
          </form>
        </section>
      )}

      <FilterBar
        onApply={applyFilters}
        onSortChange={setSortBy}
        currentSort={sortBy}
      />

      <div className="incidents-layout">
        <IncidentList
          incidents={visibleIncidents}
          loading={loading}
          error={error}
          selectedId={selected?.id}
          onSelect={setSelected}
          onRetry={refresh}
          initialPageSize={10}
          emptyMessage="No incidents match the selected filters or search query."
        />

        <div className="incidents-side">
          {selected ? (
            <IncidentDetails
              incident={selected}
              onClose={() => setSelected(null)}
              onUpdateStatus={handleUpdateStatus}
              onDelete={handleDeleteIncident}
              actionBusy={actionBusy}
              actionError={actionError}
            />
          ) : (
            <div className="panel state-message state-message--panel">
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>📋</div>
              <strong>Select an Incident</strong>
              <p>
                Click any incident card from the log or map to inspect details,
                verify detections, mark repairs resolved, or copy coordinates.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}