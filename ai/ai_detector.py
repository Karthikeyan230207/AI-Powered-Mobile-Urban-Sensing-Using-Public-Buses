from ai.detection_engine import DetectionEngine
from ai.config import (
    POTHOLE_MODEL_PATH,
    CRACK_MODEL_PATH,
    OBJECT_MODEL_PATH,
    CONFIDENCE_THRESHOLD
)


class AIDetector:

    def __init__(
        self,
        pothole_model_path=POTHOLE_MODEL_PATH,
        crack_model_path=CRACK_MODEL_PATH,
        object_model_path=OBJECT_MODEL_PATH,
        confidence_threshold=CONFIDENCE_THRESHOLD
    ):

        self.engine = DetectionEngine(
            pothole_model_path,
            crack_model_path,
            object_model_path,
            confidence_threshold
        )

    def detect(self, frame):
        return self.engine.detect(frame)