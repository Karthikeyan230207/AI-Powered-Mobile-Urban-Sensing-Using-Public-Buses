import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getIncidents, getErrorMessage } from "../services/api";

/**
 * Loads incidents from GET /api/incidents and keeps the list in sync with
 * create / update / delete actions and realtime websocket events.
 */
export default function useIncidents(params = {}) {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const paramsKey = useMemo(() => JSON.stringify(params), [params]);
  const paramsRef = useRef(params);
  paramsRef.current = params;

  const loadIncidents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getIncidents(paramsRef.current);
      const items = Array.isArray(data) ? data : data?.incidents || data?.items || [];
      setIncidents(items);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load incidents."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIncidents();
  }, [loadIncidents, paramsKey]);

  // Add a single incident at the top (used after create or websocket event).
  const prependIncident = useCallback((incident) => {
    if (!incident) return;
    setIncidents((current) => {
      if (current.some((item) => item?.id === incident.id)) return current;
      return [incident, ...current];
    });
  }, []);

  // Merge partial updates into an existing item (used after PUT /api/incidents/:id).
  const patchIncident = useCallback((incidentId, changes) => {
    setIncidents((current) =>
      current.map((item) => (item?.id === incidentId ? { ...item, ...changes } : item))
    );
  }, []);

  // Remove an incident (used after DELETE /api/incidents/:id).
  const removeIncident = useCallback((incidentId) => {
    setIncidents((current) => current.filter((item) => item?.id !== incidentId));
  }, []);

  return {
    incidents,
    loading,
    error,
    refresh: loadIncidents,
    prependIncident,
    patchIncident,
    removeIncident,
  };
}