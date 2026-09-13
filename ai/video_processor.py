import cv2
from ai_detector import AIDetector


class VideoProcessor:

    def __init__(self, video_path):
        self.video_path = video_path
        self.detector = AIDetector()

    def process(self):

        cap = cv2.VideoCapture(self.video_path)

        if not cap.isOpened():
            print("ERROR: Could not open video")
            return

        frame_number = 0

        print("\n========================================")
        print("        M2 VIDEO PROCESSING")
        print("========================================")

        while True:

            ret, frame = cap.read()

            if not ret:
                break

            frame_number += 1

            # Send frame to M1
            detections = self.detector.detect(frame)

            if detections:

                print(f"\nFrame {frame_number}")
                print(f"Detections: {len(detections)}")

                for detection in detections:

                    print(
                        f"  {detection['class']} "
                        f"| Confidence: {detection['confidence']:.2f}"
                    )

        cap.release()

        print("\n========================================")
        print("       VIDEO PROCESSING COMPLETE")
        print("========================================")


if __name__ == "__main__":

    video_path = "test_videos/test.mp4"

    processor = VideoProcessor(video_path)

    processor.process()