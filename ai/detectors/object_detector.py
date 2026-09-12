from ultralytics import YOLO


class ObjectDetector:

    def __init__(self, model_path, confidence_threshold=0.40):
        self.model = YOLO(model_path)
        self.confidence_threshold = confidence_threshold

        self.vehicle_classes = {
            "car",
            "motorcycle",
            "bus",
            "truck"
        }

        self.pedestrian_class = "person"

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
                original_class = self.model.names[class_id]

                # Detect pedestrians
                if original_class == self.pedestrian_class:
                    output_class = "pedestrian"

                # Detect vehicles
                elif original_class in self.vehicle_classes:
                    output_class = "vehicle"

                # Ignore all other classes
                else:
                    continue

                x1, y1, x2, y2 = box.xyxy[0].tolist()

                detections.append({
                    "class": output_class,
                    "confidence": round(confidence, 3),
                    "bbox": [
                        round(x1, 2),
                        round(y1, 2),
                        round(x2, 2),
                        round(y2, 2)
                    ]
                })

        return detections