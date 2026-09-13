import React, { useCallback, useState } from "react";
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
import { IconCheck, IconTrash, IconPlus } from "../components/icons";
import { DAMAGE_TYPES } from "../utils/damage";

const EMPTY_FORM = {
  incident_type: "pothole",
  severity: "medium",
  confidence: "0.90",
  latitude: "13.0827",
  longitude: "80.2707",
  bus_number: "",
  description: "",
};

const SEVERITY_OPTIONS = ["critical", "high", "medium", "low"];
const TYPE_OPTIONS = Object.keys(DAMAGE_TYPES).filter((key) => key !== "other");

export default function Incidents({ searchQuery = "" }) {
  const [filters, setFilters] = useState({});
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
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState(null);
  const [formBusy, setFormBusy] = useState(false);
  const [formOk, setFormOk] = useState(null);
  const [formOpen, setFormOpen] = useState(false);

  const applyFilters = useCallback((params) => {
    setFilters(params);
    setSelected(null);
  }, []);

  const trimmedQuery = searchQuery.trim().toLowerCase();
  const visibleIncidents = trimmedQuery
    ? incidents.filter((incident) =>
        [incident.incident_type, incident.description, incident.bus_number, incident.status, incident.severity]
          .some((value) => value != null && String(value).toLowerCase().includes(trimmedQuery))
      )
    : incidents;

  // ---- selected-incident actions ------------------------------------------

  const runAction = async (fn, onSuccess) => {
    setActionError(null);
    setActionBusy(true);
    try {
      const result = await fn();
      onSuccess?.(result);
    } catch (err) {
      setActionError(getErrorMessage(err, "Action failed."));
    } finally {
      setActionBusy(false);
    }
  };

  const markResolved = () => {
    if (!selected) return;
    runAction(
      () => updateIncident(selected.id, { status: "resolved" }),
      (updated) => {
        patchIncident(selected.id, updated);
        setSelected(updated);
      }
    );
  };

  const markVerified = () => {
    if (!selected) return;
    runAction(
      () => updateIncident(selected.id, { verified: true, status: selected.status === "pending" ? "verified" : selected.status }),
      (updated) => {
        patchIncident(selected.id, updated);
        setSelected(updated);
      }
    );
  };

  const removeSelected = () => {
    if (!selected) return;
    runAction(
      () => deleteIncident(selected.id),
      () => {
        removeIncident(selected.id);
        setSelected(null);
      }
    );
  };

  const updateForm = (key) => (event) => setForm({ ...form, [key]: event.target.value });

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
      setFormError("Latitude and longitude must be valid numbers.");
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
      setForm(EMPTY_FORM);
      setFormOk("Incident reported successfully and added to the live feed.");
    } catch (err) {
      setFormError(getErrorMessage(err, "Could not report the incident."));
    } finally {
      setFormBusy(false);
    }
  };

  return (
    <div className="dashboard-page incidents-page">
      <p className="eyebrow">Operations</p>
      <h1 className="page-title">Incidents</h1>

      <FilterBar onApply={applyFilters} />

      <div className="incidents-layout">
        <IncidentList
          incidents={visibleIncidents}
          loading={loading}
          error={error}
          onRetry={refresh}
          limit={12}
          onSelect={setSelected}
          emptyMessage="No incidents match the current filters."
        />

        <div className="incidents-side">
          {selected ? (
            <>
              <IncidentDetails incident={selected} onClose={() => setSelected(null)} />
              <div className="incident-actions">
                <p className="actions-title">Actions</p>
                {actionError && <div className="action-error" role="alert">{actionError}</div>}
                <button
                  type="button"
                  className="action-button"
                  disabled={actionBusy}
                  onClick={markVerified}
                >
                  <IconCheck size={13} /> Mark verified
                </button>
                <button
                  type="button"
                  className="action-button action-button--resolve"
                  disabled={actionBusy}
                  onClick={markResolved}
                >
                  <IconCheck size={13} /> Mark resolved
                </button>
                <button
                  type="button"
                  className="action-button action-button--danger"
                  disabled={actionBusy}
                  onClick={removeSelected}
                >
                  <IconTrash size={13} /> Delete incident
                </button>
              </div>
            </>
          ) : (
            <div className="state-message">
              Select an incident to view details and run actions (verify, resolve, delete).
            </div>
          )}

          <div className="create-incident">
            <button
              type="button"
              className="action-button action-button--primary"
              onClick={() => setFormOpen((open) => !open)}
            >
              <IconPlus size={13} /> {formOpen ? "Hide form" : "Report new incident"}
            </button>

            {formOpen && (
              <form className="incident-form" onSubmit={submitCreate}>
                <label>
                  <span>Incident type</span>
                  <select value={form.incident_type} onChange={updateForm("incident_type")}>
                    {TYPE_OPTIONS.map((key) => (
                      <option key={key} value={key}>{DAMAGE_TYPES[key].label}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Severity</span>
                  <select value={form.severity} onChange={updateForm("severity")}>
                    {SEVERITY_OPTIONS.map((key) => (
                      <option key={key} value={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Latitude</span>
                  <input type="number" step="any" value={form.latitude} onChange={updateForm("latitude")} required />
                </label>
                <label>
                  <span>Longitude</span>
                  <input type="number" step="any" value={form.longitude} onChange={updateForm("longitude")} required />
                </label>
                <label>
                  <span>Confidence (0–1)</span>
                  <input type="number" step="0.01" min="0" max="1" value={form.confidence} onChange={updateForm("confidence")} required />
                </label>
                <label>
                  <span>Bus number</span>
                  <input type="text" value={form.bus_number} onChange={updateForm("bus_number")} placeholder="e.g. TN-01-AB-1234" />
                </label>
                <label className="incident-form__wide">
                  <span>Description</span>
                  <input type="text" value={form.description} onChange={updateForm("description")} placeholder="Optional note about the defect" />
                </label>
                {formError && <div className="action-error" role="alert">{formError}</div>}
                {formOk && <div className="action-ok" role="status">{formOk}</div>}
                <button type="submit" className="action-button action-button--primary" disabled={formBusy}>
                  {formBusy ? "Submitting…" : "Submit incident"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}