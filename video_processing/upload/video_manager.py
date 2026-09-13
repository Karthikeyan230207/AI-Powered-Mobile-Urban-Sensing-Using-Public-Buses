import os


def manage_video(video_path):
    if not os.path.exists(video_path):
        print("Error: Video file does not exist.")
        return None

    print("Video found successfully.")
    print(f"Video path: {video_path}")

    return video_path


if __name__ == "__main__":
    manage_video("input.mp4")