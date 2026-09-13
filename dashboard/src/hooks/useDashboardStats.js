import { useCallback, useEffect, useState } from "react";
import { getDashboardStats } from "../services/api";
import useIncidentWebSocket from "./useIncidentWebSocket";

export default function useDashboardStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStats = useCallback(async () => {
    try {
      setError(null);

      const data = await getDashboardStats();

      setStats(data);
    } catch (err) {
      console.error("Dashboard stats API error:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial statistics
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // When M6 sends a new incident, refresh statistics
  const handleNewIncident = useCallback(() => {
    console.log("[M5] Refreshing dashboard statistics...");
    loadStats();
  }, [loadStats]);

  useIncidentWebSocket(handleNewIncident);

  return {
    stats,
    loading,
    error,
  };
}