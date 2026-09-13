import cv2
import os


def extract_frames(video_path, output_folder):
    video = cv2.VideoCapture(video_path)

    if not video.isOpened():
        print("Error: Could not open video.")
        return

    os.makedirs(output_folder, exist_ok=True)

    frame_count = 0

    while True:
        success, frame = video.read()

        if not success:
            break

        frame_name = os.path.join(
            output_folder,
            f"frame_{frame_count:04d}.jpg"
        )

        cv2.imwrite(frame_name, frame)
        frame_count += 1

    video.release()

    print(f"Extracted {frame_count} frames.")
    print(f"Frames saved in: {output_folder}")


if __name__ == "__main__":
    extract_frames("input.mp4", "data/frames")