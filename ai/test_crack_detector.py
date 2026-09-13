import json
import cv2

from detectors.crack_detector import CrackDetector


MODEL_PATH = "models/crack_model.pt"
CONFIDENCE_THRESHOLD = 0.40


def main():

    print("\n========================================")
    print("         CRACK DETECTOR TEST")
    print("========================================")

    detector = CrackDetector(
        MODEL_PATH,
        CONFIDENCE_THRESHOLD
    )

    image_path = "test_images/crack.jpg"

    print(f"\nProcessing: {image_path}")

    image = cv2.imread(image_path)

    if image is None:
        print("ERROR: Could not load image!")
        return

    detections = detector.detect(image)

    print(f"\nNumber of detections: {len(detections)}")

    if not detections:
        print("\nResult: NO CRACK DETECTED")
    else:
        print("\nResult: CRACK(S) DETECTED")

        print("\nJSON OUTPUT")
        print("===========")

        print(json.dumps(detections, indent=4))

    print("\n========================================")
    print("             TEST COMPLETE")
    print("========================================")


if __name__ == "__main__":
    main()