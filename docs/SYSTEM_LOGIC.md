# System Logic — Smart Garden AIoT

Tài liệu mô tả luồng hoạt động end-to-end của toàn bộ hệ thống.

---

## Kiến trúc tổng quan

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ESP32 (Hardware Layer)                                                  │
│  Sensors : TDS · pH · Temp · Humidity · Water Level                     │
│  Actuators: Pump · LED Grow Light · ESP32-CAM                          │
└────────────┬──────────────────────────────┬────────────────────────────┘
             │ MQTT mqtts://:8883 (TLS)     │ HTTP POST /api/ingest
             ▼                              │ (fallback khi mất MQTT)
┌────────────────────────┐                 │
│  HiveMQ Cloud          │                 │
│  MQTT Broker           │                 │
└──────────┬─────────────┘                 │
           │ garden/#                      │
           ▼                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  Next.js Server (Vercel)                                                 │
│  ├── lib/mqtt.ts          MQTT subscriber singleton                     │
│  ├── app/api/             REST API routes                               │
│  ├── app/dashboard/       Dashboard UI (realtime)                       │
│  └── app/(marketing)/     Marketing + E-commerce                        │
└────────────────────────┬────────────────────────────────────────────────┘
                         │
          ┌──────────────┼──────────────────────┐
          ▼              ▼                      ▼
    MongoDB Atlas     Cloudinary          Python FastAPI
    (9 collections)   (image storage)     plant_ai_service/
                                          plantAI.pt · YOLOv8
```

---

## 1. Luồng dữ liệu sensor (Realtime)

ESP32 đọc tất cả sensors mỗi 30 giây và gửi lên cloud qua 2 kênh:

```
ESP32 đọc sensors
    │
    ├── Có WiFi + MQTT connected?
    │     ▼ YES
    │   MQTT Publish
    │   Topic : garden/{deviceId}/sensors
    │   Payload: {
    │     temp, humi, tds_ppm, ph,
    │     light_status, water_level,
    │     timestamp
    │   }
    │     │
    │     ▼
    │   lib/mqtt.ts → handleMqttMessage()
    │     ├── Insert SensorReading vào MongoDB
    │     ├── Update Device.lastSeenAt, isOnline = true
    │     └── checkThresholds() → tạo Alert nếu vượt ngưỡng
    │
    └── Mất MQTT / offline?
          ▼ NO (fallback)
        HTTP POST /api/ingest
        Body: { device_id, token, timestamp, sensor_data }
          ├── Validate token = Device.activationCode
          ├── Insert SensorReading
          ├── Update Device online status
          └── checkThresholds() → tạo Alert
```

### Ngưỡng cảnh báo mặc định

| Sensor | Điều kiện | Alert type | Severity |
|---|---|---|---|
| TDS | < 800 ppm | `tds_low` | warning |
| TDS | > 1800 ppm | `tds_high` | warning |
| pH | < 5.5 | `ph_low` | danger |
| pH | > 7.0 | `ph_high` | danger |
| Temp | < 18 °C | `temp_low` | warning |
| Temp | > 30 °C | `temp_high` | warning |
| Water | < 20 % | `water_low` | danger |

Ngưỡng này có thể tùy chỉnh theo từng thiết bị qua `Device.config.alertThresholds`.

---

## 2. Luồng điều khiển thiết bị (Commands)

```
User nhấn nút trên Dashboard
    │
    ▼
POST /api/devices/{deviceId}/command
    ├── authorizeDevice()
    │     Kiểm tra Device.userId === session.user.id
    │
    ├── Lưu Command vào MongoDB
    │     { command, status: "sent", sentAt }
    │
    └── publishCommand() → MQTT Publish
          Topic  : garden/{deviceId}/commands
          Payload: { command, payload, timestamp }
                │
                ▼
            ESP32 nhận lệnh → thực thi
                │
                └── ACK qua MQTT
                      Topic: garden/{deviceId}/status
                      → backend update Command.status = "acknowledged"
