"""Configuration for the GPS + Incident Intelligence layer.

Every tunable value used by gps.py, severity.py, priority.py, geo_utils.py and
incident.py lives here so the pipeline can be re-tuned without touching logic.
Values can be overridden with environment variables where noted.
"""

import os

# --------------------------------------------------------------------------
# Identity / schema
# --------------------------------------------------------------------------

# Which bus this node is bolted to. Override per-device with BUS_ID.
BUS_ID = os.getenv("BUS_ID", "TN-01-AB-1234")
BUS_ROUTE_ID = os.getenv("BUS_ROUTE_ID", "ROUTE-27C")
BUS_DEPOT = os.getenv("BUS_DEPOT", "Saidapet Depot")

# Bumped whenever the incident JSON shape changes, so the backend can migrate.
INCIDENT_SCHEMA_VERSION = "1.0"

# Prefix for generated incident ids: INC-20260910-1A2B3C4D
INCIDENT_ID_PREFIX = "INC"

# Timestamps are emitted as UTC ISO-8601 with a trailing "Z".
TIMESTAMP_FORMAT = "%Y-%m-%dT%H:%M:%S"

# --------------------------------------------------------------------------
# GPS
# --------------------------------------------------------------------------

# Mock route: a loop through central Chennai. Real hardware replaces the mock
# provider entirely; these points only feed MockGPSProvider.
MOCK_ROUTE = [
    (13.082680, 80.270718, "Chennai Central"),
    (13.078900, 80.264500, "Park Town"),
    (13.070100, 80.258300, "Egmore"),
    (13.060500, 80.249800, "Chetpet"),
    (13.052300, 80.250900, "Nungambakkam"),
    (13.041800, 80.245400, "T. Nagar"),
    (13.033500, 80.240100, "Saidapet"),
    (13.021900, 80.234700, "Guindy"),
    (13.008400, 80.221300, "Velachery Link"),
    (12.995100, 80.216800, "Perungudi"),
]

# Metres advanced along the route between two successive mock readings.
MOCK_GPS_STEP_METERS = 120.0

# Mock speed envelope (km/h) - city bus with traffic.
MOCK_SPEED_KMPH_RANGE = (8.0, 46.0)

# Mock horizontal accuracy envelope (metres). Anything above
# GPS_ACCURACY_THRESHOLD_M is flagged as a low-confidence fix.
MOCK_ACCURACY_M_RANGE = (3.0, 18.0)

# Fixes worse than this are still emitted but marked unreliable.
GPS_ACCURACY_THRESHOLD_M = 25.0

# Satellites below this count downgrades the fix quality.
GPS_MIN_SATELLITES = 5

# Seed for the mock providers. Set to None for non-repeatable runs.
MOCK_RANDOM_SEED = int(os.getenv("MOCK_RANDOM_SEED", "42"))

# --------------------------------------------------------------------------
# Geo
# --------------------------------------------------------------------------

EARTH_RADIUS_M = 6_371_008.8

# Grid cell size used to bucket incidents into road segments for dedupe /
# clustering. ~50 m at Chennai's latitude.
SEGMENT_GRID_SIZE_M = 50.0

# Two detections of the same type within this radius are treated as the same
# physical defect.
DUPLICATE_RADIUS_M = 30.0

# Zones of interest. Each zone lifts (or lowers) the priority of anything
# detected inside it. Radius is in metres.
#   weight > 1.0 -> escalate, weight < 1.0 -> de-escalate
ZONES = [
    {"id": "Z-SCH-01", "name": "Government School, Egmore",
     "type": "school", "lat": 13.070100, "lon": 80.258300,
     "radius_m": 400, "weight": 1.35},
    {"id": "Z-HOS-01", "name": "Govt General Hospital",
     "type": "hospital", "lat": 13.080200, "lon": 80.277600,
     "radius_m": 500, "weight": 1.40},
    {"id": "Z-MKT-01", "name": "T. Nagar Market",
     "type": "market", "lat": 13.041800, "lon": 80.245400,
     "radius_m": 600, "weight": 1.25},
    {"id": "Z-JCT-01", "name": "Guindy Junction",
     "type": "junction", "lat": 13.021900, "lon": 80.234700,
     "radius_m": 350, "weight": 1.20},
    {"id": "Z-IND-01", "name": "Perungudi IT Corridor",
     "type": "industrial", "lat": 12.995100, "lon": 80.216800,
     "radius_m": 800, "weight": 1.05},
]

DEFAULT_ZONE_WEIGHT = 1.0

# --------------------------------------------------------------------------
# Severity
# --------------------------------------------------------------------------

