# ESP32 ↔ Smart Garden — Full Integration Guide

Tài liệu này mô tả toàn bộ luồng kết nối từ ESP32 đến website Next.js, HiveMQ Cloud và MongoDB Atlas. Dành cho AI/developer tích hợp firmware hoặc mở rộng hệ thống.

---

## Kiến trúc tổng quan

```
┌─────────────────────────────────────────────────────────────┐
│                        ESP32 Firmware                       │
│  - Đọc cảm biến (TDS, pH, Temp, Humidity, Light, Water)    │
│  - Publish MQTT hoặc HTTP POST sensor data                  │
│  - Subscribe MQTT nhận lệnh điều khiển                      │
│  - Camera: chụp ảnh khi nhận lệnh capture_now              │
└────────────┬──────────────────────────┬─────────────────────┘
             │ MQTT (mqtts:8883)        │ HTTP POST (fallback)
             ▼                          ▼
┌────────────────────┐      ┌──────────────────────────────────┐
│   HiveMQ Cloud     │      │     Next.js API (Vercel/Server)  │
│  (TLS broker)      │─────▶│  lib/mqtt.ts — subscribe all     │
│  Port 8883         │      │  /api/ingest  — HTTP fallback    │
└────────────────────┘      └───────────┬──────────────────────┘
                                        │
                                        ▼
                            ┌───────────────────────┐
                            │    MongoDB Atlas       │
                            │  Database: AIoT        │
                            │  - Device             │
                            │  - SensorReading      │
                            │  - Alert              │
                            │  - CameraCapture      │
                            │  - AIdiagnostic       │
                            │  - User               │
                            └───────────────────────┘
```

---

## 1. Cấu hình kết nối

### MQTT — HiveMQ Cloud

| Tham số | Giá trị |
|---|---|
| Host | `6f570b9010f44b84b5738b9c13cfc891.s1.eu.hivemq.cloud` |
| Port | `8883` (TLS) |
| Protocol | `mqtts` |
| Username | `Admin` |
| Password | `Admin123` |
| QoS | `1` (at least once) |
| Keep-alive | `60s` |

### MQTT Topics

```
garden/{deviceId}/sensors    ESP32 → Server  Sensor data (mỗi 30s)
garden/{deviceId}/commands   Server → ESP32  Lệnh điều khiển
garden/{deviceId}/status     ESP32 → Server  Heartbeat online/offline
garden/{deviceId}/camera     ESP32 → Server  Thông báo đã chụp ảnh xong
```

> `{deviceId}` là ID duy nhất của thiết bị, ví dụ: `sg-001`, `sg-abc123`

---

## 2. ESP32 gửi dữ liệu cảm biến

### Cách 1: MQTT (khuyến nghị)

Publish lên topic `garden/{deviceId}/sensors` mỗi 30 giây.

**Payload JSON:**
```json
{
  "temperature": 24.3,
  "humidity": 68,
  "tds_ppm": 1150,
  "ph": 6.2,
  "light_status": true,
  "water_level": 85
}
```

| Field | Kiểu | Mô tả |
|---|---|---|
| `temperature` | float | Nhiệt độ nước (°C) |
| `humidity` | float | Độ ẩm không khí (%) |
| `tds_ppm` | float | Nồng độ dinh dưỡng (ppm) |
| `ph` | float | Độ pH dung dịch |
| `light_status` | bool | Đèn đang bật/tắt |
| `water_level` | float | Mực nước bồn (%) |

Server tự động:
- Lưu vào `SensorReading` collection
- Cập nhật `Device.isOnline = true`, `Device.lastSeenAt = now`
- So sánh với ngưỡng trong `Device.config.alertThresholds` → tạo `Alert` nếu vượt ngưỡng

### Cách 2: HTTP POST `/api/ingest` (fallback khi mất MQTT)

```
POST https://{domain}/api/ingest
Content-Type: application/json
```

**Body:**
```json
{
  "device_id": "sg-001",
  "token": "ACT-XXXXXX",
  "timestamp": 1711500000,
  "sensor_data": {
    "temperature": 24.3,
    "humidity": 68,
    "tds_ppm": 1150,
    "ph": 6.2,
    "light_status": true,
    "water_level": 85
  }
}
```

