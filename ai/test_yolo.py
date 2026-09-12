from pathlib import Path
from ultralytics import YOLO

BASE_DIR = Path(__file__).resolve().parent

MODEL_PATH = BASE_DIR / "models" / "pothole_model.pt"
IMAGE_PATH = BASE_DIR / "test_images" / "road.jpg"
OUTPUT_DIR = BASE_DIR / "outputs"

OUTPUT_DIR.mkdir(exist_ok=True)

print("Loading model...")
model = YOLO(str(MODEL_PATH))

print("Model classes:")
print(model.names)

print("\nRunning detection...")
results = model(
    str(IMAGE_PATH),
    conf=0.40,
    imgsz=640
)

for result in results:

    print(f"\nDetected objects: {len(result.boxes)}")

    for box in result.boxes:
        class_id = int(box.cls[0])
        confidence = float(box.conf[0])
        bbox = box.xyxy[0].tolist()

        print("Class:", model.names[class_id])
        print("Confidence:", round(confidence, 3))
        print("Bounding box:", bbox)

    output_path = OUTPUT_DIR / "result.jpg"
    result.save(filename=str(output_path))

    print("\nResult saved to:")
    print(output_path)