def generate_event(tracked_object):
    event = {
        "event_type": f"{tracked_object['class']}_detected",
        "object_id": tracked_object["id"],
        "bbox": tracked_object["bbox"]
    }

    return event


if __name__ == "__main__":
    tracked_objects = [
        {
            "id": 1,
            "class": "vehicle",
            "bbox": [100, 100, 200, 200]
        },
        {
            "id": 2,
            "class": "pedestrian",
            "bbox": [300, 150, 350, 300]
        }
    ]

    print("Generated events:")

    for tracked_object in tracked_objects:
        event = generate_event(tracked_object)
        print(event)