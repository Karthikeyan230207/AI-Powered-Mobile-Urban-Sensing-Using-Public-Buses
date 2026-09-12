import cv2
import os


def validate_video(video_path):
    # Check if file exists
    if not os.path.exists(video_path):
        return False, "Video file does not exist."

    # Open video
    video = cv2.VideoCapture(video_path)

    if not video.isOpened():
        return False, "Video could not be opened."

    # Get video information
    frame_count = int(video.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = video.get(cv2.CAP_PROP_FPS)
    width = int(video.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(video.get(cv2.CAP_PROP_FRAME_HEIGHT))

    video.release()

    # Check frames
    if frame_count <= 0:
        return False, "Video contains no frames."

    # Check FPS
    if fps <= 0:
        return False, "Invalid video FPS."

    # Check resolution
    if width <= 0 or height <= 0:
        return False, "Invalid video resolution."

    return True, "Video is valid."


if __name__ == "__main__":
    video_path = "input.mp4"

    valid, message = validate_video(video_path)

    print("Valid:", valid)
    print("Message:", message)