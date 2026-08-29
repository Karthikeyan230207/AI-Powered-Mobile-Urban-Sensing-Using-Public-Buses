from typing import Literal
from pydantic import BaseModel, Field

class IncidentCreate(BaseModel):
    bus_id: str = Field(min_length=1)
    incident_type: str = Field(min_length=1)
    confidence: float = Field(ge=0, le=1)
    latitude: float
    longitude: float
    timestamp: str
    severity: int = Field(default=5, ge=1, le=10)
    traffic_level: Literal["LOW","MEDIUM","HIGH"] = "LOW"
    traffic_count: int = Field(default=0, ge=0)
    verification_count: int = Field(default=1, ge=1)

class StatusUpdate(BaseModel):
    status: Literal["DETECTED","ASSIGNED","IN PROGRESS","REPAIRED"]
