import argparse
import cv2
from ultralytics import YOLO

VEHICLES = {"car", "motorcycle", "bus", "truck"}

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--source", default="0")
    p.add_argument("--model", default="yolo11n.pt")
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

        result = model.predict(frame, conf=.35, verbose=False)[0]
        counts = {x: 0 for x in VEHICLES}

        for box in result.boxes:
            name = str(result.names[int(box.cls[0])]).lower()
            if name in counts:
                counts[name] += 1

        total = sum(counts.values())
        level = "LOW" if total <= 10 else "MEDIUM" if total <= 25 else "HIGH"
        print("\rVehicles:", total, "Traffic:", level, counts, end="")

        if args.show:
            cv2.imshow("Traffic Detection", result.plot())
            if cv2.waitKey(1) & 255 == 27:
                break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
