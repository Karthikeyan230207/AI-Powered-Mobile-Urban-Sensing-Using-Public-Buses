# Urban Intelligence Dashboard — Phase 5.6 (API-connected)

Implemented through Phase 5.6:

- **5.1** Vite + React project and complete dashboard folder structure
- **5.2** Dashboard UI foundation and responsive styling
- **5.3** Axios API integration for dashboard stats, incidents, and buses
- **5.4** Incident filtering, incident cards, selection, and detail panel
- **5.5** Real Leaflet + OpenStreetMap map with incident markers and popups
- **5.6** Full API wiring: live dashboard (no demo data), incident management
  (filter / create / update / delete), analytics page (incidents, detections,
  buses), realtime WebSocket alerts, loading/error/empty/retry states, and
  hash-based navigation between pages.

## Run

```bash
npm install
npm run dev
```

## Backend

By default the frontend calls:

`http://127.0.0.1:8000`

You can override it with:

```env
VITE_API_URL=http://127.0.0.1:8000
```

## Connected FastAPI endpoints

| Feature | Endpoint(s) |
| --- | --- |
| Dashboard stat cards & fleet strip | `GET /api/dashboard/stats` |
| Incident feed, filters, map, charts | `GET /api/incidents?status=&severity=&incident_type=` |
| Incident detail / update / delete | `GET/PUT/DELETE /api/incidents/{id}` |
| Report new incident | `POST /api/incidents` |
| Bus fleet panel | `GET /api/buses` |
| Live detection feed | `GET /api/detections` |
| Realtime alerts | `WS /ws/incidents` (auto-reconnect) |

If the backend is not running, every panel shows an error state with a Retry
button — the UI never substitutes fake data.