```

### Danh sách lệnh hỗ trợ

| Command | Hành động trên ESP32 |
|---|---|
| `light_on` | Bật relay đèn grow light |
| `light_off` | Tắt relay đèn grow light |
| `pump_on` | Bật relay máy bơm |
| `pump_off` | Tắt relay máy bơm |
| `capture_now` | Trigger ESP32-CAM chụp ảnh ngay |
| `reboot` | Restart ESP32 |
| `update_config` | Đẩy config mới xuống thiết bị |

---

## 3. Luồng AI phân tích cây (YOLOv8)

Có 2 nguồn trigger: **user chủ động** và **tự động theo lịch**.

### 3A. User chủ động (AI Lab dashboard)

```
User upload ảnh hoặc nhấn "Capture"
    │
    ├── Nhấn "Capture"
    │     ▼
    │   POST /api/devices/{id}/command { command: "capture_now" }
    │     → ESP32-CAM chụp ảnh
    │     → POST /api/devices/{id}/snapshot (từ ESP32)
    │         ├── Upload ảnh lên Cloudinary
    │         ├── Insert CameraCapture { imageUrl, triggeredBy: "manual" }
    │         └── Giữ tối đa 10 snapshot/thiết bị (xóa cũ hơn)
    │     → Frontend poll GET /api/devices/{id}/snapshot?after={startedAt}
    │     → Nhận imageUrl khi có ảnh mới
    │
    └── Có ảnh (upload hoặc capture)
          ▼
        POST /api/ai/predict  (multipart/form-data)
          │
          ▼
        Python FastAPI :8000/predict
          ├── Load plantAI.pt (YOLOv8)
          ├── Inference: conf=0.50, iou=0.45
          ├── classify_health():
          │     if tất cả detections thuộc HEALTHY_CLASSES → "healthy"
          │     elif bất kỳ confidence > 0.7              → "danger"
          │     else                                      → "warning"
          └── Trả về: {status, topDisease, topConfidence,
                       detections[], recommendation, processingMs}
          │
          ▼
        lib/fuseDiagnosis.ts
          ├── Kết hợp topDisease + sensorContext (TDS, pH, temp, humidity)
          ├── Bổ sung nhận xét sensor vào diagnosis
          └── Tạo recommendation cụ thể theo bệnh + trạng thái sensor
          │
          ▼
        Insert AIdiagnostic vào MongoDB
          { imageUrl, sensorContext, detections,
            status, fusedDiagnosis, recommendation }
```

### 3B. Tự động theo lịch (ESP32 schedule)

```
ESP32 chụp theo config.cameraInterval (default: 6 giờ)
    → POST /api/devices/{id}/snapshot
        triggeredBy: "schedule"
    → Tự động chạy AI predict
    → Nếu status = "warning" hoặc "danger"
        → Insert Alert { type: "ai_disease", severity }
        → Firebase FCM push notification (Phase 3B)
```

### Fusion diagnosis — logic kết hợp

```
topDisease = "yellow_leaf"?
    + TDS < 800 ppm  → "Nitrogen deficiency confirmed. Increase A+B solution."
    + pH out of range → "pH imbalance blocking nutrient uptake."

topDisease = "powdery_mildew"?
    + humidity > 80% → "High humidity accelerating fungal spread."

topDisease = "nutrient_deficiency"?
    + TDS < 600 ppm  → "Critical: TDS too low. Immediate nutrient top-up needed."

Fallback: "Plant status: {status}. Sensor readings: TDS={tds}, pH={ph}..."
```

---

## 4. Plant Doctor AI (Chatbot)

```
User nhập câu hỏi trên /dashboard/{deviceId}/plant-doctor
    │
    ▼
Frontend build system prompt:
    "You are Plant Doctor AI — a hydroponic expert.
     Respond in English, concisely and practically.
     Current sensor data: TDS:1150ppm, pH:6.2, Temp:24.3°C, Humidity:68%, Light:ON"
    │
    ├── Provider = Groq (default)?
    │     → POST /api/ai/chat (proxy, ẩn server-side API key)
    │     → Groq API → llama-3.3-70b-versatile
    │
    ├── Provider = OpenRouter?
    │     → POST /api/ai/chat + user's apiKey trong request
    │     → OpenRouter → model tùy chọn (free tier available)
    │
    └── Provider = Local (Ollama)?
          → Fetch thẳng localhost:11434/v1/chat/completions
          → Không qua proxy (localhost không có CORS issue)
          → Model: qwen2.5:3b (hoặc user tự nhập)
