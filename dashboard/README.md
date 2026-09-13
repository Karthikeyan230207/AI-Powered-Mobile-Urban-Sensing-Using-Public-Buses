# Urban Intelligence Dashboard — Phase 5.5

Implemented through Phase 5.5:

- **5.1** Vite + React project and complete dashboard folder structure
- **5.2** Dashboard UI foundation and responsive styling
- **5.3** Axios API integration for dashboard stats, incidents, and buses
- **5.4** Incident filtering, incident cards, selection, and detail panel
- **5.5** Real Leaflet + OpenStreetMap map with incident markers and popups

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

The dashboard expects the existing FastAPI endpoints:
- `/api/dashboard/stats`
- `/api/incidents`
- `/api/buses`

If the backend is not running, the UI shows an offline/API error state rather than silently pretending live data exists.
