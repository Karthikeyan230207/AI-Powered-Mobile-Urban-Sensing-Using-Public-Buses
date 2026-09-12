def m4_to_m3_incident(incident):
    """
    Convert an M4 Incident object into the flat structure
    expected by M3's IncidentCreate schema.
    """

    data = incident.to_dict()

    detection = data["detection"]
    location = data["location"]
    severity = data["severity"]
    priority = data["priority"]
    bus = data["bus"]

    return {
        "incident_type": detection["type"],
        "description": (
            f"{detection['type']} detected by "
            f"{detection.get('detector', 'unknown')}"
        ),

        "latitude": location["latitude"],
        "longitude": location["longitude"],

        "confidence": detection["confidence"],

        "severity": severity["level"],

        "priority_score": priority["score"],

        "image_url": None,
        "video_url": None,

        "bus_number": bus["bus_id"],

        "status": "pending",
        "verified": False
    }