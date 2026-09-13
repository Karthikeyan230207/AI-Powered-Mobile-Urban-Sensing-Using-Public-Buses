import json

from detection_engine import DetectionEngine
from config import MODEL_PATH


def main():

    engine = DetectionEngine(MODEL_PATH)

    image_path = "test_images/multiple_potholes.jpg"

    detections = engine.detect(image_path)

    print("\nJSON OUTPUT")
    print("===========")

    print(json.dumps(detections, indent=4))


if __name__ == "__main__":
    main()