import cv2

from ai_detector import AIDetector


def main():

    print("\n========================================")
    print("        M1 AI DETECTION TEST")
    print("========================================")

    image_path = "test_images/overall.jpg"

    print(f"\nLoading: {image_path}")

    frame = cv2.imread(image_path)

    if frame is None:
        print("ERROR: Could not load image!")
        return

    detector = AIDetector()

    print("\nRunning all detectors...")
    detections = detector.detect(frame)

    detected_classes = {
        detection["class"]
        for detection in detections
    }

    print("\nRESULTS")
    print("=======")

    tests = {
        "Pothole": "pothole",
        "Crack": "crack",
        "Vehicle": "vehicle",
        "Pedestrian": "pedestrian"
    }

    passed = 0

    for name, class_name in tests.items():

        if class_name in detected_classes:
            print(f"{name:<12}: PASS")
            passed += 1
        else:
            print(f"{name:<12}: FAIL")

    print("\n----------------------------------------")
    print(f"Detections returned: {len(detections)}")
    print(f"Tests passed: {passed}/4")

    if passed == 4:
        print("\nOVERALL M1 TEST: PASS")
    else:
        print("\nOVERALL M1 TEST: PARTIAL")

    print("========================================")


if __name__ == "__main__":
    main()