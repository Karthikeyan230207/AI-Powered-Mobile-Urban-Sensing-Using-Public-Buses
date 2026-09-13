import cv2
import os

from scipy import stats

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
from video_processing.tracking.simple_tracker import SimpleTracker
from video_processing.events.event_generator import generate_event
from video_processing.events.event_manager import EventManager
from video_processing.events.event_deduplicator import remove_duplicate_events
from video_processing.events.traffic_aggregator import aggregate_traffic
from video_processing.tracking.track_cleanup import TrackCleanup
from video_processing.video_writer import create_video
from video_processing.processing_stats import ProcessingStats
def process_video(video_path):
    detector = AIDetector()
    tracker = SimpleTracker()
    cleanup = TrackCleanup()
    event_manager = EventManager()
    stats = ProcessingStats()
    stats.start()
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
        tracks = tracker.update(detections)
        print(f"Tracks: {tracks}")
        current_track_ids = [track["id"] for track in tracks]
        removed_ids = cleanup.update(current_track_ids)

        if removed_ids:
          print(f"Removed tracks: {removed_ids}")
        for track in tracks:
           event = generate_event(track)
           event_manager.add_event(event)
           print(f"Event: {event}")
        print(f"Detections for {frame_file}: {detections}")
        stats.add_frame()
        print(f"Processed: {frame_file}")
    all_events = event_manager.get_events()
    unique_events = remove_duplicate_events(all_events)

    print(f"Total events generated: {len(all_events)}")
    print(f"Unique events: {len(unique_events)}")
    traffic = aggregate_traffic(unique_events)
    print(f"Traffic summary: {traffic}")
    print(f"Processing FPS: {round(stats.get_fps(), 2)}")
    print("Video pipeline completed successfully.")
    create_video(
       FRAME_FOLDER,
       "data/processed_video.mp4"
    )
if __name__ == "__main__":
    process_video(INPUT_VIDEO)