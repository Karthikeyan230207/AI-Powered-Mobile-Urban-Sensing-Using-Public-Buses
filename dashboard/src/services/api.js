import axios from "axios";

/**
 * Centralized API client for the SmartBusSense FastAPI backend.
 *
 * Base URL comes from VITE_API_URL (.env) and falls back to the local
 * development backend. All requests time out so the UI never hangs forever.
 */

const DEFAULT_TIMEOUT_MS = 10000;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
  timeout: DEFAULT_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Convert any thrown error into a human-readable message the UI can render.
 * Handles timeouts, network failures, FastAPI `detail` payloads and common
 * HTTP status codes. Never throws, never leaks sensitive internals.
 */
export function getErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  if (!error) return fallback;

  if (error.isAxiosError) {
    const status = error.response?.status;
    const detail = error.response?.data?.detail;

    if (typeof detail === "string" && detail.trim()) return detail;
    if (Array.isArray(detail) && detail.length > 0) {
      // FastAPI validation errors: [{ loc, msg, type }, ...]
      return detail.map((item) => item?.msg || JSON.stringify(item)).join(", ");
    }
    if (!error.response) {
      if (error.code === "ECONNABORTED") return "Request timed out. The backend may be overloaded.";
      return "Cannot reach the API server. Check that the backend is running.";
    }
    if (status === 401) return "Unauthorized. Your session may have expired.";
    if (status === 403) return "You do not have permission to perform this action.";
    if (status === 404) return "The requested resource was not found.";
    if (status >= 500) return "The API server reported an internal error.";
  }

  return error.message || fallback;
}

// ---------------------------------------------------------------------------
// Health & dashboard stats
// ---------------------------------------------------------------------------

export const getHealth = async () => {
  const { data } = await api.get("/health");
  return data;
};

export const getDashboardStats = async () => {
  const { data } = await api.get("/api/dashboard/stats");
  return data;
};

// ---------------------------------------------------------------------------
// Incidents
// ---------------------------------------------------------------------------

/** query filters supported by the backend: status, severity, incident_type */
export const getIncidents = async (params = {}) => {
  const { data } = await api.get("/api/incidents", { params });
  return data;
};

export const getIncident = async (incidentId) => {
  const { data } = await api.get(`/api/incidents/${incidentId}`);
  return data;
};

export const createIncident = async (payload) => {
  const { data } = await api.post("/api/incidents", payload);
  return data;
};

/** payload accepts any subset of { status, severity, verified, priority_score } */
export const updateIncident = async (incidentId, payload) => {
  const { data } = await api.put(`/api/incidents/${incidentId}`, payload);
  return data;
};

export const deleteIncident = async (incidentId) => {
  const { data } = await api.delete(`/api/incidents/${incidentId}`);
  return data;
};

// ---------------------------------------------------------------------------
// Buses
// ---------------------------------------------------------------------------

export const getBuses = async () => {
  const { data } = await api.get("/api/buses");
  return data;
};

export const getBus = async (busId) => {
  const { data } = await api.get(`/api/buses/${busId}`);
  return data;
};

export const createBus = async (payload) => {
  const { data } = await api.post("/api/buses", payload);
  return data;
};

export const updateBus = async (busId, payload) => {
  const { data } = await api.put(`/api/buses/${busId}`, payload);
  return data;
};

export const deleteBus = async (busId) => {
  const { data } = await api.delete(`/api/buses/${busId}`);
  return data;
};

// ---------------------------------------------------------------------------
// Detections
// ---------------------------------------------------------------------------

export const getDetections = async (params = {}) => {
  const { data } = await api.get("/api/detections", { params });
  return data;
};

export const getDetection = async (detectionId) => {
  const { data } = await api.get(`/api/detections/${detectionId}`);
  return data;
};

export const deleteDetection = async (detectionId) => {
  const { data } = await api.delete(`/api/detections/${detectionId}`);
  return data;
};

// ---------------------------------------------------------------------------
// Realtime WebSocket
// ---------------------------------------------------------------------------

/**
 * Derive the WebSocket URL for live incident events from the configured API
 * URL, e.g. http://127.0.0.1:8000 -> ws://127.0.0.1:8000/ws/incidents.
 */
export function getWebSocketUrl() {
  const base = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");
  return `${base.replace(/^http/i, "ws")}/ws/incidents`;
}

export default api;
