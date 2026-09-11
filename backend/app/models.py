from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text
from sqlalchemy.sql import func
from .database import Base


class Bus(Base):
    __tablename__ = "buses"

    id = Column(Integer, primary_key=True, index=True)
    bus_number = Column(String(50), unique=True, nullable=False, index=True)
    route = Column(String(100), nullable=True)
    camera_id = Column(String(100), nullable=True)
    status = Column(String(30), default="active")
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    last_seen = Column(DateTime, server_default=func.now())


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)

    incident_type = Column(String(50), nullable=False)
    description = Column(Text, nullable=True)

    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    confidence = Column(Float, default=0.0)
    severity = Column(String(30), default="medium")
    priority_score = Column(Float, default=0.0)

    image_url = Column(String(500), nullable=True)
    video_url = Column(String(500), nullable=True)

    bus_number = Column(String(50), nullable=True)
    status = Column(String(30), default="pending")

    verified = Column(Boolean, default=False)

    detected_at = Column(
        DateTime,
        server_default=func.now()
    )


class Detection(Base):
    __tablename__ = "detections"

    id = Column(Integer, primary_key=True, index=True)

    object_type = Column(String(50), nullable=False)
    confidence = Column(Float, default=0.0)

    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    bus_number = Column(String(50), nullable=True)

    image_url = Column(String(500), nullable=True)

    detected_at = Column(
        DateTime,
        server_default=func.now()
    )