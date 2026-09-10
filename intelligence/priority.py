"""Priority scoring: given severity plus context, how soon must someone act?

Severity answers "how bad is the defect"; priority answers "how bad is it
*here*, *now*, and *again*". It folds in the zone of interest, whether the bus
was crawling (a congestion proxy), and how many times the same defect has
already been reported at the same spot.
"""

try:
    from . import config, geo_utils
except ImportError:  # running the module directly, not as a package
    import config
    import geo_utils


def _clamp(value, low=0.0, high=1.0):
    return max(low, min(high, value))


def score_to_level(score):
    """Map a 0-100 priority score onto (code, label, sla_hours)."""
    for threshold, code, label, sla_hours in config.PRIORITY_LEVELS:
        if score >= threshold:
            return code, label, sla_hours
    _, code, label, sla_hours = config.PRIORITY_LEVELS[-1]
    return code, label, sla_hours


def _band_rank(code):
    """Position of a priority code in the bands list (0 = most urgent)."""
    for index, band in enumerate(config.PRIORITY_LEVELS):
        if band[1] == code:
            return index
    return len(config.PRIORITY_LEVELS) - 1


def _apply_escalation(code, severity_score):
    """Force very severe defects up to the escalation band.

    Returns (code, label, sla_hours, reason) - reason is None when the scored
    band already stood on its own.
    """
    if severity_score < config.PRIORITY_ESCALATION_SEVERITY:
        return code, None
    target = config.PRIORITY_ESCALATION_LEVEL
    if _band_rank(code) <= _band_rank(target):
        return code, None
    return target, ("severity {} >= {} escalation threshold".format(
        severity_score, config.PRIORITY_ESCALATION_SEVERITY))


def route_department(detection_type):
    """Which civic department owns this class of defect."""
    return config.DEPARTMENT_ROUTING.get(detection_type,
                                         config.DEFAULT_DEPARTMENT)


def traffic_factor(speed_kmph):
    """0..1 congestion proxy - a stationary bus implies a blocked road."""
    if speed_kmph is None:
        return 0.0
    if speed_kmph >= config.CONGESTION_SPEED_KMPH:
        return 0.0
    return _clamp(1.0 - (speed_kmph / config.CONGESTION_SPEED_KMPH))


def recurrence_factor(occurrence_count):
    """0..1 - a defect reported four times running is not going away."""
    occurrences = max(1, int(occurrence_count or 1))
    return _clamp((occurrences - 1)
                  / max(1, config.RECURRENCE_SATURATION - 1))


def calculate_priority(severity_result, latitude=None, longitude=None,
                       speed_kmph=None, occurrence_count=1, zone=None):
    """Blend severity with location context into a P1-P4 priority.

    `zone` may be passed in to avoid a second lookup; otherwise it is resolved
    from the coordinates.
    """
    if zone is None and latitude is not None and longitude is not None:
        zone = geo_utils.find_zone(latitude, longitude)

    weights = config.PRIORITY_WEIGHTS
    severity_score = float(severity_result.get("score", 0.0))

    severity_factor = _clamp(severity_score / 100.0)
    zone_weight = zone["weight"] if zone else config.DEFAULT_ZONE_WEIGHT
    zone_factor = _clamp((zone_weight - config.DEFAULT_ZONE_WEIGHT) / 0.4)
    recurrence = recurrence_factor(occurrence_count)
    traffic = traffic_factor(speed_kmph)

    score = 100.0 * (weights["severity"] * severity_factor
                     + weights["zone"] * zone_factor
                     + weights["recurrence"] * recurrence
                     + weights["traffic"] * traffic)
    score = round(_clamp(score, 0.0, 100.0), 1)

    code, label, sla_hours = score_to_level(score)
    code, escalation_reason = _apply_escalation(code, severity_score)
    if escalation_reason:
        for threshold, band_code, band_label, band_sla in config.PRIORITY_LEVELS:
            if band_code == code:
                label, sla_hours = band_label, band_sla
                break

    return {
        "score": score,
        "level": code,
        "label": label,
        "sla_hours": sla_hours,
        "escalated": escalation_reason is not None,
        "escalation_reason": escalation_reason,
        "department": route_department(severity_result.get("type", "unknown")),
        "zone": {
            "id": zone["id"],
            "name": zone["name"],
            "type": zone["type"],
            "weight": zone["weight"],
        } if zone else None,
        "factors": {
            "severity": round(severity_factor, 3),
            "zone": round(zone_factor, 3),
            "recurrence": round(recurrence, 3),
            "traffic": round(traffic, 3),
        },
        "occurrence_count": max(1, int(occurrence_count or 1)),
    }


if __name__ == "__main__":
    try:
        from . import severity
    except ImportError:
        import severity

    cases = [
        ("pothole in school zone, bus crawling, 3rd sighting",
         {"type": "pothole", "confidence": 0.9, "area": 0.14, "count": 2},
         13.070100, 80.258300, 6.0, 3),
        ("same pothole on an open road, first sighting",
         {"type": "pothole", "confidence": 0.9, "area": 0.14, "count": 2},
         13.500000, 80.900000, 40.0, 1),
        ("hairline crack, open road",
         {"type": "crack", "confidence": 0.5, "area": 0.01},
         13.500000, 80.900000, 35.0, 1),
        ("accident at Guindy junction",
         {"type": "accident", "confidence": 0.93, "area": 0.25},
         13.021900, 80.234700, 3.0, 1),
    ]
    for name, detection, lat, lon, speed, occurrences in cases:
        sev = severity.calculate_severity(detection,
                                          zone_weight=geo_utils.zone_weight(lat, lon))
        pri = calculate_priority(sev, lat, lon, speed, occurrences)
        print("{:<50} sev {:>5} {:<8} -> {} {:<9} SLA {:>3}h  {}".format(
            name, sev["score"], sev["level"], pri["level"], pri["label"],
            pri["sla_hours"], pri["department"]))
