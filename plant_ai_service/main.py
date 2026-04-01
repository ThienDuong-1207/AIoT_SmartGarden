"""
PlantAI FastAPI Service - chạy YOLOv8 plantAI.pt trên Mac M1
Port: 8000
"""
import io
import os
import time
from pathlib import Path

import torch
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from ultralytics import YOLO

# ── Config ──────────────────────────────────────────────────────────────────
MODEL_PATH = Path(os.getenv("MODEL_PATH", str(Path(__file__).parent.parent / "plantAI.pt")))
DEVICE = "mps" if torch.backends.mps.is_available() else "cpu"

# ── Load model (một lần duy nhất khi khởi động) ─────────────────────────────
print(f"[PlantAI] Loading model from {MODEL_PATH}")
print(f"[PlantAI] Using device: {DEVICE}")
model = YOLO(str(MODEL_PATH))
model.to(DEVICE)
print(f"[PlantAI] Model ready. Classes: {model.names}")

# ── FastAPI app ──────────────────────────────────────────────────────────────
app = FastAPI(title="PlantAI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


def classify_health(detections: list) -> str:
    """
    Phân loại dựa trên logic đảo ngược:
    - Chỉ định nghĩa class KHỎE MẠNH → còn lại đều là bệnh
    - Confidence >= 0.7 → danger, < 0.7 → warning
    """
    if not detections:
        return "healthy"

    # Chỉ các class này mới là khỏe mạnh
    HEALTHY_CLASSES = {"healthy", "healthy_leaf", "normal", "no_disease"}

    top = detections[0]
    name = top["class"].lower().replace(" ", "_")
    conf = top["confidence"]

    if name in HEALTHY_CLASSES:
        return "healthy"

    # Bất kỳ class nào khác đều là bệnh
    return "danger" if conf >= 0.70 else "warning"


def get_recommendation(top_class: str | None, status: str) -> str:
    """Rule-based recommendation theo tên class từ model."""
    recs = {
        "healthy":              "Plant is healthy. Maintain current watering and nutrient schedule.",
        "healthy_leaf":         "Plant is healthy. Maintain current watering and nutrient schedule.",
        "powdery_mildew":       "Powdery mildew detected. Reduce humidity, improve airflow, apply 1% baking soda solution or sulfur fungicide, and remove infected leaves.",
        "aphid":                "Apply 0.5% neem oil solution and inspect the underside of leaves daily.",
        "yellow_leaf":          "Check pH (target 6.0-6.5) and TDS. Possible iron (Fe) or nitrogen (N) deficiency.",
        "brown_spot":           "Reduce humidity and improve ventilation. Check for Cercospora fungal infection.",
        "nutrient_deficiency":  "Increase A+B nutrient solution and adjust TDS to 1000-1400 ppm.",
        "spider_mite":          "Increase ambient humidity and apply an organic miticide (e.g., neem oil).",
        "whitefly":             "Use yellow sticky traps and apply insecticidal soap.",
        "blight":               "Remove infected leaves immediately and apply a copper-based fungicide.",
        "rot":                  "Inspect irrigation settings, reduce root-zone moisture, and trim rotten tissue.",
        "wilting":              "Check water level, nutrient EC, and water temperature (optimal 18-22C).",
    }
    if top_class:
        key = top_class.lower().replace(" ", "_")
        if key in recs:
            return recs[key]
        # Fallback: class không có trong dict nhưng là bệnh
        return f"Detected: {top_class}. Monitor the plant for 24 hours, retake an image to confirm progression, and consult an expert if symptoms worsen."
    return "Plant is healthy. Continue maintaining current environmental conditions."


@app.get("/health")
def health():
    return {
        "status": "ok",
        "device": DEVICE,
        "model": str(MODEL_PATH.name),
        "classes": model.names,
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    # Validate file type (allow common image MIME types and fallback to content sniffing)
    allowed_mimes = {
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/bmp",
        "image/tiff",
        "application/octet-stream",  # some clients upload with generic content-type
    }
    if file.content_type and file.content_type not in allowed_mimes and not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Unsupported image format. Use JPG, PNG, WEBP, BMP, or TIFF")

    # Đọc ảnh + validate nội dung thực tế
    contents = await file.read()
    try:
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file. Use JPG, PNG, WEBP, BMP, or TIFF")

    # Inference
    # conf=0.50 → chỉ giữ box có confidence >= 50%, giảm false positive
    # iou=0.45  → NMS threshold, loại box trùng lặp
    start = time.perf_counter()
    results = model(image, device=DEVICE, verbose=False, conf=0.50, iou=0.45)
    elapsed_ms = int((time.perf_counter() - start) * 1000)

    # Parse detections (sorted by confidence desc)
    detections = []
    for box in results[0].boxes:
        detections.append({
            "class": model.names[int(box.cls)],
            "confidence": round(float(box.conf), 4),
            "bbox": [round(v, 1) for v in box.xyxy[0].tolist()],
        })
    detections.sort(key=lambda x: x["confidence"], reverse=True)

    top_class = detections[0]["class"] if detections else None
    top_confidence = detections[0]["confidence"] if detections else 1.0
    status = classify_health(detections)
    recommendation = get_recommendation(top_class, status)

    return {
        "status": status,                     # "healthy" | "warning" | "danger"
        "topDisease": top_class,              # tên bệnh chính
        "topConfidence": top_confidence,      # 0.0 - 1.0
        "detections": detections,             # tất cả detections với bbox
        "recommendation": recommendation,    # gợi ý xử lý
        "aiModel": "YOLOv8-plantAI",
        "processingMs": elapsed_ms,
        "device": DEVICE,
        "originalWidth": image.width,         # kích thước ảnh gốc để scale bbox
        "originalHeight": image.height,
    }
