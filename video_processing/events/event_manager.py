class EventManager:
    def __init__(self):
        self.events = []

    def add_event(self, event):
        self.events.append(event)

    def get_events(self):
        return self.events


if __name__ == "__main__":
    manager = EventManager()

    manager.add_event({
        "event_type": "vehicle_detected",
        "object_id": 1,
        "bbox": [100, 100, 200, 200]
    })

    manager.add_event({
        "event_type": "pedestrian_detected",
        "object_id": 2,
        "bbox": [300, 150, 350, 300]
    })

    print("Current events:")

    for event in manager.get_events():
        print(event)