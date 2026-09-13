import { useCallback, useEffect, useRef } from "react";
import { getWebSocketUrl } from "../services/api";

/** Delay between automatic reconnection attempts (ms). */
const RECONNECT_DELAY_MS = 3000;

/**
 * Single realtime incident connection (WS /ws/incidents).
 *
 * - Derives the URL from VITE_API_URL via getWebSocketUrl() (never hardcoded).
 * - Reconnects automatically with a fixed delay when the socket drops.
 * - Parses messages defensively and only forwards NEW_INCIDENT events.
 * - Owns exactly one connection: mount this hook once at the app level.
 * - Cleans the socket and any pending reconnect timer on unmount.
 *
 * Only mount this hook ONCE for the whole app. Components that need to react
 * to realtime events should receive data via shared state (e.g. App), not by
 * opening their own socket.
 */
export default function useIncidentWebSocket(onIncident) {
  // Keep the latest callback in a ref so a changing identity never forces a
  // socket reconnect on every render.
  const onIncidentRef = useRef(onIncident);
  onIncidentRef.current = onIncident;

  useEffect(() => {
    let socket = null;
    let reconnectTimer = null;
    let disposed = false;

    const scheduleReconnect = () => {
      if (disposed) return;
      if (reconnectTimer) return;
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        connect();
      }, RECONNECT_DELAY_MS);
    };

    const connect = () => {
      if (disposed) return;

      try {
        socket = new WebSocket(getWebSocketUrl());
      } catch {
        // getWebSocketUrl() produced an unusable URL; retry later.
        scheduleReconnect();
        return;
      }

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (!message || message.event !== "NEW_INCIDENT" || !message.data) return;
          onIncidentRef.current?.(message.data);
        } catch {
          // Non-JSON frame; ignore and keep the connection alive.
        }
      };

      socket.onclose = scheduleReconnect;
      socket.onerror = scheduleReconnect;
    };

    connect();

    return () => {
      disposed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (socket) {
        socket.onclose = null;
        socket.onerror = null;
        if (
          socket.readyState === WebSocket.OPEN ||
          socket.readyState === WebSocket.CONNECTING
        ) {
          socket.close();
        }
      }
    };
  }, []);
}

