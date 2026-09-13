def aggregate_traffic(events):
    traffic_count = {}

    for event in events:
        event_type = event["event_type"]

        if event_type not in traffic_count:
            traffic_count[event_type] = 0

        traffic_count[event_type] += 1

    return traffic_count


if __name__ == "__main__":
    events = [
        {
            "event_type": "vehicle_detected",
            "object_id": 1
        },
        {
            "event_type": "vehicle_detected",
            "object_id": 2
        },
        {
            "event_type": "vehicle_detected",
            "object_id": 3
        },
        {
            "event_type": "pedestrian_detected",
            "object_id": 4
        }
    ]

    traffic = aggregate_traffic(events)

    print("Traffic aggregation:")

    for event_type, count in traffic.items():
        print(f"{event_type}: {count}")