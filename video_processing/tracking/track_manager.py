class TrackManager:
    def __init__(self):
        self.tracks = {}

    def add_track(self, object_id, object_data):
        self.tracks[object_id] = object_data

    def update_track(self, object_id, object_data):
        if object_id in self.tracks:
            self.tracks[object_id] = object_data

    def remove_track(self, object_id):
        if object_id in self.tracks:
            del self.tracks[object_id]

    def get_tracks(self):
        return self.tracks


if __name__ == "__main__":
    manager = TrackManager()

    manager.add_track(
        1,
        {
            "class": "vehicle",
            "bbox": [100, 100, 200, 200]
        }
    )

    manager.add_track(
        2,
        {
            "class": "pedestrian",
            "bbox": [300, 150, 350, 300]
        }
    )

    print("Current tracks:")
    print(manager.get_tracks())

    manager.update_track(
        1,
        {
            "class": "vehicle",
            "bbox": [110, 105, 210, 205]
        }
    )

    print("\nAfter updating vehicle:")
    print(manager.get_tracks())

    manager.remove_track(2)

    print("\nAfter removing pedestrian:")
    print(manager.get_tracks())