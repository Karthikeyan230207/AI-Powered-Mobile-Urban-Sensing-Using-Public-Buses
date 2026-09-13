from ai.detectors.pothole_detector import PotholeDetector
from ai.detectors.crack_detector import CrackDetector
from ai.detectors.object_detector import ObjectDetector


class DetectionEngine:

    def __init__(
        self,
        pothole_model_path,
        crack_model_path,
        object_model_path,
        confidence_threshold=0.40
    ):

        self.pothole_detector = PotholeDetector(
            pothole_model_path,
            confidence_threshold
        )

        self.crack_detector = CrackDetector(
            crack_model_path,
            confidence_threshold
        )

        self.object_detector = ObjectDetector(
            object_model_path,
            confidence_threshold
        )

    def detect(self, image):

        pothole_detections = self.pothole_detector.detect(image)

        crack_detections = self.crack_detector.detect(image)

        object_detections = self.object_detector.detect(image)

        return (
            pothole_detections
            + crack_detections
            + object_detections
        )