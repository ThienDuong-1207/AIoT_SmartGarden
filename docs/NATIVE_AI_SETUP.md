# Native AI Setup — Mac M1/M2

Cả hai AI service đều chạy **native trên chip Apple Silicon**, tận dụng Metal GPU thay vì Docker.

| Service | Port | Vai trò |
|---|---|---|
| **PlantAI** | `8000` | Nhận diện bệnh cây (YOLOv8) |
| **Ollama** | `11434` | Chatbot tư vấn thủy canh (LLM) |

---

## 1. PlantAI (YOLOv8)

### Cài đặt (chỉ làm 1 lần)

```bash
# Cài PyTorch với MPS support cho M1
pip install torch torchvision

# Cài các dependencies còn lại
pip install fastapi uvicorn ultralytics pillow opencv-python-headless python-multipart
```

### Khởi động

```bash
# Từ thư mục gốc dự án
cd ~/Documents/GitHub/AIoT_SmartGarden

# Chạy foreground (thấy log trực tiếp)
uvicorn plant_ai_service.main:app --host 0.0.0.0 --port 8000

# Hoặc chạy nền
nohup uvicorn plant_ai_service.main:app --host 0.0.0.0 --port 8000 > /tmp/plantai.log 2>&1 &
```

### Kiểm tra

```bash
# Health check
curl http://localhost:8000/health

# Xem log nếu chạy nền
tail -f /tmp/plantai.log

# Tắt nếu chạy nền
pkill -f "uvicorn plant_ai_service"
```

### Kết quả health check thành công

```json
{
  "status": "ok",
  "device": "mps",
  "model": "plantAI.pt",
  "classes": { "0": "healthy", "1": "powdery_mildew", ... }
}
```

> `"device": "mps"` xác nhận đang dùng Metal GPU của M1.

---

## 2. Ollama (LLM Chatbot)

### Cài đặt (chỉ làm 1 lần)

```bash
brew install ollama

# Pull model (chọn 1)
ollama pull qwen2.5:3b    # ~2GB — nhanh, tiếng Việt tốt (khuyến nghị)
ollama pull qwen2.5:7b    # ~4GB — chất lượng cao hơn
ollama pull mistral:7b    # ~4GB — tổng quát tốt
```

### Khởi động

```bash
# Chạy foreground
ollama serve

# Hoặc tự động start khi bật máy
brew services start ollama
```

### Kiểm tra

```bash
# Xem server đang chạy
curl http://localhost:11434/api/tags

# Xem model đang load + GPU usage
curl http://localhost:11434/api/ps

# Test chat nhanh
ollama run qwen2.5:3b "xin chào"

# Tắt nếu dùng brew services
brew services stop ollama
```

---

## Khởi động cả 2 service

Tạo terminal mới cho mỗi service, hoặc dùng script sau:

```bash
# start-ai.sh — chạy từ thư mục gốc dự án
#!/bin/bash

echo "Starting PlantAI on :8000..."
nohup uvicorn plant_ai_service.main:app --host 0.0.0.0 --port 8000 \
  > /tmp/plantai.log 2>&1 &
echo "PlantAI PID: $!"

echo "Starting Ollama on :11434..."
ollama serve > /tmp/ollama.log 2>&1 &
echo "Ollama PID: $!"

echo ""
echo "Logs:"
echo "  tail -f /tmp/plantai.log"
echo "  tail -f /tmp/ollama.log"
```

```bash
chmod +x start-ai.sh
./start-ai.sh
```

---

## Tắt tất cả

```bash
pkill -f "uvicorn plant_ai_service"   # tắt PlantAI
pkill ollama                           # tắt Ollama
```

---

## Lưu ý

- **plantAI.pt** phải nằm ở thư mục gốc dự án (không đổi vị trí)
- Mỗi lần tắt máy cần start lại (trừ Ollama nếu dùng `brew services start`)
- Next.js gọi `http://localhost:8000` và `http://localhost:11434` — không cần đổi config

---

## 3. Firebase (Push Notifications — Phase 3B)

> Firebase dùng cho FCM push notifications, không chạy local. Xem chi tiết triển khai tại [PROJECT_PHASES.md](./PROJECT_PHASES.md#phase-3b).

### Cài đặt

```bash
npm install firebase
```

### Cấu hình Firebase JS SDK

```javascript
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBuKgfehg6LHDhIooJQD0SS3BOBMfHGg7I",
  authDomain: "aiot-smart-garden-c2373.firebaseapp.com",
  projectId: "aiot-smart-garden-c2373",
  storageBucket: "aiot-smart-garden-c2373.firebasestorage.app",
  messagingSenderId: "1009608031859",
  appId: "1:1009608031859:web:a9ed3c75dfc0d5edd03406",
  measurementId: "G-XREVDNTT7V"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
```

> File này dùng cho **client-side** (`lib/firebase-client.ts`). Backend dùng Firebase Admin SDK với `FIREBASE_PRIVATE_KEY` từ `.env.local`.
