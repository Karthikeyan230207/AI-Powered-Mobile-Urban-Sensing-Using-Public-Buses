import { useRef, useState } from "react";

function App() {
  // ============================================================
  // REFS
  // ============================================================

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const gpsWatchRef = useRef(null);

  // AI detection
  const canvasRef = useRef(null);
  const detectionIntervalRef = useRef(null);

  // ============================================================
  // STATE
  // ============================================================

  const [cameraOn, setCameraOn] = useState(false);
  const [location, setLocation] = useState(null);

  const [detecting, setDetecting] = useState(false);
  const [detections, setDetections] = useState([]);

  const [error, setError] = useState("");

  // ============================================================
  // CAMERA
  // ============================================================

  const startCamera = async () => {
    try {
      setError("");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setCameraOn(true);
    } catch (err) {
      console.error("Camera error:", err);

      setError(`${err.name}: ${err.message}`);
    }
  };

  const stopCamera = () => {
    // Stop AI detection first
    stopDetection();

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraOn(false);
  };

  // ============================================================
  // GPS
  // ============================================================

  const startGPS = () => {
    if (!navigator.geolocation) {
      setError("GPS is not supported by this browser.");
      return;
    }

    setError("");

    // Prevent multiple GPS watches
    if (gpsWatchRef.current !== null) {
      return;
    }

    gpsWatchRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const {
          latitude,
          longitude,
          accuracy,
          speed,
          heading,
        } = position.coords;

        const gpsData = {
          latitude,
          longitude,
          accuracy,
          speed,
          heading,
        };

        console.log("📍 GPS:", gpsData);

        setLocation(gpsData);

        sendGPS(gpsData);
      },

      (err) => {
        console.error("GPS error:", err);

        setError(`GPS Error: ${err.message}`);
      },

      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 10000,
      }
    );
  };

  const stopGPS = () => {
    if (gpsWatchRef.current !== null) {
      navigator.geolocation.clearWatch(
        gpsWatchRef.current
      );

      gpsWatchRef.current = null;
    }

    setLocation(null);
  };

  // ============================================================
  // SEND GPS TO BACKEND
  // ============================================================

  const sendGPS = async (gpsData) => {
    try {
      const response = await fetch(
        "https://192.168.43.34:8000/api/mobile/gps",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(gpsData),
        }
      );

      const data = await response.json();

      console.log("📡 GPS sent:", data);
    } catch (error) {
      console.error(
        "GPS backend error:",
        error
      );
    }
  };

  // ============================================================
  // CAPTURE CAMERA FRAME + AI DETECTION
  // ============================================================

  const captureAndDetect = async () => {
    if (
      !videoRef.current ||
      !canvasRef.current
    ) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Camera not ready
    if (video.readyState < 2) {
      return;
    }

    const context = canvas.getContext("2d");

    // Match canvas size with camera frame
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current camera frame
    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    // Convert frame to JPEG
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          return;
        }

        try {
          const formData = new FormData();

          formData.append(
            "file",
            blob,
            "mobile-frame.jpg"
          );

          console.log(
            "📤 Sending camera frame to AI..."
          );

          const response = await fetch(
            "https://192.168.43.34:8000/api/mobile/detect",
            {
              method: "POST",
              body: formData,
            }
          );

          if (!response.ok) {
            throw new Error(
              `Server error: ${response.status}`
            );
          }

          const data = await response.json();

          console.log(
            "🤖 AI Response:",
            data
          );

          if (data.success) {
            setDetections(
              data.detections || []
            );
          } else {
            console.error(
              "AI detection failed:",
              data.message
            );
          }
        } catch (error) {
          console.error(
            "AI detection error:",
            error
          );
        }
      },

      "image/jpeg",

      // JPEG quality
      0.7
    );
  };

  // ============================================================
  // START AI DETECTION
  // ============================================================

  const startDetection = () => {
    if (!cameraOn) {
      setError(
        "Start the camera before starting AI detection."
      );

      return;
    }

    if (detectionIntervalRef.current) {
      return;
    }

    setError("");
    setDetecting(true);

    console.log(
      "🤖 AI detection started"
    );

    // Capture one frame every 1 second
    detectionIntervalRef.current =
      setInterval(() => {
        captureAndDetect();
      }, 1000);
  };

  // ============================================================
  // STOP AI DETECTION
  // ============================================================

  const stopDetection = () => {
    if (
      detectionIntervalRef.current
    ) {
      clearInterval(
        detectionIntervalRef.current
      );

      detectionIntervalRef.current = null;
    }

    setDetecting(false);
    setDetections([]);

    console.log(
      "⛔ AI detection stopped"
    );
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "800px",
        margin: "auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* =====================================================
          TITLE
      ====================================================== */}

      <h1>
        📱 Mobile Urban Sensor
      </h1>

      <p>
        Camera + GPS + AI Detection
      </p>

      {/* =====================================================
          CAMERA
      ====================================================== */}

      <div>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: "100%",
            maxWidth: "600px",
            borderRadius: "10px",
            background: "#000",
          }}
        />
      </div>

      {/* Hidden canvas used to capture frames */}

      <canvas
        ref={canvasRef}
        style={{
          display: "none",
        }}
      />

      {/* =====================================================
          CAMERA BUTTON
      ====================================================== */}

      <div
        style={{
          marginTop: "15px",
        }}
      >
        {!cameraOn ? (
          <button onClick={startCamera}>
            📷 Start Camera
          </button>
        ) : (
          <button onClick={stopCamera}>
            ⛔ Stop Camera
          </button>
        )}
      </div>

      {/* =====================================================
          AI DETECTION
      ====================================================== */}

      <div
        style={{
          marginTop: "20px",
        }}
      >
        {!detecting ? (
          <button
            onClick={startDetection}
            disabled={!cameraOn}
          >
            🤖 Start AI Detection
          </button>
        ) : (
          <button onClick={stopDetection}>
            ⛔ Stop AI Detection
          </button>
        )}
      </div>

      {/* =====================================================
          GPS
      ====================================================== */}

      <div
        style={{
          marginTop: "20px",
        }}
      >
        <button onClick={startGPS}>
          📍 Start GPS
        </button>

        <button
          onClick={stopGPS}
          style={{
            marginLeft: "10px",
          }}
        >
          ⛔ Stop GPS
        </button>
      </div>

      {/* =====================================================
          GPS DATA
      ====================================================== */}

      {location && (
        <div
          style={{
            marginTop: "20px",
          }}
        >
          <h2>
            📍 Current Location
          </h2>

          <p>
            <strong>
              Latitude:
            </strong>{" "}
            {location.latitude}
          </p>

          <p>
            <strong>
              Longitude:
            </strong>{" "}
            {location.longitude}
          </p>

          <p>
            <strong>
              Accuracy:
            </strong>{" "}
            {location.accuracy} meters
          </p>

          <p>
            <strong>
              Speed:
            </strong>{" "}
            {location.speed ?? "N/A"}
          </p>

          <p>
            <strong>
              Heading:
            </strong>{" "}
            {location.heading ?? "N/A"}
          </p>
        </div>
      )}

      {/* =====================================================
          AI DETECTIONS
      ====================================================== */}

      {detecting && (
        <div
          style={{
            marginTop: "20px",
          }}
        >
          <h2>
            🤖 AI Detection Status
          </h2>

          <p>
            🟢 AI is analyzing camera
            frames...
          </p>
        </div>
      )}

      {detections.length > 0 && (
        <div
          style={{
            marginTop: "20px",
          }}
        >
          <h2>
            🚨 Detected Objects
          </h2>

          {detections.map(
            (detection, index) => (
              <div
                key={index}
                style={{
                  padding: "15px",
                  marginBottom: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                }}
              >
                <p>
                  <strong>
                    Type:
                  </strong>{" "}
                  {detection.class}
                </p>

                <p>
                  <strong>
                    Confidence:
                  </strong>{" "}
                  {(
                    detection.confidence *
                    100
                  ).toFixed(1)}
                  %
                </p>

                <p>
                  <strong>
                    Bounding Box:
                  </strong>{" "}
                  {JSON.stringify(
                    detection.bbox
                  )}
                </p>
              </div>
            )
          )}
        </div>
      )}

      {/* =====================================================
          NO DETECTION
      ====================================================== */}

      {detecting &&
        detections.length === 0 && (
          <div
            style={{
              marginTop: "20px",
            }}
          >
            <p>
              🔍 No pothole/crack/object
              detected yet.
            </p>
          </div>
        )}

      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (
        <p
          style={{
            marginTop: "20px",
          }}
        >
          ❌ {error}
        </p>
      )}
    </div>
  );
}

export default App;