"""Pure geospatial helpers shared by the intelligence layer.

No I/O, no state - every function takes plain floats/dicts so it can be reused
by the mock pipeline today and the real GPS feed later.
"""

import math

try:
    from . import config
except ImportError:  # running the module directly, not as a package
    import config


def _to_radians(degrees):
    return degrees * math.pi / 180.0


def haversine_distance(lat1, lon1, lat2, lon2):
    """Great-circle distance between two WGS-84 points, in metres."""
    phi1, phi2 = _to_radians(lat1), _to_radians(lat2)
    d_phi = _to_radians(lat2 - lat1)
    d_lambda = _to_radians(lon2 - lon1)

    a = (math.sin(d_phi / 2) ** 2
         + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2)
    return 2 * config.EARTH_RADIUS_M * math.asin(math.sqrt(min(1.0, a)))


def bearing(lat1, lon1, lat2, lon2):
    """Initial compass bearing from point 1 to point 2, in degrees (0-360)."""
    phi1, phi2 = _to_radians(lat1), _to_radians(lat2)
    d_lambda = _to_radians(lon2 - lon1)

    y = math.sin(d_lambda) * math.cos(phi2)
    x = (math.cos(phi1) * math.sin(phi2)
         - math.sin(phi1) * math.cos(phi2) * math.cos(d_lambda))
    return (math.degrees(math.atan2(y, x)) + 360.0) % 360.0


def destination_point(lat, lon, bearing_deg, distance_m):
    """Point reached by travelling `distance_m` along `bearing_deg` from (lat, lon)."""
    angular = distance_m / config.EARTH_RADIUS_M
    phi1, lambda1 = _to_radians(lat), _to_radians(lon)
    theta = _to_radians(bearing_deg)

    phi2 = math.asin(math.sin(phi1) * math.cos(angular)
                     + math.cos(phi1) * math.sin(angular) * math.cos(theta))
    lambda2 = lambda1 + math.atan2(
        math.sin(theta) * math.sin(angular) * math.cos(phi1),
        math.cos(angular) - math.sin(phi1) * math.sin(phi2),
    )
    return math.degrees(phi2), (math.degrees(lambda2) + 540.0) % 360.0 - 180.0


def interpolate(lat1, lon1, lat2, lon2, fraction):
    """Point `fraction` (0..1) of the way from point 1 to point 2."""
    fraction = max(0.0, min(1.0, fraction))
    total = haversine_distance(lat1, lon1, lat2, lon2)
    if total == 0.0:
        return lat1, lon1
    return destination_point(lat1, lon1, bearing(lat1, lon1, lat2, lon2),
                             total * fraction)


def bounding_box(lat, lon, radius_m):
    """Axis-aligned (min_lat, min_lon, max_lat, max_lon) box around a point.

    Useful as a cheap pre-filter before running haversine on a large table.
    """
    d_lat = math.degrees(radius_m / config.EARTH_RADIUS_M)
    cos_lat = max(1e-9, math.cos(_to_radians(lat)))
    d_lon = math.degrees(radius_m / (config.EARTH_RADIUS_M * cos_lat))
    return lat - d_lat, lon - d_lon, lat + d_lat, lon + d_lon


def is_within_radius(lat1, lon1, lat2, lon2, radius_m):
    """True when the two points are at most `radius_m` apart."""
    return haversine_distance(lat1, lon1, lat2, lon2) <= radius_m


def find_zone(lat, lon):
    """Innermost zone of interest containing the point, or None.

    When zones overlap the one whose centre is nearest wins, so a hospital
    gate inside a wider market zone still routes as a hospital.
    """
    matches = []
    for zone in config.ZONES:
        distance = haversine_distance(lat, lon, zone["lat"], zone["lon"])
        if distance <= zone["radius_m"]:
            matches.append((distance, zone))
    if not matches:
        return None
    return min(matches, key=lambda item: item[0])[1]


def zone_weight(lat, lon):
    """Priority multiplier for the point's zone (1.0 when outside every zone)."""
    zone = find_zone(lat, lon)
    return zone["weight"] if zone else config.DEFAULT_ZONE_WEIGHT


def nearest_landmark(lat, lon, landmarks=None):
    """Closest known route landmark as (name, distance_m)."""
    landmarks = landmarks if landmarks is not None else config.MOCK_ROUTE
    best_name, best_distance = None, float("inf")
    for point_lat, point_lon, name in landmarks:
        distance = haversine_distance(lat, lon, point_lat, point_lon)
        if distance < best_distance:
            best_name, best_distance = name, distance
    return best_name, round(best_distance, 1)


def segment_id(lat, lon, grid_size_m=None):
    """Stable id for the ~grid_size_m road cell containing the point.

    Incidents that land in the same cell are candidates for deduplication and
    recurrence counting without needing a spatial database.
    """
    grid_size_m = grid_size_m or config.SEGMENT_GRID_SIZE_M
    lat_step = math.degrees(grid_size_m / config.EARTH_RADIUS_M)
    cos_lat = max(1e-9, math.cos(_to_radians(lat)))
    lon_step = math.degrees(grid_size_m / (config.EARTH_RADIUS_M * cos_lat))
    return "SEG-{}-{}".format(int(math.floor(lat / lat_step)),
                              int(math.floor(lon / lon_step)))


def is_duplicate(lat1, lon1, lat2, lon2, radius_m=None):
    """True when two sightings are close enough to be the same defect."""
    radius_m = radius_m or config.DUPLICATE_RADIUS_M
    return is_within_radius(lat1, lon1, lat2, lon2, radius_m)


def compass_direction(bearing_deg):
    """Bearing in degrees -> 8-point compass label."""
    points = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
    return points[int((bearing_deg % 360.0) / 45.0 + 0.5) % 8]


def format_coordinates(lat, lon, precision=6):
    """Human-readable "13.082680, 80.270718" string."""
    return "{:.{p}f}, {:.{p}f}".format(lat, lon, p=precision)