```

API key của Groq được lưu server-side trong `.env`. API key OpenRouter do user nhập, lưu trong `localStorage` của trình duyệt.

---

## 5. Heartbeat & Offline Detection

```
Khi ESP32 kết nối MQTT, đăng ký LWT (Last Will & Testament):
    Topic  : garden/{deviceId}/status
    Payload: { online: false }
    → Broker tự publish nếu ESP32 mất kết nối đột ngột

Mỗi 60 giây, ESP32 publish:
    garden/{deviceId}/status → { online: true, rssi, freeHeap }
    → backend: Device.lastSeenAt = now

API tính isOnline:
    isOnline = (Device.lastSeenAt > now - 5 phút)

Nếu isOnline = false:
    → Insert Alert { type: "device_offline", severity: "danger" }
    → Firebase FCM push (Phase 3B)
```

---

## 6. Luồng E-commerce & Kích hoạt thiết bị

```
User duyệt sản phẩm → /products
    │
    ▼
Thêm vào giỏ → Checkout
    → Insert Order {
        userId, items[], totalAmount,
        deviceActivationCode  ← mã in trong hộp sản phẩm
      }
    │
    ▼
User nhận hàng vật lý
    │
    ▼
Dashboard → nhập activationCode
    → POST /api/devices/activate
    → Tìm Device.activationCode = input
    → Set Device.userId = session.user.id
    → Device sẵn sàng nhận MQTT data từ ESP32
```

---

## 7. Luồng xác thực (Authentication)

```
Người dùng thông thường:
    /auth/register
    → Redirect tự động đến Google OAuth (NextAuth signIn)
    → Google trả về profile { name, email, image }
    → Upsert User { provider: "google", role: "customer" }
    → Redirect /dashboard

Admin:
    /auth/login
    → NextAuth Credentials provider
    → Kiểm tra email + bcrypt.compare(password, hash)
    → role: "admin" → access /admin panel
    → role: "customer" → redirect /dashboard
```

---

## 8. Trạng thái triển khai hiện tại

| Phase | Nội dung | Trạng thái |
|---|---|---|
| 0 | Infra: Next.js, MongoDB Atlas, HiveMQ, Cloudinary | ✅ Done |
| 1 | Auth, UI marketing, e-commerce, dashboard shell | ✅ Done |
| 2A | AI Lab: YOLOv8 predict, Plant Doctor chatbot | ✅ Done |
| 2B | MongoDB schemas, toàn bộ API routes | 🔄 In Progress |
| 2C | MQTT realtime `lib/mqtt.ts` | ⏳ Chờ hardware |
| 2D | WebSocket dashboard realtime | ⏳ Not started |
| 3A | Controls & automation (relay, schedule) | ⏳ Not started |
| 3B | Firebase FCM push notifications | ⏳ Not started |
| 5 | Admin panel | 🔄 In Progress |
| 6 | ESP32 firmware | ⏳ Chờ hardware |
| 7 | Production hardening & monitoring | ⏳ Not started |

> **Nút thắt cổ chai:** Phases 2C, 2D, 3A, 3B, 6 phụ thuộc vào phần cứng ESP32.
> Toàn bộ cloud infra đã sẵn sàng — cắm board vào là hoạt động.

---

## 9. Sơ đồ dữ liệu qua các collections

```
User mua hàng          → orders
User kích hoạt thiết bị → devices (gán userId)
ESP32 gửi sensor        → sensorreadings (time-series)
Sensor vượt ngưỡng      → alerts
User/Schedule chụp ảnh  → cameracaptures → aidiagnostics
User gửi lệnh điều khiển → commands → (MQTT → ESP32)
```
