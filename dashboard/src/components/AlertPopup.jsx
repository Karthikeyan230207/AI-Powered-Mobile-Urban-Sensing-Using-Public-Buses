import React from "react";
import { IconWarning, IconX } from "./icons";

export default function AlertPopup({
  alert,
  onDismiss,
  onInspect,
}) {
  if (!alert) return null;

  const title = typeof alert === "string" ? "Live Sensing Alert" : alert.title || "Live Defect Alert";
  const message = typeof alert === "string" ? alert : alert.message;
  const incident = typeof alert === "object" ? alert.incident : null;

  return (
    <aside className="alert-popup" role="status" aria-live="polite">
      <div className="alert-popup__icon">
        <IconWarning size={16} />
      </div>

      <div
        className="alert-popup__content"
        onClick={() => {
          if (incident && onInspect) {
            onInspect(incident);
          }
        }}
        style={{ cursor: incident && onInspect ? "pointer" : "default" }}
      >
        <div className="alert-popup__top">
          <strong>{title}</strong>
          <span className="alert-popup__live-tag">LIVE</span>
        </div>
        <p>{message}</p>
        {incident && onInspect && (
          <span className="alert-popup__cta">Click to inspect on map →</span>
        )}
      </div>

      {onDismiss && (
        <button
          type="button"
          className="alert-popup__close"
          aria-label="Dismiss alert"
          title="Dismiss alert"
          onClick={onDismiss}
        >
          <IconX size={14} />
        </button>
      )}
    </aside>
  );
}
