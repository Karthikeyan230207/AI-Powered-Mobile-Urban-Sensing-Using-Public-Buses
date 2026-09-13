import { useCallback, useEffect, useState } from "react";
import { getIncidents } from "../services/api";
import useIncidentWebSocket from "./useIncidentWebSocket";

export default function useIncidents(filters = {}) {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --------------------------------------------------
  // Initial incidents from REST API
  // --------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    async function loadIncidents() {
      try {
        setLoading(true);
        setError(null);

        const data = await getIncidents(filters);

        if (!cancelled) {
          setIncidents(data);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Incident API error:", err);
          setError(err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadIncidents();

    return () => {
      cancelled = true;
    };
  }, [
    filters.status,
    filters.severity,
    filters.incident_type
  ]);

  // --------------------------------------------------
  // Receive new incident from M6 WebSocket
  // --------------------------------------------------

  const handleNewIncident = useCallback((newIncident) => {
    console.log("[M5] New incident received:", newIncident);

    setIncidents((currentIncidents) => {
      // Prevent duplicate incident
      const alreadyExists = currentIncidents.some(
        (incident) => incident.id === newIncident.id
      );

      if (alreadyExists) {
        return currentIncidents;
      }

      return [newIncident, ...currentIncidents];
    });
  }, []);

  useIncidentWebSocket(handleNewIncident);

  return {
    incidents,
    loading,
    error
  };
}