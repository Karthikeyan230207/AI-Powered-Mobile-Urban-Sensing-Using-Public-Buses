import cv2


def preprocess_frame(frame, width=640, height=480):
    resized_frame = cv2.resize(frame, (width, height))

    return resized_frame


if __name__ == "__main__":
    image = cv2.imread("data/frames/frame_0000.jpg")

    if image is None:
        print("Error: Could not read frame.")
    else:
        processed = preprocess_frame(image)

        cv2.imwrite(
            "data/frames/frame_0000_processed.jpg",
            processed
        )

        print("Frame preprocessed successfully.")
        print("Saved as: data/frames/frame_0000_processed.jpg")