| Field | Bắt buộc | Mô tả |
|---|---|---|
| `device_id` | ✅ | ID thiết bị |
| `token` | ❌ | Activation code để xác thực (optional) |
| `timestamp` | ❌ | Unix epoch (giây). Mặc định: thời điểm server nhận |
| `sensor_data` | ✅ | Object chứa các giá trị cảm biến |

**Response thành công (200):**
```json
{
  "ok": true,
  "readingId": "664abc123...",
  "alertsCreated": 1,
  "timestamp": "2024-03-27T06:00:00.000Z"
}
```

**Lỗi phổ biến:**
```json
{ "error": "device_id required" }          // 400 — thiếu device_id
{ "error": "Device not found" }            // 404 — deviceId không tồn tại
{ "error": "Invalid token" }               // 401 — token sai
```

---

## 3. ESP32 nhận lệnh điều khiển

Subscribe MQTT topic: `garden/{deviceId}/commands`

**Payload nhận được:**
```json
{
  "command": "pump_on",
  "sentAt": "2024-03-27T06:00:00.000Z"
}
```

**Danh sách lệnh hợp lệ:**

| Command | Hành động ESP32 |
|---|---|
| `pump_on` | Bật máy bơm |
| `pump_off` | Tắt máy bơm |
| `light_on` | Bật đèn grow light |
| `light_off` | Tắt đèn grow light |
| `capture_now` | Chụp ảnh camera, upload lên `/api/devices/{deviceId}/snapshot` |
| `reboot` | Khởi động lại ESP32 |

---

## 4. ESP32 gửi ảnh (Camera)

Khi nhận lệnh `capture_now`, ESP32 chụp ảnh và upload:

```
POST https://{domain}/api/devices/{deviceId}/snapshot
Content-Type: application/json
```

**Body:**
```json
{
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQ...",
  "capturedAt": "2024-03-27T06:00:00.000Z"
}
```

| Field | Bắt buộc | Mô tả |
|---|---|---|
| `imageBase64` | ✅ | Ảnh encode base64 với data URI prefix |
| `capturedAt` | ❌ | ISO timestamp. Mặc định: thời điểm server nhận |

**Response (200):**
```json
{ "ok": true }
```

Server tự giữ tối đa 10 snapshot gần nhất mỗi thiết bị, xóa cũ tự động.

### Frontend poll snapshot

Sau khi gửi lệnh `capture_now`, frontend poll để lấy ảnh:

```
GET /api/devices/{deviceId}/snapshot?after={ISO_timestamp}
```

**Response có ảnh:**
```json
{
  "image": "data:image/jpeg;base64,...",
  "capturedAt": "2024-03-27T06:00:00.000Z"
}
```

**Response chưa có ảnh:**
```json
{ "image": null }
```

---

## 5. Heartbeat & Offline Detection

### ESP32 gửi heartbeat

Publish lên `garden/{deviceId}/status` mỗi 60 giây:
```json
{ "online": true }
```

### LWT (Last Will Testament) — báo offline tự động khi mất kết nối

Cấu hình trong MQTT connect options của ESP32:
```
Will topic:   garden/{deviceId}/status
Will payload: {"online": false}
Will QoS:     1
Will retain:  true
```

### Server phát hiện offline

`GET /api/devices/{deviceId}/latest` tự tính:
```
isOnline = (now - lastSeenAt) < 5 phút
```

---

## 6. Provisioning — Gắn thiết bị vào tài khoản

### Luồng đầy đủ

```
1. Admin tạo Device trong hệ thống với activationCode (VD: "ACT-XK92M")
2. Device được gắn kèm đơn hàng → user nhận activationCode trong hộp
3. User đăng nhập website → Dashboard → Thêm thiết bị → nhập activationCode
4. POST /api/devices { activationCode, name }
5. Device.userId = user._id  →  thiết bị sẵn sàng
```

### API ghép thiết bị

```
POST /api/devices
Authorization: session cookie (NextAuth)
Content-Type: application/json
```

**Body:**
```json
{
  "activationCode": "ACT-XK92M",
  "name": "Chậu rau mầm phòng khách"
}
```

**Response (200):**
```json
{
  "data": {
    "deviceId": "sg-001",
    "name": "Chậu rau mầm phòng khách",
    "userId": "664abc...",
    "activationCode": "ACT-XK92M",
    "isOnline": false
  }
}
```

**Lỗi phổ biến:**
```json
{ "error": "Unauthorized" }              // 401 — chưa đăng nhập
{ "error": "activationCode is required" } // 400
{ "error": "Invalid activation code" }   // 404 — code sai hoặc đã dùng
```

