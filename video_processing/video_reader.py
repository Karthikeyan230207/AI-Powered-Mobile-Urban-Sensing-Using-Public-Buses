import cv2


def read_video(video_path):
    video = cv2.VideoCapture(video_path)

    if not video.isOpened():
        print("Error: Could not open video.")
        return

    frame_count = 0

    while True:
        success, frame = video.read()

        if not success:
            break

        frame_count += 1

    video.release()

    print(f"Video processed successfully.")
    print(f"Total frames: {frame_count}")


if __name__ == "__main__":
    read_video("input.mp4")