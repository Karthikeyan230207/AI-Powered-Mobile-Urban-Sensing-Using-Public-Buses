import { useCallback, useEffect, useState } from "react";
import { getDashboardStats } from "../services/api";

export default function useDashboardStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return { stats, loading, error, refresh: loadStats };
}
