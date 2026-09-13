import React from "react";

export default function AlertPopup({ message = "New incident detected", onDismiss }) {
  return (
    <div className="alert-popup" role="status">
      <span className="alert-popup__icon">!</span>
      <div>
        <strong>Live Alert</strong>
        <p>{message}</p>
      </div>
      {onDismiss && (
        <button type="button" className="alert-popup__close" aria-label="Dismiss alert" onClick={onDismiss}>
          ×
        </button>
      )}
    </div>
  );
}
