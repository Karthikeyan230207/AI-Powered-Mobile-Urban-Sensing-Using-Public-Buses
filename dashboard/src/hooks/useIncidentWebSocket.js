
import { useEffect } from "react";

const WS_URL = "wss://192.168.43.34:8000/ws/incidents";

export default function useIncidentWebSocket(onIncident) {
  useEffect(() => {
    console.log("[M6] Connecting to WebSocket...");

    const socket = new WebSocket(WS_URL);

    socket.onopen = () => {
      console.log("[M6] WebSocket connected");
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        console.log("[M6] Received:", message);

        if (message.event === "NEW_INCIDENT" && message.data) {
          onIncident?.(message.data);
        }
      } catch (error) {
        console.error("[M6] Invalid WebSocket message:", error);
      }
    };

    socket.onerror = (error) => {
      console.error("[M6] WebSocket error:", error);
    };

    socket.onclose = (event) => {
      console.log(
        `[M6] WebSocket disconnected | Code: ${event.code}`
      );
    };

    return () => {
      if (
        socket.readyState === WebSocket.OPEN ||
        socket.readyState === WebSocket.CONNECTING
      ) {
        socket.close();
      }
    };
  }, [onIncident]);
}

