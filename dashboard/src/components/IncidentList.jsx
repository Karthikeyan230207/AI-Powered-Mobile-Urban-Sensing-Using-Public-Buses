import React, { useState } from "react";
import IncidentCard from "./IncidentCard";
import { IconWarning, IconRefresh } from "./icons";

function SkeletonRows() {
  return (
    <>
      {[0, 1, 2, 3, 4].map((row) => (
        <div
          key={row}
          className="incident-card incident-card--skeleton"
          aria-hidden="true"
        >
          <div className="skeleton skeleton--line" style={{ width: "45%" }} />
          <div className="skeleton skeleton--line" style={{ width: "70%" }} />
          <div className="skeleton skeleton--line" style={{ width: "55%" }} />
        </div>
      ))}
    </>
  );
}

export default function IncidentList({
  incidents = [],
  loading = false,
  error = null,
  selectedId = null,
  onSelect,
  onRetry,
  initialPageSize = 10,
  emptyMessage = "No incidents match the criteria.",
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalItems = incidents.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedItems = incidents.slice(startIndex, endIndex);

  return (
    <section className="panel incident-list-panel">
      <div className="panel__header">
        <div className="panel__title">
          <IconWarning size={17} />
          <div>
            <h2>Incident Log</h2>
            <span className="panel__subtitle">
              Showing {totalItems === 0 ? 0 : startIndex + 1}–{endIndex} of {totalItems} incidents
            </span>
          </div>
        </div>

        <div className="list-controls">
          <select
            className="page-size-select"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            aria-label="Items per page"
          >
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="state-message state-message--error">
          <span>{error}</span>
          {onRetry && (
            <button type="button" className="retry-button" onClick={onRetry}>
              <IconRefresh size={12} /> Retry
            </button>
          )}
        </div>
      )}

      {loading && <SkeletonRows />}

      {!loading && !error && totalItems === 0 && (
        <div className="state-message">{emptyMessage}</div>
      )}

      <div className="incident-list">
        {!loading &&
          paginatedItems.map((incident, index) => (
            <IncidentCard
              key={incident.id || incident.incident_id || index}
              incident={incident}
              isSelected={selectedId === incident.id}
              onSelect={onSelect}
            />
          ))}
      </div>

      {!loading && !error && totalPages > 1 && (
        <div className="pagination-bar">
          <button
            type="button"
            className="pagination-btn"
            disabled={safePage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>

          <div className="pagination-pages">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 ||
                  p === totalPages ||
                  (p >= safePage - 1 && p <= safePage + 1)
              )
              .map((p, idx, arr) => {
                const prev = arr[idx - 1];
                return (
                  <React.Fragment key={p}>
                    {prev && p - prev > 1 && <span className="pagination-ellipsis">…</span>}
                    <button
                      type="button"
                      className={`pagination-num${p === safePage ? " pagination-num--active" : ""}`}
                      onClick={() => setCurrentPage(p)}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                );
              })}
          </div>

          <button
            type="button"
            className="pagination-btn"
            disabled={safePage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}
