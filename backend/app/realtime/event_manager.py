from datetime import datetime


def create_incident_event(incident):
    return {
        "event": "NEW_INCIDENT",
        "timestamp": datetime.now().isoformat(),
        "data": {
            "id": incident.id,
            "incident_type": incident.incident_type,
            "description": incident.description,
            "latitude": incident.latitude,
            "longitude": incident.longitude,
            "confidence": incident.confidence,
            "severity": incident.severity,
            "priority_score": incident.priority_score,
            "image_url": incident.image_url,
            "video_url": incident.video_url,
            "bus_number": incident.bus_number,
            "status": incident.status,
            "verified": incident.verified,
            "detected_at": (
                incident.detected_at.isoformat()
                if incident.detected_at
                else None
            )
        }
    }