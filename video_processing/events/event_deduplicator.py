def remove_duplicate_events(events):
    unique_events = []
    seen_objects = set()

    for event in events:
        object_id = event["object_id"]

        if object_id not in seen_objects:
            unique_events.append(event)
            seen_objects.add(object_id)

    return unique_events


if __name__ == "__main__":
    events = [
        {
            "event_type": "vehicle_detected",
            "object_id": 1,
            "bbox": [100, 100, 200, 200]
        },
        {
            "event_type": "vehicle_detected",
            "object_id": 1,
            "bbox": [105, 105, 205, 205]
        },
        {
            "event_type": "pedestrian_detected",
            "object_id": 2,
            "bbox": [300, 150, 350, 300]
        }
    ]

    unique_events = remove_duplicate_events(events)

    print("Events after removing duplicates:")

    for event in unique_events:
        print(event)