---

## 7. Toàn bộ API Endpoints

Base URL: `https://{domain}/api`

### Thiết bị

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| `GET` | `/devices` | Session | Danh sách thiết bị của user |
| `POST` | `/devices` | Session | Ghép thiết bị bằng activation code |
| `GET` | `/devices/{deviceId}/latest` | Public | Reading mới nhất + trạng thái online + unread alerts |
| `GET` | `/devices/{deviceId}/readings` | Public | Lịch sử sensor theo thời gian |
| `POST` | `/devices/{deviceId}/command` | Public | Gửi lệnh điều khiển xuống ESP32 |
| `GET` | `/devices/{deviceId}/alerts` | Public | Danh sách cảnh báo |
| `PATCH` | `/devices/{deviceId}/alerts` | Public | Đánh dấu tất cả đã đọc |
| `GET` | `/devices/{deviceId}/snapshot` | Public | Poll ảnh camera mới nhất |
| `POST` | `/devices/{deviceId}/snapshot` | Public | ESP32 upload ảnh |
| `GET` | `/devices/{deviceId}/diagnostics` | Public | Lịch sử chẩn đoán AI |
| `POST` | `/devices/{deviceId}/diagnostics` | Public | Lưu kết quả chẩn đoán AI |
| `GET` | `/devices/{deviceId}/diagnostics/{diagId}` | Public | Chi tiết 1 chẩn đoán |

### Ingest & AI

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| `POST` | `/ingest` | Token (optional) | ESP32 gửi sensor data qua HTTP |
| `POST` | `/ai/predict` | Public | Phân tích ảnh cây bằng PlantAI model |

### Query parameters

**`GET /devices/{deviceId}/readings`**
```
?range=1h|24h|7d|30d    (default: 24h)
?limit=100              (max: 500)
```

**`GET /devices/{deviceId}/alerts`**
```
?limit=20               (max: 100)
?unread=true            (chỉ lấy chưa đọc)
```

**`GET /devices/{deviceId}/snapshot`**
```
?after=2024-03-27T06:00:00Z    (chỉ lấy ảnh sau thời điểm này)
```

**`GET /devices/{deviceId}/diagnostics`**
```
?limit=20
?status=healthy|warning|danger
```

---

## 8. MongoDB Collections

### Device
```js
{
  deviceId:        String,   // unique, VD: "sg-001"
  userId:          ObjectId, // ref User
  name:            String,
  plantType:       String,
  firmwareVersion: String,
  wifiMAC:         String,
  isOnline:        Boolean,
  lastSeenAt:      Date,
  activationCode:  String,   // unique
  config: {
    alertThresholds: {
      tds:  { min: Number, max: Number },  // ppm
      ph:   { min: Number, max: Number },
      temp: { min: Number, max: Number },  // °C
    }
  }
}
```

### SensorReading
```js
{
  deviceId:     String,   // indexed
  timestamp:    Date,     // indexed
  temp:         Number,   // °C
  humi:         Number,   // %
  tds_ppm:      Number,
  ph:           Number,
  light_status: Boolean,
  water_level:  Number,   // %
  raw:          Object,   // full payload gốc từ ESP32
}
```

### Alert
```js
{
  deviceId:    String,
  userId:      ObjectId,
  type:        "tds_low"|"tds_high"|"ph_low"|"ph_high"|
               "temp_low"|"temp_high"|"water_low"|
               "ai_disease"|"device_offline",
  severity:    "info"|"warning"|"danger",
  message:     String,
  value:       Number,    // giá trị thực tế
  threshold:   Number,    // ngưỡng bị vượt
  isRead:      Boolean,
  triggeredAt: Date,
}
```

### Alert Thresholds mặc định

| Cảm biến | Min | Max | Severity |
|---|---|---|---|
| TDS | 800 ppm | 1800 ppm | warning |
| pH | 5.5 | 7.0 | danger |
| Nhiệt độ | 18°C | 30°C | warning |
| Mực nước | — | — | danger nếu < 20% |

### CameraCapture
```js
{
  deviceId:    String,  // indexed
  imageBase64: String,  // data URI
  capturedAt:  Date,    // indexed
}
// Tối đa 10 snapshot / thiết bị, cũ bị xóa tự động
```

