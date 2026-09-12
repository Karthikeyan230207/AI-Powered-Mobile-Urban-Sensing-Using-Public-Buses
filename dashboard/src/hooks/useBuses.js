import { useCallback, useEffect, useState } from "react";
import { getBuses } from "../services/api";

export default function useBuses() {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadBuses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getBuses();
      setBuses(Array.isArray(data) ? data : data?.buses || data?.items || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBuses();
  }, [loadBuses]);

  return { buses, loading, error, refresh: loadBuses };
}
