import { useCallback, useEffect, useState } from "react";
import { getDashboardStats, getErrorMessage } from "../services/api";

/**
 * Aggregated KPI data from GET /api/dashboard/stats.
 * Realtime refresh is handled at the app level (single WS connection);
 * pass a key/refresh trigger from the parent when a NEW_INCIDENT arrives.
 */
export default function useDashboardStats(refreshKey = 0) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStats = useCallback(async () => {
    try {
      setError(null);
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load dashboard statistics."));
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load, then refresh when the parent signals new data (realtime).
  useEffect(() => {
    loadStats();
  }, [loadStats, refreshKey]);

  return {
    stats,
    loading,
    error,
    refresh: loadStats,
  };
}
