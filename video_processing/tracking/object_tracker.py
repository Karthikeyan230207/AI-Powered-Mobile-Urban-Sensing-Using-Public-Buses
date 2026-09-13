class ObjectTracker:
    def __init__(self):
        self.next_id = 1
        self.tracked_objects = {}

    def update(self, detections):
        updated_objects = []

        for detection in detections:
            object_id = self.next_id

            tracked_object = {
                "id": object_id,
                "class": detection["class"],
                "bbox": detection["bbox"]
            }

            self.tracked_objects[object_id] = tracked_object
            updated_objects.append(tracked_object)

            self.next_id += 1

        return updated_objects


if __name__ == "__main__":
    tracker = ObjectTracker()

    detections = [
        {
            "class": "vehicle",
            "bbox": [100, 100, 200, 200]
        },
        {
            "class": "pedestrian",
            "bbox": [300, 150, 350, 300]
        }
    ]

    tracked = tracker.update(detections)

    print("Tracked objects:")

    for obj in tracked:
        print(obj)