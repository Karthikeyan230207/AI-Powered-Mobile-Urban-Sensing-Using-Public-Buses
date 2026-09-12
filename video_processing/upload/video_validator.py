import cv2
import os


def validate_video(video_path):
    if not os.path.exists(video_path):
        return False, "Video file does not exist."

    video = cv2.VideoCapture(video_path)

    if not video.isOpened():
        return False, "Video could not be opened."

    frame_count = int(video.get(cv2.CAP_PROP_FRAME_COUNT))

    video.release()

    if frame_count <= 0:
        return False, "Video contains no frames."

    return True, "Video is valid."


if __name__ == "__main__":
    video_path = "input.mp4"

    valid, message = validate_video(video_path)

    print("Valid:", valid)
    print("Message:", message)