import { useCallback, useEffect, useState } from "react";
import { getDetections, getErrorMessage } from "../services/api";

export default function useDetections(params = {}) {
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDetections = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getDetections(params);
      const items = Array.isArray(data) ? data : data?.detections || data?.items || [];
      setDetections(items);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load detections."));
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    loadDetections();
  }, [loadDetections]);

  return { detections, loading, error, refresh: loadDetections };
}