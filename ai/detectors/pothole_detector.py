from ultralytics import YOLO


class PotholeDetector:

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

                x1, y1, x2, y2 = box.xyxy[0].tolist()

                # Our model has class ID 0 = pothole
                if class_id == 0:
                    class_name = "pothole"
                else:
                    class_name = self.model.names[class_id]

                detection = {
                    "class": class_name,
                    "confidence": confidence,
                    "bbox": [
                        round(x1, 2),
                        round(y1, 2),
                        round(x2, 2),
                        round(y2, 2)
                    ]
                }

                detections.append(detection)

        return detections