### AIdiagnostic
```js
{
  deviceId:      String,
  capturedAt:    Date,
  imageBase64:   String,
  sensorContext: { tds: Number, ph: Number, temp: Number, humidity: Number },
  detections: [{
    class:      String,   // tên bệnh
    confidence: Number,   // 0.0 - 1.0
    bbox:       [x1, y1, x2, y2],
  }],
  status:        "healthy"|"warning"|"danger",
  topDisease:    String|null,
  topConfidence: Number,
  fusedDiagnosis: String,
  recommendation: String,
  aiModel:       String,
  processingMs:  Number,
}
```

---

## 9. PlantAI Service (Docker)

FastAPI chạy YOLOv8 model, port `8000`.

```
POST http://localhost:8000/predict
Content-Type: multipart/form-data
Body: file=<image>
```

**Response:**
```json
{
  "status": "healthy|warning|danger",
  "topDisease": "powdery_mildew",
  "topConfidence": 0.91,
  "detections": [
    { "class": "powdery_mildew", "confidence": 0.91, "bbox": [x1, y1, x2, y2] }
  ],
  "recommendation": "Phun dung dịch baking soda 1%...",
  "aiModel": "YOLOv8-plantAI",
  "processingMs": 120,
  "device": "mps",
  "originalWidth": 640,
  "originalHeight": 480
}
```

Next.js proxy qua `/api/ai/predict` — frontend không gọi port 8000 trực tiếp.

```
Frontend → POST /api/ai/predict (multipart) → Docker :8000 → kết quả JSON
```

---

## 10. Luồng hoàn chỉnh theo từng use case

### A. ESP32 gửi dữ liệu realtime

```
[ESP32] đọc cảm biến mỗi 30s
  → publish MQTT: garden/sg-001/sensors { temp, humi, tds_ppm, ph, ... }
  → [HiveMQ] forward tới Next.js server
  → [lib/mqtt.ts] handleMqttMessage()
  → SensorReading.create()
  → Device.updateOne({ isOnline: true, lastSeenAt: now })
  → Alert.insertMany() nếu vượt ngưỡng
  → [Frontend] polling GET /api/devices/sg-001/latest mỗi 10s → cập nhật UI
```

### B. User điều khiển thiết bị

```
[User] click "Bật bơm" trên Dashboard
  → POST /api/devices/sg-001/command { command: "pump_on" }
  → [Next.js] publishCommand() → MQTT: garden/sg-001/commands
  → [HiveMQ] forward tới ESP32
  → [ESP32] nhận lệnh → bật relay bơm
```

### C. Chụp ảnh + AI phân tích

```
[User] click "Capture" trên AI Lab
  → POST /api/devices/sg-001/command { command: "capture_now" }
  → [ESP32] chụp ảnh camera
  → POST /api/devices/sg-001/snapshot { imageBase64, capturedAt }
  → [Frontend] polling GET /api/devices/sg-001/snapshot?after=... mỗi 1.5s
  → Nhận ảnh → tự động POST /api/ai/predict (multipart)
  → [PlantAI Docker] inference YOLOv8 → kết quả
  → POST /api/devices/sg-001/diagnostics → lưu MongoDB
  → Hiển thị kết quả trên UI
```

### D. Cảnh báo tự động

```
[ESP32] gửi: tds_ppm = 400 (dưới ngưỡng min 800)
  → /api/ingest hoặc MQTT handler
  → Alert.create({ type: "tds_low", severity: "warning", value: 400, threshold: 800 })
  → [Dashboard Alerts tab] GET /api/devices/sg-001/alerts → hiển thị badge đỏ
```

---

## 11. Checklist tích hợp ESP32 Firmware

- [ ] Flash `deviceId` vào NVS (non-volatile storage) lúc sản xuất
- [ ] Kết nối WiFi → kết nối MQTT HiveMQ với credentials trên
- [ ] Cấu hình LWT: topic `garden/{deviceId}/status`, payload `{"online":false}`
- [ ] Publish heartbeat `{"online":true}` lên `garden/{deviceId}/status` mỗi 60s
- [ ] Publish sensor data mỗi 30s lên `garden/{deviceId}/sensors`
- [ ] Subscribe `garden/{deviceId}/commands` → xử lý từng lệnh
- [ ] Fallback HTTP POST `/api/ingest` khi mất MQTT > 60s
- [ ] Khi nhận `capture_now`: chụp ảnh → POST `/api/devices/{deviceId}/snapshot`
