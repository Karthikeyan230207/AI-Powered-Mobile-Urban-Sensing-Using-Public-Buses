"""Severity scoring: how bad is this defect, in isolation?

Input is a *normalised detection* - a plain dict, so the real detector in
`ai/` can be wired in later by mapping its output onto these keys:

    {
        "type":        "pothole",     # detection class
        "confidence":  0.87,          # 0..1 detector confidence
        "bbox":        [x, y, w, h],  # normalised 0..1, optional
        "area":        0.12,          # normalised frame fraction, optional
        "count":       2,             # instances in the frame, optional
    }

Severity deliberately knows nothing about *where* the defect is - location
context is priority.py's job.
"""

try:
    from . import config
except ImportError:  # running the module directly, not as a package
    import config


def _clamp(value, low=0.0, high=1.0):
    return max(low, min(high, value))


def normalize_detection(detection):
    """Coerce a raw detector payload into the shape the scorer expects.

    Tolerates the common aliases (`label`/`class_name` for type, `score` for
    confidence) so plugging in a real model rarely needs an adapter.
    """
    if detection is None:
        raise ValueError("detection is required")

    detection_type = (detection.get("type")
                      or detection.get("label")
                      or detection.get("class_name")
                      or detection.get("class")
                      or "unknown")

    confidence = detection.get("confidence")
    if confidence is None:
        confidence = detection.get("score", 0.0)

    bbox = detection.get("bbox") or detection.get("box")
    area = detection.get("area")
    if area is None and bbox and len(bbox) >= 4:
        area = float(bbox[2]) * float(bbox[3])

    return {
        "type": canonical_type(detection_type),
        "confidence": _clamp(float(confidence)),
        "area": _clamp(float(area)) if area is not None else 0.0,
        "count": max(1, int(detection.get("count", 1))),
        "bbox": list(bbox) if bbox else None,
        "frame_id": detection.get("frame_id"),
        "detector": detection.get("detector", "unknown"),
    }


def canonical_type(raw_type):
    """Normalise a detector label onto a known class name.

    Lower-cases, underscore-joins and then resolves aliases, so the scorer is
    not thrown by "Pot Hole" vs "pothole". Unrecognised labels pass through
    unchanged and are scored at SEVERITY_DEFAULT_BASE.
    """
    slug = "_".join(str(raw_type).strip().lower().split())
    return config.DETECTION_TYPE_ALIASES.get(slug, slug)


def is_known_type(detection_type):
    """True when the class has a tuned base score of its own."""
    return detection_type in config.SEVERITY_BASE_SCORES


def is_reportable(detection):
    """Filter out detections too weak to raise an incident for."""
    normalised = normalize_detection(detection)
    return normalised["confidence"] >= config.MIN_DETECTION_CONFIDENCE


def base_score(detection_type):
    """Intrinsic severity of a detection class before any adjustment."""
    return config.SEVERITY_BASE_SCORES.get(detection_type,
                                           config.SEVERITY_DEFAULT_BASE)


def score_to_level(score):
    """Map a 0-100 severity score onto its label."""
    for threshold, label in config.SEVERITY_LEVELS:
        if score >= threshold:
            return label
    return config.SEVERITY_LEVELS[-1][1]


def calculate_severity(detection, zone_weight=None):
    """Score a detection 0-100 and explain the contribution of each signal.

    `zone_weight` is optional; passing it lets a school-zone pothole score a
    little higher than an identical one on an empty bypass.
    """
    normalised = normalize_detection(detection)
    weights = config.SEVERITY_WEIGHTS
    base = base_score(normalised["type"])

    # Each factor is 0..1; together they scale the base score up to ~1.6x and
    # down to ~0.6x, so class identity stays the dominant signal.
    confidence_factor = normalised["confidence"]
    size_factor = _clamp(normalised["area"] / config.SIZE_SATURATION_AREA)
    count_factor = _clamp((normalised["count"] - 1)
                          / max(1, config.COUNT_SATURATION - 1))

    if zone_weight is None:
        zone_factor = 0.0
    else:
        # A 1.0 weight is neutral; 1.4 (hospital) saturates the zone term.
        zone_factor = _clamp((zone_weight - config.DEFAULT_ZONE_WEIGHT) / 0.4)

    # Weights sum to 1.0, so the raw blend lands in -1..1; scaling it keeps
    # the final score inside SEVERITY_MODIFIER_RANGE of the base.
    modifier = (weights["confidence"] * (confidence_factor - 0.5) * 2
                + weights["size"] * size_factor
                + weights["count"] * count_factor
                + weights["zone"] * zone_factor) * config.SEVERITY_MODIFIER_RANGE

    score = _clamp(base * (1.0 + modifier), 0.0, 100.0)
    score = round(score, 1)

    return {
        "score": score,
        "level": score_to_level(score),
        "base_score": base,
        "type": normalised["type"],
        # Flagged so an unmapped class scored on the default base is visible
        # downstream instead of quietly looking like a tuned result.
        "is_known_type": is_known_type(normalised["type"]),
        "confidence": round(normalised["confidence"], 3),
        "factors": {
            "confidence": round(confidence_factor, 3),
            "size": round(size_factor, 3),
            "count": round(count_factor, 3),
            "zone": round(zone_factor, 3),
        },
        "modifier": round(modifier, 3),
    }


if __name__ == "__main__":
    samples = [
        {"type": "pothole", "confidence": 0.91, "area": 0.16, "count": 3},
        {"type": "crack", "confidence": 0.52, "area": 0.02, "count": 1},
        {"type": "accident", "confidence": 0.88, "area": 0.30, "count": 1},
        {"label": "garbage", "score": 0.64, "bbox": [0.1, 0.2, 0.3, 0.2]},
    ]
    for sample in samples:
        result = calculate_severity(sample, zone_weight=1.35)
        print("{:<20} {:>6}  {}".format(result["type"], result["score"],
                                        result["level"]))
