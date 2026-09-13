import cv2
import os


def create_video(frame_folder, output_path, fps=10):
    frame_files = sorted(
        [
            file for file in os.listdir(frame_folder)
            if file.startswith("frame_")
            and file.endswith(".jpg")
            and "_processed" not in file
        ]
    )

    if not frame_files:
        print("Error: No frames found.")
        return

    first_frame = cv2.imread(
        os.path.join(frame_folder, frame_files[0])
    )

    if first_frame is None:
        print("Error: Could not read first frame.")
        return

    height, width = first_frame.shape[:2]

    video_writer = cv2.VideoWriter(
        output_path,
        cv2.VideoWriter_fourcc(*"mp4v"),
        fps,
        (width, height)
    )

    for frame_file in frame_files:
        frame = cv2.imread(
            os.path.join(frame_folder, frame_file)
        )

        if frame is not None:
            video_writer.write(frame)

    video_writer.release()

    print("Video created successfully.")
    print(f"Saved as: {output_path}")


if __name__ == "__main__":
    create_video(
        "data/frames",
        "data/processed_video.mp4"
    )