# Base severity (0-100) per detection class, before confidence / size / count
# adjustments. Unknown classes fall back to SEVERITY_DEFAULT_BASE.
SEVERITY_BASE_SCORES = {
    "pothole": 62,
    "crack": 38,
    "waterlogging": 70,
    "garbage": 30,
    "streetlight_out": 34,
    "encroachment": 42,
    "damaged_sign": 36,
    "pedestrian_risk": 74,
    "vehicle_obstruction": 55,
    "accident": 92,
}

SEVERITY_DEFAULT_BASE = 40

# Label variants a real detector might emit, mapped onto the canonical classes
# above. Matching happens after lower-casing and underscore-joining, so
# "Pot Hole", "POTHOLE" and "pot_hole" all land on "pothole". Extend this when
# wiring in the model in ai/ rather than renaming the model's classes.
DETECTION_TYPE_ALIASES = {
    "pot_hole": "pothole",
    "potholes": "pothole",
    "road_crack": "crack",
    "cracks": "crack",
    "surface_crack": "crack",
    "water_logging": "waterlogging",
    "flooding": "waterlogging",
    "stagnant_water": "waterlogging",
    "trash": "garbage",
    "waste": "garbage",
    "garbage_dump": "garbage",
    "street_light_out": "streetlight_out",
    "broken_streetlight": "streetlight_out",
    "street_light": "streetlight_out",
    "illegal_encroachment": "encroachment",
    "broken_sign": "damaged_sign",
    "damaged_signage": "damaged_sign",
    "pedestrian": "pedestrian_risk",
    "jaywalking": "pedestrian_risk",
    "obstruction": "vehicle_obstruction",
    "blocked_lane": "vehicle_obstruction",
    "illegal_parking": "vehicle_obstruction",
    "collision": "accident",
    "crash": "accident",
}

# How much each signal can move the base score.
SEVERITY_WEIGHTS = {
    "confidence": 0.45,   # detector confidence, 0..1
    "size": 0.30,         # normalised bounding-box area, 0..1
    "count": 0.15,        # how many instances in the frame
    "zone": 0.10,         # zone weight nudge
}

# How far the combined signals may move the base score, as a fraction of it.
# 0.5 -> a class scores between 0.5x and 1.5x its base severity, so the
# detection class stays the dominant term and only genuinely extreme cases
# reach the top of a band.
SEVERITY_MODIFIER_RANGE = 0.5

# Bounding-box area fraction (of the frame) that counts as "maximum size".
SIZE_SATURATION_AREA = 0.18

# Instances at or above this count saturate the count contribution.
COUNT_SATURATION = 5

# Detections below this confidence are dropped before scoring.
MIN_DETECTION_CONFIDENCE = 0.35

# Severity score -> label. Checked from the top down.
SEVERITY_LEVELS = [
    (80, "CRITICAL"),
    (60, "HIGH"),
    (40, "MEDIUM"),
    (0, "LOW"),
]

# --------------------------------------------------------------------------
# Priority
# --------------------------------------------------------------------------

# Contribution of each factor to the final priority score (must sum to 1.0).
PRIORITY_WEIGHTS = {
    "severity": 0.55,
    "zone": 0.20,
    "recurrence": 0.15,
    "traffic": 0.10,
}

# Repeat sightings of the same defect at the same spot escalate it.
RECURRENCE_SATURATION = 4

# Bus speed (km/h) below this suggests congestion at the incident location.
CONGESTION_SPEED_KMPH = 12.0

# Priority bands: (min_score, code, label, SLA in hours).
PRIORITY_LEVELS = [
    (80, "P1", "IMMEDIATE", 4),
    (60, "P2", "URGENT", 24),
    (40, "P3", "SCHEDULED", 72),
    (0, "P4", "ROUTINE", 168),
]

# A defect this severe is escalated to PRIORITY_ESCALATION_LEVEL regardless of
# context: an accident on an empty bypass is still an emergency, and must not
# have to wait on a zone or congestion bonus to be seen as one.
PRIORITY_ESCALATION_SEVERITY = 88
PRIORITY_ESCALATION_LEVEL = "P1"

# Departments that own each detection class - used for auto-routing.
DEPARTMENT_ROUTING = {
    "pothole": "Highways & Roads",
    "crack": "Highways & Roads",
    "waterlogging": "Storm Water Drainage",
    "garbage": "Solid Waste Management",
    "streetlight_out": "Electrical",
    "encroachment": "Town Planning",
    "damaged_sign": "Traffic Police",
    "pedestrian_risk": "Traffic Police",
    "vehicle_obstruction": "Traffic Police",
    "accident": "Emergency Response",
}

DEFAULT_DEPARTMENT = "General Works"
