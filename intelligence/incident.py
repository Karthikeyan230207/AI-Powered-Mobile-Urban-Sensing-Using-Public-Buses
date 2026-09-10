"""Incident assembly - the entry point of the intelligence layer.

Takes a detection (mock today, the real `ai/` detector later), stamps it with
time, bus identity and a GPS fix, scores severity and priority, and emits the
final incident JSON that the backend and realtime layers consume.

Wiring in real detections later means one call:

    from intelligence.incident import IncidentBuilder
    builder = IncidentBuilder()
    incident = builder.build(detection)      # detection = your detector dict

and, when the hardware GPS is ready:

    intelligence.gps.set_provider(MyRealGPSProvider())
"""

import json
import random
import uuid
from dataclasses import dataclass, asdict, field
from datetime import datetime, timezone

try:
    from . import config, geo_utils, gps, priority, severity
except ImportError:  # running the module directly, not as a package
    import config
    import geo_utils
    import gps
    import priority
    import severity


# --------------------------------------------------------------------------
# Incident record
# --------------------------------------------------------------------------

@dataclass
class Incident:
    """One reported civic defect, fully scored and ready to transmit."""

    incident_id: str
    schema_version: str
    timestamp: str
    bus: dict
    detection: dict
    location: dict
    severity: dict
    priority: dict
    status: str = "REPORTED"
    metadata: dict = field(default_factory=dict)

    def to_dict(self):
        return asdict(self)

    def to_json(self, indent=2):
        return json.dumps(self.to_dict(), indent=indent)

    def summary(self):
        """One-line form for logs and the demo console."""
        return "{}  {:<20} {:<8} {} {:<9} SLA {:>3}h  {}".format(
            self.incident_id,
            self.detection["type"],
            self.severity["level"],
            self.priority["level"],
            self.priority["label"],
            self.priority["sla_hours"],
            self.location["nearest_landmark"],
        )


def generate_incident_id(timestamp=None):
    """Readable, collision-resistant id: INC-20260910-1A2B3C4D."""
    stamp = (timestamp or datetime.now(timezone.utc)).strftime("%Y%m%d")
    return "{}-{}-{}".format(config.INCIDENT_ID_PREFIX, stamp,
                             uuid.uuid4().hex[:8].upper())


# --------------------------------------------------------------------------
# Builder
# --------------------------------------------------------------------------

class IncidentBuilder:
    """Turns detections into scored incidents.

    Holds the small amount of state the pipeline needs: the GPS provider and a
    per-segment history used for deduplication and recurrence counting.
    """

    def __init__(self, gps_provider=None, bus_id=None, route_id=None):
        self.gps_provider = gps_provider or gps.get_provider()
        self.bus_id = bus_id or config.BUS_ID
        self.route_id = route_id or config.BUS_ROUTE_ID
        # (segment_id, detection_type) -> [(lat, lon, times_seen), ...]
        self._history = {}

    # -- recurrence / dedupe ----------------------------------------------

    def _record_sighting(self, detection_type, lat, lon):
        """Log this sighting and return (occurrence_count, is_repeat).

        A sighting within DUPLICATE_RADIUS_M of an earlier one is the same
        physical defect, so it increments that entry's count instead of adding
        a new one - and that count drives the recurrence factor in priority.
        """
        key = (geo_utils.segment_id(lat, lon), detection_type)
        seen = self._history.setdefault(key, [])
        for index, (prev_lat, prev_lon, count) in enumerate(seen):
            if geo_utils.is_duplicate(lat, lon, prev_lat, prev_lon):
                seen[index] = (prev_lat, prev_lon, count + 1)
                return count + 1, True
        seen.append((lat, lon, 1))
        return 1, False

    def reset_history(self):
        """Forget every recorded sighting (used between demo runs)."""
        self._history.clear()

    # -- build -------------------------------------------------------------

    def build(self, detection, gps_reading=None, timestamp=None):
        """Score one detection into a complete :class:`Incident`.

        Returns None when the detection is below the reporting confidence
        floor, so callers can simply skip falsy results.
        """
        if not severity.is_reportable(detection):
            return None

        normalised = severity.normalize_detection(detection)
        reading = gps_reading or self.gps_provider.read()
        stamp = timestamp or reading.timestamp or gps.utc_now_iso()

        lat, lon = reading.latitude, reading.longitude
        zone = geo_utils.find_zone(lat, lon)
        zone_weight = zone["weight"] if zone else config.DEFAULT_ZONE_WEIGHT

        severity_result = severity.calculate_severity(normalised, zone_weight)
        occurrences, is_repeat = self._record_sighting(normalised["type"],
                                                       lat, lon)
        priority_result = priority.calculate_priority(
            severity_result,
            latitude=lat,
            longitude=lon,
            speed_kmph=reading.speed_kmph,
            occurrence_count=occurrences,
            zone=zone,
        )

        return Incident(
            incident_id=generate_incident_id(),
            schema_version=config.INCIDENT_SCHEMA_VERSION,
            timestamp=stamp,
            bus={
                "bus_id": self.bus_id,
                "route_id": self.route_id,
                "depot": config.BUS_DEPOT,
                "speed_kmph": reading.speed_kmph,
                "heading_deg": reading.heading_deg,
                "direction": geo_utils.compass_direction(reading.heading_deg),
            },
            detection={
                "type": normalised["type"],
                "confidence": normalised["confidence"],
                "count": normalised["count"],
                "area": normalised["area"],
                "bbox": normalised["bbox"],
                "detector": normalised["detector"],
                "frame_id": normalised["frame_id"],
            },
            location={
                "latitude": lat,
                "longitude": lon,
                "accuracy_m": reading.accuracy_m,
                "altitude_m": reading.altitude_m,
                "satellites": reading.satellites,
                "fix_quality": reading.fix_quality,
                "is_reliable": reading.is_reliable,
                "gps_source": reading.source,
                "segment_id": geo_utils.segment_id(lat, lon),
                "nearest_landmark": reading.nearest_landmark,
                "distance_to_landmark_m": reading.distance_to_landmark_m,
                "zone": priority_result["zone"],
                "coordinates": geo_utils.format_coordinates(lat, lon),
            },
            severity=severity_result,
            priority=priority_result,
            metadata={
                "occurrence_count": occurrences,
                "is_repeat_sighting": is_repeat,
                "reported_at": gps.utc_now_iso(),
                "pipeline": "mock",
            },
        )

    def build_many(self, detections):
        """Score a batch, dropping anything below the confidence floor."""
        incidents = []
        for detection in detections:
            incident = self.build(detection)
            if incident is not None:
                incidents.append(incident)
        return incidents


