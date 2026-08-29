from pathlib import Path
from datetime import datetime, timezone
import math
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from .database import get_conn, init_db
from .models import IncidentCreate, StatusUpdate
from .priority import calculate_priority

BASE = Path(__file__).resolve().parent.parent
app = FastAPI(title="Urban Intelligence API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.on_event("startup")
def startup():
    init_db()

@app.get("/")
def root():
    return {"message": "Urban Intelligence API is running", "dashboard": "/dashboard"}

@app.get("/dashboard")
def dashboard():
    return FileResponse(BASE / "frontend" / "index.html")

@app.get("/dashboard.js")
def dashboard_js():
    return FileResponse(BASE / "frontend" / "dashboard.js")

@app.get("/dashboard-style.css")
def dashboard_css():
    return FileResponse(BASE / "frontend" / "dashboard-style.css")

@app.get("/api/incidents")
def get_incidents():
    conn = get_conn()
    rows = conn.execute("SELECT * FROM incidents ORDER BY id DESC").fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.post("/api/incidents")
def create_incident(data: IncidentCreate):
    score = calculate_priority(
        data.severity, data.traffic_level,
        data.confidence, data.verification_count
    )
    code = f"{data.incident_type[:3].upper()}-{datetime.now().strftime('%H%M%S%f')[-8:]}"
    conn = get_conn()
    cur = conn.execute(
        """INSERT INTO incidents
        (incident_code,bus_id,incident_type,confidence,latitude,longitude,timestamp,
        severity,traffic_level,traffic_count,verification_count,priority_score,status)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        (code, data.bus_id, data.incident_type, data.confidence,
         data.latitude, data.longitude, data.timestamp, data.severity,
         data.traffic_level, data.traffic_count, data.verification_count,
         score, "DETECTED")
    )
    conn.commit()
    row = conn.execute("SELECT * FROM incidents WHERE id=?", (cur.lastrowid,)).fetchone()
    conn.close()
    return dict(row)

@app.patch("/api/incidents/{incident_id}/status")
def update_status(incident_id: int, data: StatusUpdate):
    conn = get_conn()
    conn.execute("UPDATE incidents SET status=? WHERE id=?", (data.status, incident_id))
    conn.commit()
    row = conn.execute("SELECT * FROM incidents WHERE id=?", (incident_id,)).fetchone()
    conn.close()
    if not row:
        raise HTTPException(404, "Incident not found")
    return dict(row)

def distance_m(lat1, lon1, lat2, lon2):
    R = 6371000
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dp/2)**2 + math.cos(p1)*math.cos(p2)*math.sin(dl/2)**2
    return 2 * R * math.asin(math.sqrt(a))

@app.post("/api/verify")
def verify(latitude: float, longitude: float, radius_m: float = 50):
    conn = get_conn()
    rows = conn.execute(
        "SELECT * FROM incidents WHERE incident_type='pothole' AND status!='REPAIRED'"
    ).fetchall()
    matches = [dict(r) for r in rows if distance_m(
        latitude, longitude, r["latitude"], r["longitude"]) <= radius_m]
    for item in matches:
        count = item["verification_count"] + 1
        score = calculate_priority(
            item["severity"], item["traffic_level"],
            item["confidence"], count
        )
        conn.execute(
            "UPDATE incidents SET verification_count=?,priority_score=? WHERE id=?",
            (count, score, item["id"])
        )
    conn.commit()
    conn.close()
    return {"matched_count": len(matches), "matches": matches}

@app.get("/api/stats")
def stats():
    conn = get_conn()
    result = {
        "total": conn.execute("SELECT COUNT(*) n FROM incidents").fetchone()["n"],
        "potholes": conn.execute("SELECT COUNT(*) n FROM incidents WHERE incident_type='pothole'").fetchone()["n"],
        "critical": conn.execute("SELECT COUNT(*) n FROM incidents WHERE priority_score>=80 AND status!='REPAIRED'").fetchone()["n"],
        "repaired": conn.execute("SELECT COUNT(*) n FROM incidents WHERE status='REPAIRED'").fetchone()["n"]
    }
    conn.close()
    return result

@app.post("/api/demo/seed")
def seed_demo():
    now = datetime.now(timezone.utc).isoformat()
    samples = [
        IncidentCreate(
            bus_id="BUS-21", incident_type="pothole", confidence=.94,
            latitude=13.0827, longitude=80.2707, timestamp=now,
            severity=9, traffic_level="HIGH", traffic_count=31, verification_count=3
        ),
        IncidentCreate(
            bus_id="BUS-34", incident_type="road_damage", confidence=.88,
            latitude=13.0674, longitude=80.2376, timestamp=now,
            severity=6, traffic_level="MEDIUM", traffic_count=18
        ),
        IncidentCreate(
            bus_id="BUS-18", incident_type="pothole", confidence=.91,
            latitude=13.0500, longitude=80.2120, timestamp=now,
            severity=4, traffic_level="LOW", traffic_count=7
        )
    ]
    return [create_incident(x) for x in samples]
