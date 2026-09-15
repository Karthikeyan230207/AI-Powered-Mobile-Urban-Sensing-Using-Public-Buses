import React, { useState } from "react";
import { IconBus, IconPlus, IconTrash, IconSearch, IconX } from "./icons";
import { relativeTime } from "../utils/damage";
import { createBus, updateBus, deleteBus, getErrorMessage } from "../services/api";

const EMPTY_BUS = {
  bus_number: "",
  route: "",
  status: "active",
  last_latitude: "13.0827",
  last_longitude: "80.2707",
};

export default function BusesCard({
  buses = [],
  loading = false,
  error = null,
  onRefresh,
}) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState(EMPTY_BUS);
  const [formBusy, setFormBusy] = useState(false);
  const [formError, setFormError] = useState(null);
  const [actionError, setActionError] = useState(null);

  const activeCount = buses.filter(
    (b) => String(b.status || "").toLowerCase() === "active"
  ).length;

  const filteredBuses = buses.filter((bus) => {
    const statusMatch =
      filterStatus === "all" ||
      String(bus.status || "").toLowerCase() === filterStatus;
    const q = search.trim().toLowerCase();
    const searchMatch =
      !q ||
      String(bus.bus_number || "").toLowerCase().includes(q) ||
      String(bus.route || "").toLowerCase().includes(q);
    return statusMatch && searchMatch;
  });

  const handleStatusChange = async (bus, newStatus) => {
    setActionError(null);
    try {
      await updateBus(bus.id, {
        bus_number: bus.bus_number,
        route: bus.route,
        status: newStatus,
        last_latitude: bus.last_latitude,
        last_longitude: bus.last_longitude,
      });
      onRefresh?.();
    } catch (err) {
      setActionError(getErrorMessage(err, "Failed to update bus status."));
    }
  };

  const handleDeleteBus = async (busId) => {
    if (!window.confirm("Remove this bus from the sensing fleet?")) return;
    setActionError(null);
    try {
      await deleteBus(busId);
      onRefresh?.();
    } catch (err) {
      setActionError(getErrorMessage(err, "Failed to delete bus."));
    }
  };

  const handleCreateBus = async (e) => {
    e.preventDefault();
    setFormError(null);
    if (!form.bus_number.trim()) {
      setFormError("Bus number is required.");
      return;
    }

    setFormBusy(true);
    try {
      await createBus({
        bus_number: form.bus_number.trim(),
        route: form.route.trim() || null,
        status: form.status,
        last_latitude: Number(form.last_latitude) || 13.0827,
        last_longitude: Number(form.last_longitude) || 80.2707,
      });
      setForm(EMPTY_BUS);
      setShowAddModal(false);
      onRefresh?.();
    } catch (err) {
      setFormError(getErrorMessage(err, "Failed to register bus."));
    } finally {
      setFormBusy(false);
    }
  };

  return (
    <section className="panel buses-card">
      <div className="panel__header">
        <div className="panel__title">
          <IconBus size={18} />
          <div>
            <h2>Bus Fleet Management</h2>
            <span className="panel__subtitle">
              {activeCount} active / {buses.length} registered sensing buses
            </span>
          </div>
        </div>

        <button
          type="button"
          className="action-button action-button--primary"
          style={{ width: "auto", padding: "6px 12px" }}
          onClick={() => setShowAddModal(true)}
        >
          <IconPlus size={13} /> Register Bus
        </button>
      </div>

      {actionError && (
        <div className="action-error" role="alert">
          {actionError}
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div className="buses-toolbar">
        <div className="status-tabs">
          {["all", "active", "maintenance", "offline"].map((st) => (
            <button
              key={st}
              type="button"
              className={`status-tab${filterStatus === st ? " status-tab--active" : ""}`}
              onClick={() => setFilterStatus(st)}
            >
              {st.charAt(0).toUpperCase() + st.slice(1)}
            </button>
          ))}
        </div>

        <div className="buses-search">
          <IconSearch size={14} />
          <input
            type="text"
            placeholder="Search bus or route…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="state-message state-message--error">{error}</div>}

      {loading && (
        <div className="skeleton-row" aria-hidden="true">
          <div className="skeleton skeleton--line" style={{ width: "60%" }} />
          <div className="skeleton skeleton--line" style={{ width: "30%" }} />
        </div>
      )}

      {!loading && !error && filteredBuses.length === 0 && (
        <div className="state-message">
          {buses.length === 0
            ? "No buses registered in the sensing network yet."
            : "No buses match your filter query."}
        </div>
      )}

      {!loading && filteredBuses.length > 0 && (
        <div className="bus-table-wrap">
          <table className="bus-table-full">
            <thead>
              <tr>
                <th>Bus Plate #</th>
                <th>Assigned Route</th>
                <th>Status</th>
                <th>Last Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBuses.map((bus) => {
                const statusStr = String(bus.status || "active").toLowerCase();
                return (
                  <tr key={bus.id}>
                    <td className="bus-table__number">{bus.bus_number}</td>
                    <td className="bus-table__route">{bus.route || "—"}</td>
                    <td>
                      <select
                        className={`bus-status-select bus-status--${statusStr}`}
                        value={statusStr}
                        onChange={(e) => handleStatusChange(bus, e.target.value)}
                      >
                        <option value="active">Active</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="offline">Offline</option>
                      </select>
                    </td>
                    <td className="bus-table__seen">{relativeTime(bus.last_seen)}</td>
                    <td>
                      <button
                        type="button"
                        className="table-action-btn table-action-btn--delete"
                        title="Delete Bus"
                        onClick={() => handleDeleteBus(bus.id)}
                      >
                        <IconTrash size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Bus Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <div className="panel__title">
                <IconBus size={18} />
                <h3>Register Bus to Sensing Fleet</h3>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setShowAddModal(false)}
              >
                <IconX size={15} />
              </button>
            </div>

            <form onSubmit={handleCreateBus} className="modal-form">
              <label>
                <span>Bus Number / Plate ID *</span>
                <input
                  type="text"
                  placeholder="e.g. TN-01-AS-5566"
                  value={form.bus_number}
                  onChange={(e) => setForm({ ...form, bus_number: e.target.value })}
                  required
                />
              </label>

              <label>
                <span>Route Description / Number</span>
                <input
                  type="text"
                  placeholder="e.g. Route 21G (Broadway - Tambaram)"
                  value={form.route}
                  onChange={(e) => setForm({ ...form, route: e.target.value })}
                />
              </label>

              <label>
                <span>Initial Status</span>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="active">Active (Dashcam Connected)</option>
                  <option value="maintenance">Maintenance (In Depot)</option>
                  <option value="offline">Offline</option>
                </select>
              </label>

              {formError && <div className="action-error">{formError}</div>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button secondary-button--outline"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="action-button action-button--primary"
                  disabled={formBusy}
                >
                  {formBusy ? "Registering…" : "Register Bus"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}