"""GPS location source for the bus node.

`MockGPSProvider` walks the configured route and synthesises realistic fixes
(speed, heading, accuracy, satellite count) so the rest of the pipeline can be
built and demoed without hardware.

Swapping in a real receiver means writing a class with the same `read()` /
`current()` surface - see `GPSProvider` - and handing it to the incident
builder. Nothing downstream imports the mock directly.
"""

import random
from dataclasses import dataclass, asdict, field
from datetime import datetime, timezone

try:
    from . import config, geo_utils
except ImportError:  # running the module directly, not as a package
    import config
    import geo_utils


@dataclass
class GPSReading:
    """A single positional fix, already normalised for the pipeline."""

    latitude: float
    longitude: float
    timestamp: str                      # UTC ISO-8601, trailing Z
    speed_kmph: float = 0.0
    heading_deg: float = 0.0
    accuracy_m: float = 0.0
    satellites: int = 0
    altitude_m: float = 0.0
    source: str = "mock"
    nearest_landmark: str = ""
    distance_to_landmark_m: float = 0.0

    @property
    def is_reliable(self):
        """A fix good enough to attach to a work order."""
        return (self.accuracy_m <= config.GPS_ACCURACY_THRESHOLD_M
                and self.satellites >= config.GPS_MIN_SATELLITES)

    @property
    def fix_quality(self):
        if not self.satellites:
            return "NO_FIX"
        if self.is_reliable:
            return "GOOD" if self.accuracy_m <= 10.0 else "FAIR"
        return "POOR"

    def to_dict(self):
        data = asdict(self)
        data["fix_quality"] = self.fix_quality
        data["is_reliable"] = self.is_reliable
        data["direction"] = geo_utils.compass_direction(self.heading_deg)
        return data


def utc_now_iso():
    """Current UTC time as an ISO-8601 string with a trailing Z."""
    return datetime.now(timezone.utc).strftime(config.TIMESTAMP_FORMAT) + "Z"


class GPSProvider:
    """Interface every location source must satisfy.

    Implement `read()` against a real receiver (gpsd, NMEA serial, the Android
    location API, ...) and the rest of the intelligence layer is unchanged.
    """

    def read(self):
        """Return a fresh :class:`GPSReading`."""
        raise NotImplementedError

    def current(self):
        """Return the last reading, taking a new one if none exists yet."""
        raise NotImplementedError


class MockGPSProvider(GPSProvider):
    """Simulates a bus crawling along `config.MOCK_ROUTE`.

    Each `read()` advances the bus `step_m` metres along the polyline, wrapping
    back to the start of the route at the end so it can run indefinitely.
    """

    def __init__(self, route=None, step_m=None, seed=config.MOCK_RANDOM_SEED,
                 bus_id=None):
        self.route = list(route or config.MOCK_ROUTE)
        if len(self.route) < 2:
            raise ValueError("MockGPSProvider needs at least two route points")
        self.step_m = step_m or config.MOCK_GPS_STEP_METERS
        self.bus_id = bus_id or config.BUS_ID
        self._random = random.Random(seed)
        self._leg = 0                # index of the route leg being travelled
        self._offset_m = 0.0         # distance already covered on that leg
        self._last = None

    # -- internals ---------------------------------------------------------

    def _leg_endpoints(self):
        start = self.route[self._leg]
        end = self.route[(self._leg + 1) % len(self.route)]
        return start, end

    def _advance(self):
        """Move the virtual bus one step, returning (lat, lon, heading)."""
        start, end = self._leg_endpoints()
        leg_length = geo_utils.haversine_distance(start[0], start[1],
                                                  end[0], end[1])

        self._offset_m += self.step_m
        while self._offset_m >= leg_length:
            # Step spilled past the end of this leg - carry it into the next.
            self._offset_m -= leg_length
            self._leg = (self._leg + 1) % len(self.route)
            start, end = self._leg_endpoints()
            leg_length = geo_utils.haversine_distance(start[0], start[1],
                                                      end[0], end[1])

        fraction = self._offset_m / leg_length if leg_length else 0.0
        lat, lon = geo_utils.interpolate(start[0], start[1], end[0], end[1],
                                         fraction)
        heading = geo_utils.bearing(start[0], start[1], end[0], end[1])
        return lat, lon, heading

    # -- GPSProvider -------------------------------------------------------

    def read(self):
        lat, lon, heading = self._advance()

        # Jitter the fix so consecutive readings are not perfectly on-line.
        accuracy = round(self._random.uniform(*config.MOCK_ACCURACY_M_RANGE), 1)
        jitter_m = self._random.uniform(0, accuracy * 0.5)
        lat, lon = geo_utils.destination_point(
            lat, lon, self._random.uniform(0, 360), jitter_m)

        # Slow down inside busy zones - it makes the congestion signal in
        # priority.py behave the way it would on a real route.
        low, high = config.MOCK_SPEED_KMPH_RANGE
        if geo_utils.find_zone(lat, lon):
            high = low + (high - low) * 0.45
        speed = round(self._random.uniform(low, high), 1)

        landmark, landmark_distance = geo_utils.nearest_landmark(lat, lon)

        self._last = GPSReading(
            latitude=round(lat, 6),
            longitude=round(lon, 6),
            timestamp=utc_now_iso(),
            speed_kmph=speed,
            heading_deg=round(heading, 1),
            accuracy_m=accuracy,
            satellites=self._random.randint(6, 12),
            altitude_m=round(self._random.uniform(4.0, 18.0), 1),
            source="mock",
            nearest_landmark=landmark,
            distance_to_landmark_m=landmark_distance,
        )
        return self._last

    def current(self):
        return self._last if self._last is not None else self.read()

    def track(self, count):
        """Convenience: a list of the next `count` readings."""
        return [self.read() for _ in range(count)]


# Module-level default so callers that just want "where are we?" need no setup.
_default_provider = None


def get_provider():
    """Process-wide default provider (mock until a real one is installed)."""
    global _default_provider
    if _default_provider is None:
        _default_provider = MockGPSProvider()
    return _default_provider


def set_provider(provider):
    """Install a real GPS source. Call this once at start-up."""
    global _default_provider
    if not isinstance(provider, GPSProvider):
        raise TypeError("provider must implement the GPSProvider interface")
    _default_provider = provider
    return _default_provider


def get_current_location():
    """Take a fresh fix from the default provider."""
    return get_provider().read()


if __name__ == "__main__":
    provider = MockGPSProvider()
    for reading in provider.track(5):
        print("{}  {}  {:5.1f} km/h  {:>2} sats  +/-{:4.1f} m  {}  near {}".format(
            reading.timestamp,
            geo_utils.format_coordinates(reading.latitude, reading.longitude),
            reading.speed_kmph, reading.satellites, reading.accuracy_m,
            reading.fix_quality, reading.nearest_landmark))
