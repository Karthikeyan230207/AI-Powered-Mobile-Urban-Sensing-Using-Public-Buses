from ultralytics import YOLO


class CrackDetector:

    def __init__(self, model_path, confidence_threshold=0.40):
        self.model = YOLO(model_path)
        self.confidence_threshold = confidence_threshold

    def detect(self, image):

        results = self.model(
            image,
            conf=self.confidence_threshold,
            imgsz=640
        )

        detections = []

        for result in results:

            for box in result.boxes:

                class_id = int(box.cls[0])
                confidence = float(box.conf[0])

                # Ignore background class
                if class_id == 1:
                    continue

                # Only class 0 = crack
                if class_id != 0:
                    continue

                x1, y1, x2, y2 = box.xyxy[0].tolist()

                detections.append({
                    "class": "crack",
                    "confidence": round(confidence, 3),
                    "bbox": [
                        round(x1, 2),
                        round(y1, 2),
                        round(x2, 2),
                        round(y2, 2)
                    ]
                })

        return detections