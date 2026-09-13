import cv2

from ai.ai_detector import AIDetector
from intelligence.incident import (
    IncidentBuilder,
    send_incident_to_m3
)


class VideoProcessor:

    def __init__(self, video_path, bus_id=None, route_id=None):

        self.video_path = video_path

        # ==============================================================
        # M1 - AI Detector
        # ==============================================================

        self.detector = AIDetector()

        # ==============================================================
        # M4 - Incident Intelligence
        # ==============================================================

        self.incident_builder = IncidentBuilder(
            bus_id=bus_id,
            route_id=route_id
        )

        # ==============================================================
        # Only these detection types become civic incidents
        # ==============================================================

        self.incident_types = {
            "pothole",
            "crack"
        }

        # ==============================================================
        # DUPLICATE PROTECTION
        # ==============================================================

        # Stores the last frame where each defect type was reported.
        #
        # Example:
        #
        # pothole -> frame 100
        # crack   -> frame 150
        #
        self.last_reported_frame = {}

        # Ignore the same defect type for these many frames.
        #
        # At 30 FPS:
        # 30 frames ≈ 1 second
        #
        self.duplicate_frame_window = 30


    # ==================================================================
    # Convert M1 bbox -> M4 bbox
    # ==================================================================

    def convert_detection(
        self,
        detection,
        frame_width,
        frame_height,
        frame_number
    ):
        """
        Convert M1 detection format into the format expected by M4.

        M1:
            bbox = [x1, y1, x2, y2]

        M4:
            bbox = [x, y, width, height]
            normalized to 0..1
        """

        x1, y1, x2, y2 = detection["bbox"]

        # Convert xyxy -> xywh
        width = x2 - x1
        height = y2 - y1

        # Normalize coordinates
        x = x1 / frame_width
        y = y1 / frame_height

        normalized_width = width / frame_width
        normalized_height = height / frame_height

        return {
            "type": detection["class"],

            "confidence": detection["confidence"],

            "bbox": [
                round(x, 4),
                round(y, 4),
                round(normalized_width, 4),
                round(normalized_height, 4)
            ],

            # M4 severity.py calculates area from bbox
            "count": 1,

            "frame_id": f"FRAME-{frame_number:06d}",

            "detector": "ai_detector"
        }


    # ==================================================================
    # Check frame-level duplicate
    # ==================================================================

    def is_frame_duplicate(
        self,
        detection_class,
        frame_number
    ):
        """
        Prevent the same detection type from becoming
        an incident on every consecutive frame.

        Example:

            Frame 100 -> pothole -> SEND
            Frame 101 -> pothole -> SKIP
            Frame 102 -> pothole -> SKIP
            ...
            Frame 129 -> pothole -> SKIP
            Frame 130 -> pothole -> SEND
        """

        last_frame = self.last_reported_frame.get(
            detection_class
        )

        if last_frame is None:
            return False

        return (
            frame_number - last_frame
            < self.duplicate_frame_window
        )


    # ==================================================================
    # Process video
    # ==================================================================

    def process(self):

        cap = cv2.VideoCapture(self.video_path)

        if not cap.isOpened():

            print(
                "ERROR: Could not open video"
            )

            return

        frame_number = 0

        frame_width = int(
            cap.get(cv2.CAP_PROP_FRAME_WIDTH)
        )

        frame_height = int(
            cap.get(cv2.CAP_PROP_FRAME_HEIGHT)
        )

        fps = cap.get(
            cv2.CAP_PROP_FPS
        )

        print("\n========================================")
        print("        M2 VIDEO PROCESSING")
        print("========================================")

        print(
            f"Video: {self.video_path}"
        )

        print(
            f"Resolution: "
            f"{frame_width} x {frame_height}"
        )

        print(
            f"FPS: {fps:.2f}"
        )

        print("\n[M2] M1 AI detector connected")
        print("[M2] M4 IncidentBuilder connected")
        print("[M2] M3 API integration connected")

        print(
            f"[M2] Duplicate window: "
            f"{self.duplicate_frame_window} frames"
        )

        incidents_sent = 0
        detections_found = 0
        duplicates_skipped = 0

        # ==============================================================
        # Read frames
        # ==============================================================

        while True:

            ret, frame = cap.read()

            if not ret:
                break

            frame_number += 1

            # ----------------------------------------------------------
            # M2 -> M1
            # ----------------------------------------------------------

            detections = self.detector.detect(
                frame
            )

            if not detections:
                continue

            detections_found += len(
                detections
            )

            print(
                f"\n[M2] Frame {frame_number} | "
                f"Detections: {len(detections)}"
            )

            # ==========================================================
            # Process each M1 detection
            # ==========================================================

            for detection in detections:

                detection_class = detection[
                    "class"
                ]

                print(
                    f"  [M1] {detection_class} | "
                    f"Confidence: "
                    f"{detection['confidence']:.2f}"
                )

                # ------------------------------------------------------
                # Only civic defects become incidents
                # ------------------------------------------------------

                if detection_class not in self.incident_types:

                    print(
                        f"  [M2] Ignored object: "
                        f"{detection_class}"
                    )

                    continue

                # ------------------------------------------------------
                # FRAME DUPLICATE CHECK
                # ------------------------------------------------------

                if self.is_frame_duplicate(
                    detection_class,
                    frame_number
                ):

                    duplicates_skipped += 1

                    last_frame = (
                        self.last_reported_frame[
                            detection_class
                        ]
                    )

                    print(
                        f"  [M2] Duplicate skipped | "
                        f"{detection_class} | "
                        f"Last reported frame: "
                        f"{last_frame}"
                    )

                    continue

                # ------------------------------------------------------
                # Convert M1 -> M4
                # ------------------------------------------------------

                m4_detection = self.convert_detection(
                    detection,
                    frame_width,
                    frame_height,
                    frame_number
                )

                print(
                    f"  [M2 -> M4] "
                    f"{m4_detection['type']}"
                )

                # ------------------------------------------------------
                # M4 Incident Intelligence
                # ------------------------------------------------------

                incident = self.incident_builder.build(
                    m4_detection
                )

                # M4 confidence filter
                if incident is None:

                    print(
                        "  [M4] Detection not reportable"
                    )

                    continue

                # ------------------------------------------------------
                # M4 spatial duplicate check
                # ------------------------------------------------------

                is_repeat = incident.metadata.get(
                    "is_repeat_sighting",
                    False
                )

                occurrence_count = incident.metadata.get(
                    "occurrence_count",
                    1
                )

                if is_repeat:

                    duplicates_skipped += 1

                    print(
                        f"  [M4] Repeat sighting skipped | "
                        f"Occurrences: "
                        f"{occurrence_count}"
                    )

                    continue

                # ======================================================
                # INCIDENT CREATED
                # ======================================================

                print(
                    f"  [M4] INCIDENT CREATED | "
                    f"ID: {incident.incident_id}"
                )

                print(
                    f"       Type: "
                    f"{incident.detection['type']}"
                )

                print(
                    f"       Severity: "
                    f"{incident.severity['level']} "
                    f"({incident.severity['score']})"
                )

                print(
                    f"       Priority: "
                    f"{incident.priority['level']}"
                )

                print(
                    f"       GPS: "
                    f"{incident.location['latitude']}, "
                    f"{incident.location['longitude']}"
                )

                # ======================================================
                # M4 -> M3 -> M6 -> M5
                # ======================================================

                result = send_incident_to_m3(
                    incident
                )

                if result:

                    incidents_sent += 1

                    # --------------------------------------------------
                    # IMPORTANT
                    #
                    # Only remember the frame AFTER the incident
                    # successfully reaches M3.
                    # --------------------------------------------------

                    self.last_reported_frame[
                        detection_class
                    ] = frame_number

                    print(
                        f"  [M2] Incident reported "
                        f"successfully at frame "
                        f"{frame_number}"
                    )

                else:

                    print(
                        f"  [M4 -> M3] "
                        f"Failed to send incident"
                    )

        # ==============================================================
        # Cleanup
        # ==============================================================

        cap.release()

        # ==============================================================
        # Final statistics
        # ==============================================================

        print("\n========================================")
        print("       VIDEO PROCESSING COMPLETE")
        print("========================================")

        print(
            f"Frames processed: "
            f"{frame_number}"
        )

        print(
            f"AI detections: "
            f"{detections_found}"
        )

        print(
            f"Incidents sent to M3: "
            f"{incidents_sent}"
        )

        print(
            f"Repeated detections skipped: "
            f"{duplicates_skipped}"
        )

        print("========================================")


# ======================================================================
# Run directly
# ======================================================================

if __name__ == "__main__":

    video_path = "ai/test_video/test.mp4"

    processor = VideoProcessor(
        video_path=video_path,
        bus_id="BUS-21",
        route_id="ROUTE-21"
    )

    processor.process()