import React, { useState } from "react";
import {
  damageMeta,
  isRepaired,
  relativeTime,
  severityLabel,
} from "../utils/damage";
import {
  IconCheck,
  IconTrash,
  IconMapPin,
  IconExternalLink,
  IconCopy,
  IconCamera,
  IconX,
  IconCheckCircle,
} from "./icons";

export default function IncidentDetails({
  incident,
  onClose,
  onUpdateStatus,
  onDelete,
  actionBusy = false,
  actionError = null,
}) {
  const [copied, setCopied] = useState(false);

  if (!incident) return null;

  const meta = damageMeta(incident.incident_type);
  const repaired = isRepaired(incident);

  const copyCoords = () => {
    if (incident.latitude && incident.longitude) {
      navigator.clipboard?.writeText?.(
        `${incident.latitude}, ${incident.longitude}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const currentStatus = String(incident.status || "pending").toLowerCase();

  return (
    <section className="panel incident-details">
      <div className="panel__header">
        <div className="panel__title">
          <span
            className="incident-details__dot"
            style={{ background: meta.color }}
          />
          <div>
            <h2>{meta.label} Defect</h2>
            <span className="panel__subtitle">Incident #{incident.id}</span>
          </div>
        </div>

        <button
          type="button"
          className="icon-button"
          onClick={onClose}
          aria-label="Close details"
          title="Close details"
        >
          <IconX size={16} />
        </button>
      </div>

      {actionError && (
        <div className="action-error" role="alert">
          {actionError}
        </div>
      )}

      {incident.image_url ? (
        <div className="incident-details__image-wrap">
          <img
            src={incident.image_url}
            alt={`${meta.label} preview`}
            className="incident-details__image"
          />
        </div>
      ) : (
        <div className="incident-details__no-image">
          <IconCamera size={22} />
          <span>No Dashcam Photo Snapshot</span>
        </div>
      )}

      <dl className="incident-details__meta">
        {incident.description && (
          <div className="incident-details__description">
            <dt>Description</dt>
            <dd>{incident.description}</dd>
          </div>
        )}

        <div>
          <dt>Status</dt>
          <dd>
            <span
              className={`status-pill ${
                repaired ? "status-pill--repaired" : "status-pill--pending"
              }`}
            >
              {repaired ? "Resolved / Fixed" : currentStatus}
            </span>
          </dd>
        </div>

        <div>
          <dt>Severity</dt>
          <dd>
            <span
              className="severity"
              style={{
                color: meta.color,
                background: meta.light,
                fontWeight: 700,
              }}
            >
              {severityLabel(incident.severity)}
            </span>
          </dd>
        </div>

        <div>
          <dt>Priority Score</dt>
          <dd>
            <strong style={{ fontSize: "14px", color: "var(--text-primary)" }}>
              {incident.priority_score != null
                ? `${Math.round(Number(incident.priority_score))} / 100`
                : "Standard"}
            </strong>
          </dd>
        </div>

        <div>
          <dt>Bus ID</dt>
          <dd>{incident.bus_number || "Fixed Sensor / Manual"}</dd>
        </div>

        <div>
          <dt>AI Confidence</dt>
          <dd>
            {incident.confidence != null
              ? `${Math.round(Number(incident.confidence) * 100)}%`
              : "—"}
          </dd>
        </div>

        <div>
          <dt>Verified by Crew</dt>
          <dd>
            {incident.verified ? (
              <span style={{ color: "var(--green)", fontWeight: 700 }}>
                ✓ Verified
              </span>
            ) : (
              <span style={{ color: "var(--text-muted)" }}>Pending Verification</span>
            )}
          </dd>
        </div>

        <div>
          <dt>Detection Timestamp</dt>
          <dd>{relativeTime(incident.detected_at)}</dd>
        </div>

        <div className="incident-details__coords">
          <dt>GPS Coordinates</dt>
          <dd>
            {incident.latitude != null && incident.longitude != null ? (
              <div className="coords-row">
                <span>
                  {Number(incident.latitude).toFixed(5)},{" "}
                  {Number(incident.longitude).toFixed(5)}
                </span>
                <button
                  type="button"
                  className="coords-btn"
                  onClick={copyCoords}
                  title="Copy coordinates to clipboard"
                >
                  <IconCopy size={13} />
                  {copied ? "Copied!" : "Copy"}
                </button>
                <a
                  href={`https://www.google.com/maps?q=${incident.latitude},${incident.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="coords-btn"
                  title="Open in Google Maps"
                >
                  <IconExternalLink size={13} />
                  Maps
                </a>
              </div>
            ) : (
              "—"
            )}
          </dd>
        </div>
      </dl>

      {/* Lifecycle Actions */}
      {(onUpdateStatus || onDelete) && (
        <div className="incident-details__actions">
          <p className="actions-title">Incident Operations</p>
          <div className="incident-details__action-buttons">
            {!incident.verified && onUpdateStatus && (
              <button
                type="button"
                className="action-button"
                disabled={actionBusy}
                onClick={() => onUpdateStatus("verified", true)}
              >
                <IconCheck size={14} /> Mark Verified
              </button>
            )}

            {!repaired && onUpdateStatus && (
              <button
                type="button"
                className="action-button action-button--resolve"
                disabled={actionBusy}
                onClick={() => onUpdateStatus("resolved", incident.verified)}
              >
                <IconCheckCircle size={14} /> Mark Resolved / Repaired
              </button>
            )}

            {repaired && onUpdateStatus && (
              <button
                type="button"
                className="action-button"
                disabled={actionBusy}
                onClick={() => onUpdateStatus("pending", incident.verified)}
              >
                Reopen Incident
              </button>
            )}

            {onDelete && (
              <button
                type="button"
                className="action-button action-button--danger"
                disabled={actionBusy}
                onClick={onDelete}
              >
                <IconTrash size={14} /> Delete Record
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
