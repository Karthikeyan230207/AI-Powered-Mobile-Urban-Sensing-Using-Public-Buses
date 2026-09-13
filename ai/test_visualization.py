import cv2

from ai_detector import AIDetector


def main():

    print("\n========================================")
    print("       M1 VISUALIZATION TEST")
    print("========================================")

    image_path = "test_images/overall.jpg"
    output_path = "outputs/overall_detected.jpg"

    print(f"\nLoading: {image_path}")

    image = cv2.imread(image_path)

    if image is None:
        print("ERROR: Could not load image!")
        return

    detector = AIDetector()

    print("\nRunning AI detection...")
    detections = detector.detect(image)

    for detection in detections:

        x1, y1, x2, y2 = map(
            int,
            detection["bbox"]
        )

        class_name = detection["class"]
        confidence = detection["confidence"]

        label = f"{class_name} {confidence:.2f}"

        cv2.rectangle(
            image,
            (x1, y1),
            (x2, y2),
            (0, 255, 0),
            2
        )

        cv2.putText(
            image,
            label,
            (x1, max(y1 - 10, 20)),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            (0, 255, 0),
            2
        )

    cv2.imwrite(output_path, image)

    print(f"\nDetections: {len(detections)}")
    print(f"Output saved to: {output_path}")

    print("\n========================================")
    print("          VISUALIZATION COMPLETE")
    print("========================================")


if __name__ == "__main__":
    main()