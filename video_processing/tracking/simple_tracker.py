class SimpleTracker:
    def __init__(self, distance_threshold=50):
        self.next_id = 1
        self.tracks = {}
        self.distance_threshold = distance_threshold

    def calculate_center(self, bbox):
        x1, y1, x2, y2 = bbox

        center_x = (x1 + x2) // 2
        center_y = (y1 + y2) // 2

        return center_x, center_y

    def calculate_distance(self, center1, center2):
        x1, y1 = center1
        x2, y2 = center2

        return ((x2 - x1) ** 2 + (y2 - y1) ** 2) ** 0.5

    def update(self, detections):
        updated_tracks = []

        for detection in detections:
            bbox = detection["bbox"]
            center = self.calculate_center(bbox)

            matched_id = None

            for object_id, track in self.tracks.items():
                distance = self.calculate_distance(
                    center,
                    track["center"]
                )

                if distance <= self.distance_threshold:
                    matched_id = object_id
                    break

            if matched_id is None:
                matched_id = self.next_id
                self.next_id += 1

            self.tracks[matched_id] = {
                "class": detection["class"],
                "bbox": bbox,
                "center": center
            }

            updated_tracks.append({
                "id": matched_id,
                "class": detection["class"],
                "bbox": bbox
            })

        return updated_tracks


if __name__ == "__main__":
    tracker = SimpleTracker()

    frame1 = [
        {
            "class": "vehicle",
            "bbox": [100, 100, 200, 200]
        }
    ]

    frame2 = [
        {
            "class": "vehicle",
            "bbox": [105, 105, 205, 205]
        }
    ]

    tracked1 = tracker.update(frame1)
    tracked2 = tracker.update(frame2)

    print("Frame 1:")
    print(tracked1)

    print("\nFrame 2:")
    print(tracked2)