# --------------------------------------------------------------------------
# Mock detections - replace with the real detector output
# --------------------------------------------------------------------------

# (type, min_confidence, max_confidence, min_area, max_area)
MOCK_DETECTION_TYPES = [
    ("pothole", 0.55, 0.97, 0.04, 0.17),
    ("crack", 0.45, 0.92, 0.01, 0.06),
    ("waterlogging", 0.60, 0.95, 0.06, 0.22),
    ("garbage", 0.50, 0.90, 0.03, 0.12),
    ("streetlight_out", 0.55, 0.93, 0.01, 0.05),
    ("encroachment", 0.48, 0.88, 0.05, 0.18),
    ("pedestrian_risk", 0.62, 0.96, 0.02, 0.09),
    ("vehicle_obstruction", 0.58, 0.94, 0.05, 0.20),
]


def mock_detection(rng=None, detection_type=None):
    """One synthetic detection in the shape the real detector will emit."""
    rng = rng or random.Random()
    spec = next((item for item in MOCK_DETECTION_TYPES
                 if item[0] == detection_type), None)
    if spec is None:
        spec = rng.choice(MOCK_DETECTION_TYPES)

    name, min_confidence, max_confidence, min_area, max_area = spec
    width = rng.uniform(0.08, 0.42)
    area = rng.uniform(min_area, max_area)
    height = min(0.9, area / width)

    return {
        "type": name,
        "confidence": round(rng.uniform(min_confidence, max_confidence), 3),
        "bbox": [round(rng.uniform(0.0, 1.0 - width), 3),
                 round(rng.uniform(0.0, max(0.0, 1.0 - height)), 3),
                 round(width, 3), round(height, 3)],
        "count": rng.choices([1, 2, 3, 4], weights=[62, 22, 11, 5])[0],
        "frame_id": "FRAME-{:06d}".format(rng.randint(1, 999999)),
        "detector": "mock_detector",
    }


def mock_detection_stream(count=8, seed=config.MOCK_RANDOM_SEED):
    """A batch of synthetic detections, reproducible for a given seed."""
    rng = random.Random(seed)
    return [mock_detection(rng) for _ in range(count)]


def run_demo(count=6, seed=config.MOCK_RANDOM_SEED, show_json=True):
    """End-to-end mock run: detections in, scored incident JSON out."""
    builder = IncidentBuilder(gps_provider=gps.MockGPSProvider(seed=seed))
    incidents = builder.build_many(mock_detection_stream(count, seed))

    print("=" * 78)
    print("GPS + INCIDENT INTELLIGENCE - MOCK RUN")
    print("bus {}  route {}  {} detections -> {} incidents".format(
        config.BUS_ID, config.BUS_ROUTE_ID, count, len(incidents)))
    print("=" * 78)
    for incident in incidents:
        print(incident.summary())

    if incidents and show_json:
        print("\n" + "-" * 78)
        print("FINAL INCIDENT JSON (first incident)")
        print("-" * 78)
        print(incidents[0].to_json())

    return incidents


if __name__ == "__main__":
    run_demo()
