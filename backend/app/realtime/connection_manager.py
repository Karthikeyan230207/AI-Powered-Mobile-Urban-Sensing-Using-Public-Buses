from fastapi import WebSocket


class ConnectionManager:

    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):

        await websocket.accept()

        self.active_connections.append(websocket)

        print(
            f"[M6] WebSocket CONNECTED | "
            f"Active connections: {len(self.active_connections)}"
        )

    def disconnect(self, websocket: WebSocket):

        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

        print(
            f"[M6] WebSocket DISCONNECTED | "
            f"Active connections: {len(self.active_connections)}"
        )

    async def broadcast(self, message: dict):

        print(
            f"[M6] Broadcasting event to "
            f"{len(self.active_connections)} connection(s)"
        )

        print(f"[M6] Event: {message}")

        disconnected = []

        for connection in self.active_connections:

            try:

                await connection.send_json(message)

                print("[M6] Event sent successfully")

            except Exception as e:

                print(f"[M6] Failed to send event: {e}")

                disconnected.append(connection)

        for connection in disconnected:

            self.disconnect(connection)


manager = ConnectionManager()