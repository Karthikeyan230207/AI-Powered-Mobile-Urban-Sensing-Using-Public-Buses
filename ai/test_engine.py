from detection_engine import DetectionEngine
from config import MODEL_PATH


def main():

    print("Starting AI Detection Engine...")

    engine = DetectionEngine(MODEL_PATH)

    image_path = "test_images/road.jpg"

    print(f"Processing image: {image_path}")

    detections = engine.detect(image_path)

    print("\n========== DETECTION RESULTS ==========")

    if not detections:
        print("No potholes detected.")
    else:
        for detection in detections:
            print(f"Class      : {detection['class']}")
            print(f"Confidence : {detection['confidence']}")
            print(f"Bounding Box: {detection['bbox']}")
            print("---------------------------------------")

    print("=======================================")


if __name__ == "__main__":
    main()