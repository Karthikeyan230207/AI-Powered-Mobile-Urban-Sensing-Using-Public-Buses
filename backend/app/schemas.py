from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, ConfigDict


class BusCreate(BaseModel):
    bus_number: str
    route: Optional[str] = None
    camera_id: Optional[str] = None
    status: str = "active"
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class BusResponse(BusCreate):
    id: int
    last_seen: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class IncidentCreate(BaseModel):
    incident_type: str
    description: Optional[str] = None

    latitude: float
    longitude: float

    confidence: float = Field(default=0.0, ge=0.0, le=1.0)

    severity: str = "medium"
    priority_score: float = 0.0

    image_url: Optional[str] = None
    video_url: Optional[str] = None

    bus_number: Optional[str] = None
    status: str = "pending"

    verified: bool = False


class IncidentUpdate(BaseModel):
    status: Optional[str] = None
    severity: Optional[str] = None
    verified: Optional[bool] = None
    priority_score: Optional[float] = None


class IncidentResponse(IncidentCreate):
    id: int
    detected_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class DetectionCreate(BaseModel):
    object_type: str
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)

    latitude: Optional[float] = None
    longitude: Optional[float] = None

    bus_number: Optional[str] = None
    image_url: Optional[str] = None


class DetectionResponse(DetectionCreate):
    id: int
    detected_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class DashboardStats(BaseModel):
    total_buses: int
    active_buses: int
    total_incidents: int
    pending_incidents: int
    critical_incidents: int
    total_detections: int