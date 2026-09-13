import { useCallback, useEffect, useState } from "react";
import { getIncidents } from "../services/api";

export default function useIncidents(params = {}) {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadIncidents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getIncidents(params);
      const items = Array.isArray(data) ? data : data?.incidents || data?.items || [];
      setIncidents(items);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    loadIncidents();
  }, [loadIncidents]);

  return { incidents, loading, error, refresh: loadIncidents };
}
