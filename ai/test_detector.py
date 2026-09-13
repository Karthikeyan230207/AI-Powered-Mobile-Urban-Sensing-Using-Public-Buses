import json
import cv2

from detectors.pothole_detector import PotholeDetector
from config import MODEL_PATH, CONFIDENCE_THRESHOLD


def main():

    print("\n========================================")
    print("       POTHOLE DETECTOR TEST")
    print("========================================")

    # Load detector
    detector = PotholeDetector(
        MODEL_PATH,
        CONFIDENCE_THRESHOLD
    )

    # Load test image
    image_path = "test_images/road.jpg"

    print(f"\nProcessing: {image_path}")

    image = cv2.imread(image_path)

    if image is None:
        print("ERROR: Could not load image!")
        return

    # Run detection
    detections = detector.detect(image)

    print(f"\nNumber of detections: {len(detections)}")

    if not detections:
        print("\nResult: NO POTHOLE DETECTED")

    else:
        print("\nResult: POTHOLE(S) DETECTED")

        print("\nJSON OUTPUT")
        print("===========")

        print(json.dumps(detections, indent=4))

    print("\n========================================")
    print("              TEST COMPLETE")
    print("========================================")


if __name__ == "__main__":
    main()