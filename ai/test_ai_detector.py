import json
import cv2

from ai_detector import AIDetector


def main():

    print("\n========================================")
    print("        AI DETECTOR INTERFACE TEST")
    print("========================================")

    # Create AI detector
    detector = AIDetector()

    # Load image like M2 would provide a frame
    image_path = "test_images/road.jpg"

    print(f"\nLoading frame: {image_path}")

    frame = cv2.imread(image_path)

    if frame is None:
        print("ERROR: Could not load image!")
        return

    print("Frame loaded successfully.")

    # Send frame to AI Detection Engine
    detections = detector.detect(frame)

    print(f"\nNumber of detections: {len(detections)}")

    if not detections:
        print("\nResult: NO POTHOLE DETECTED")

    else:
        print("\nResult: POTHOLE(S) DETECTED")

        print("\nDETECTION OUTPUT")
        print("================")

        print(json.dumps(detections, indent=4))

    print("\n========================================")
    print("               TEST COMPLETE")
    print("========================================")


if __name__ == "__main__":
    main()