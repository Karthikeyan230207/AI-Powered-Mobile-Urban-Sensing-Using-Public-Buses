import cv2
import os

from video_processing.frame_extractor import extract_frames
from video_processing.frame_sampler import sample_frames
from video_processing.frame_preprocessor import preprocess_frame
from video_processing.config import (    
    INPUT_VIDEO,
    FRAME_FOLDER,
    FRAME_SAMPLE_INTERVAL,
    FRAME_WIDTH,
    FRAME_HEIGHT
)
from ai.ai_detector import AIDetector

def process_video(video_path):
    detector = AIDetector()
    output_folder = FRAME_FOLDER

    # Step 1: Extract frames
    extract_frames(video_path, output_folder)

    # Step 2: Get extracted frame files
    frame_files = sorted(
    [
        os.path.join(output_folder, file)
        for file in os.listdir(output_folder)
        if file.startswith("frame_")
        and file.endswith(".jpg")
        and "_processed" not in file
    ]
)

    # Step 3: Sample frames
    sampled_files = sample_frames(
    frame_files,
    interval=FRAME_SAMPLE_INTERVAL
)

    print(f"Total extracted frames: {len(frame_files)}")
    print(f"Total sampled frames: {len(sampled_files)}")

    # Step 4: Preprocess sampled frames
    for frame_file in sampled_files:
        frame = cv2.imread(frame_file)

        if frame is None:
            continue

        processed_frame = preprocess_frame(
    frame,
    width=FRAME_WIDTH,
    height=FRAME_HEIGHT
        )
        detections = detector.detect(processed_frame)
        print(f"Detections for {frame_file}: {detections}")

        print(f"Processed: {frame_file}")

    print("Video pipeline completed successfully.")


if __name__ == "__main__":
    process_video(INPUT_VIDEO)