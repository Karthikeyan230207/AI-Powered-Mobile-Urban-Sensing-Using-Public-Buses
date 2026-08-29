import argparse
from datetime import datetime, timezone
import cv2
import requests
from ultralytics import YOLO

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--source", default="0")
    p.add_argument("--model", default="models/pothole.pt")
    p.add_argument("--api", default="http://127.0.0.1:8000")
    p.add_argument("--bus-id", default="BUS-21")
    p.add_argument("--lat", type=float, default=13.0827)
    p.add_argument("--lon", type=float, default=80.2707)
    p.add_argument("--show", action="store_true")
    args = p.parse_args()

    source = int(args.source) if args.source.isdigit() else args.source
    model = YOLO(args.model)
    cap = cv2.VideoCapture(source)

    if not cap.isOpened():
        raise SystemExit("Could not open video/camera")

    while True:
        ok, frame = cap.read()
        if not ok:
            break

        result = model.predict(frame, conf=.40, verbose=False)[0]

        for box in result.boxes:
            name = str(result.names[int(box.cls[0])]).lower()
            confidence = float(box.conf[0])

            if name == "pothole":
                payload = {
                    "bus_id": args.bus_id,
                    "incident_type": "pothole",
                    "confidence": confidence,
                    "latitude": args.lat,
                    "longitude": args.lon,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "severity": 7,
                    "traffic_level": "MEDIUM",
                    "traffic_count": 15,
                    "verification_count": 1
                }
                try:
                    response = requests.post(
                        args.api + "/api/incidents",
                        json=payload, timeout=5
                    )
                    print(response.json())
                except requests.RequestException as e:
                    print("API error:", e)

        if args.show:
            cv2.imshow("Pothole Detection", result.plot())
            if cv2.waitKey(1) & 255 == 27:
                break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
