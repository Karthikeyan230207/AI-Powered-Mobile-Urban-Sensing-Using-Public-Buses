import json
import cv2

from detectors.object_detector import ObjectDetector


def main():

    print("\n========================================")
    print("       OBJECT DETECTOR TEST")
    print("========================================")

    model_path = "yolo11n.pt"
    image_path = "test_images/road.jpg"

    print(f"\nLoading frame: {image_path}")

    frame = cv2.imread(image_path)

    if frame is None:
        print("ERROR: Could not load image!")
        return

    print("Frame loaded successfully.")

    detector = ObjectDetector(
        model_path=model_path,
        confidence_threshold=0.40
    )

    detections = detector.detect(frame)

    print(f"\nNumber of detections: {len(detections)}")

    print("\nDETECTION OUTPUT")
    print("================")

    if not detections:
        print("No vehicle or pedestrian detected.")
    else:
        print(json.dumps(detections, indent=4))

    print("\n========================================")
    print("             TEST COMPLETE")
    print("========================================")


if __name__ == "__main__":
    main()