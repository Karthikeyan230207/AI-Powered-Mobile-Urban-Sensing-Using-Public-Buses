from typing import List

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import get_db, init_db
from .models import Bus, Incident, Detection
from .schemas import (
    BusCreate,
    BusResponse,
    IncidentCreate,
    IncidentUpdate,
    IncidentResponse,
    DetectionCreate,
    DetectionResponse,
    DashboardStats
)


app = FastAPI(
    title="AI-Powered Mobile Urban Sensing API",
    description="Backend API for AI-powered public bus urban intelligence platform",
    version="1.0.0"
)


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
    return {
        "status": "online",
        "project": "AI-Powered Mobile Urban Sensing Using Public Buses",
        "version": "1.0.0"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "database": "connected"
    }


@app.post("/api/buses", response_model=BusResponse)
def create_bus(
    bus: BusCreate,
    db: Session = Depends(get_db)
):
    existing_bus = (
        db.query(Bus)
        .filter(Bus.bus_number == bus.bus_number)
        .first()
    )

    if existing_bus:
        raise HTTPException(
            status_code=400,
            detail="Bus number already exists"
        )

    new_bus = Bus(**bus.model_dump())

    db.add(new_bus)
    db.commit()
    db.refresh(new_bus)

    return new_bus


@app.get("/api/buses", response_model=List[BusResponse])
def get_buses(
    db: Session = Depends(get_db)
):
    return (
        db.query(Bus)
        .order_by(Bus.id.desc())
        .all()
    )


@app.get("/api/buses/{bus_id}", response_model=BusResponse)
def get_bus(
    bus_id: int,
    db: Session = Depends(get_db)
):
    bus = db.query(Bus).filter(Bus.id == bus_id).first()

    if not bus:
        raise HTTPException(
            status_code=404,
            detail="Bus not found"
        )

    return bus


@app.put("/api/buses/{bus_id}", response_model=BusResponse)
def update_bus(
    bus_id: int,
    bus_data: BusCreate,
    db: Session = Depends(get_db)
):
    bus = db.query(Bus).filter(Bus.id == bus_id).first()

    if not bus:
        raise HTTPException(
            status_code=404,
            detail="Bus not found"
        )

    for key, value in bus_data.model_dump().items():
        setattr(bus, key, value)

    db.commit()
    db.refresh(bus)

    return bus


@app.delete("/api/buses/{bus_id}")
def delete_bus(
    bus_id: int,
    db: Session = Depends(get_db)
):
    bus = db.query(Bus).filter(Bus.id == bus_id).first()

    if not bus:
        raise HTTPException(
            status_code=404,
            detail="Bus not found"
        )

    db.delete(bus)
    db.commit()

    return {
        "message": "Bus deleted successfully",
        "bus_id": bus_id
    }


@app.post("/api/incidents", response_model=IncidentResponse)
def create_incident(
    incident: IncidentCreate,
    db: Session = Depends(get_db)
):
    new_incident = Incident(**incident.model_dump())

    db.add(new_incident)
    db.commit()
    db.refresh(new_incident)

    return new_incident


@app.get("/api/incidents", response_model=List[IncidentResponse])
def get_incidents(
    status: str | None = None,
    severity: str | None = None,
    incident_type: str | None = None,
    db: Session = Depends(get_db)
):
    query = db.query(Incident)

    if status:
        query = query.filter(Incident.status == status)

    if severity:
        query = query.filter(Incident.severity == severity)

    if incident_type:
        query = query.filter(
            Incident.incident_type == incident_type
        )

    return (
        query
        .order_by(Incident.id.desc())
        .all()
    )


@app.get("/api/incidents/{incident_id}", response_model=IncidentResponse)
def get_incident(
    incident_id: int,
    db: Session = Depends(get_db)
):
    incident = (
        db.query(Incident)
        .filter(Incident.id == incident_id)
        .first()
    )

    if not incident:
        raise HTTPException(
            status_code=404,
            detail="Incident not found"
        )

    return incident


@app.put("/api/incidents/{incident_id}", response_model=IncidentResponse)
def update_incident(
    incident_id: int,
    update_data: IncidentUpdate,
    db: Session = Depends(get_db)
):
    incident = (
        db.query(Incident)
        .filter(Incident.id == incident_id)
        .first()
    )

    if not incident:
        raise HTTPException(
            status_code=404,
            detail="Incident not found"
        )

    update_values = update_data.model_dump(
        exclude_unset=True
    )

    for key, value in update_values.items():
        setattr(incident, key, value)

    db.commit()
    db.refresh(incident)

    return incident


@app.delete("/api/incidents/{incident_id}")
def delete_incident(
    incident_id: int,
    db: Session = Depends(get_db)
):
    incident = (
        db.query(Incident)
        .filter(Incident.id == incident_id)
        .first()
    )

    if not incident:
        raise HTTPException(
            status_code=404,
            detail="Incident not found"
        )

    db.delete(incident)
    db.commit()

    return {
        "message": "Incident deleted successfully",
        "incident_id": incident_id
    }


@app.post("/api/detections", response_model=DetectionResponse)
def create_detection(
    detection: DetectionCreate,
    db: Session = Depends(get_db)
):
    new_detection = Detection(**detection.model_dump())

    db.add(new_detection)
    db.commit()
    db.refresh(new_detection)

    return new_detection


@app.get("/api/detections", response_model=List[DetectionResponse])
def get_detections(
    object_type: str | None = None,
    bus_number: str | None = None,
    db: Session = Depends(get_db)
):
    query = db.query(Detection)

    if object_type:
        query = query.filter(
            Detection.object_type == object_type
        )

    if bus_number:
        query = query.filter(
            Detection.bus_number == bus_number
        )

    return (
        query
        .order_by(Detection.id.desc())
        .all()
    )


@app.get("/api/detections/{detection_id}", response_model=DetectionResponse)
def get_detection(
    detection_id: int,
    db: Session = Depends(get_db)
):
    detection = (
        db.query(Detection)
        .filter(Detection.id == detection_id)
        .first()
    )

    if not detection:
        raise HTTPException(
            status_code=404,
            detail="Detection not found"
        )

    return detection


@app.delete("/api/detections/{detection_id}")
def delete_detection(
    detection_id: int,
    db: Session = Depends(get_db)
):
    detection = (
        db.query(Detection)
        .filter(Detection.id == detection_id)
        .first()
    )

    if not detection:
        raise HTTPException(
            status_code=404,
            detail="Detection not found"
        )

    db.delete(detection)
    db.commit()

    return {
        "message": "Detection deleted successfully",
        "detection_id": detection_id
    }


@app.get("/api/dashboard/stats", response_model=DashboardStats)
def dashboard_stats(
    db: Session = Depends(get_db)
):
    total_buses = db.query(Bus).count()

    active_buses = (
        db.query(Bus)
        .filter(Bus.status == "active")
        .count()
    )

    total_incidents = db.query(Incident).count()

    pending_incidents = (
        db.query(Incident)
        .filter(Incident.status == "pending")
        .count()
    )

    critical_incidents = (
        db.query(Incident)
        .filter(Incident.severity == "critical")
        .count()
    )

    total_detections = db.query(Detection).count()

    return DashboardStats(
        total_buses=total_buses,
        active_buses=active_buses,
        total_incidents=total_incidents,
        pending_incidents=pending_incidents,
        critical_incidents=critical_incidents,
        total_detections=total_detections
    )