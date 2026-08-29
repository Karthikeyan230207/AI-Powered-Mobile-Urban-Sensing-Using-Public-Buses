# AI-Powered Mobile Urban Intelligence Platform

Hackathon MVP: public buses become mobile AI road-sensing units.

Features:
- Pothole detection with YOLO/Ultralytics
- Vehicle/traffic detection
- GPS and bus metadata
- FastAPI + SQLite backend
- Cross-bus verification
- Priority scoring
- Leaflet GIS dashboard
- Repair workflow

## Run

Install:
`pip install -r requirements.txt`

Start:
`uvicorn backend.main:app --reload`

Dashboard:
`http://127.0.0.1:8000/dashboard`

Click **Load Demo Data**.

## AI

Put a pothole-trained YOLO model at `models/pothole.pt`.
Put a road video at `videos/road_video.mp4`.

Run:
`python ai/pothole_detection.py --source videos/road_video.mp4 --model models/pothole.pt --show`

A generic COCO YOLO model does NOT detect potholes; a pothole-trained model is required.
