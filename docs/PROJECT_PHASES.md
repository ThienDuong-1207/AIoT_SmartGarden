# AIoT SmartGarden — Project Phases & Roadmap

> Cập nhật: 2026-03-26 · Stack: Next.js 16 · MongoDB Atlas · HiveMQ Cloud · Python FastAPI · YOLOv8

---

## Trạng thái tổng quan

| Phase | Tên | Trạng thái |
|-------|-----|------------|
| 0 | Setup & Infrastructure | ✅ Hoàn thành |
| 1 | MVP — UI & Auth & E-commerce | ✅ Hoàn thành |
| 2A | AI Lab — YOLOv8 + Upload Test | ✅ Hoàn thành |
| 2B | Data Layer — MongoDB Schemas & APIs | ✅ Hoàn thành |
| 2C | IoT — MQTT + Sensor Ingest | ✅ Hoàn thành |
| 3A | Controls — Actuator Commands | ✅ Hoàn thành |
| 4 | UI/UX — Theme System (Light/Dark) | ✅ Hoàn thành |
| 2D | Realtime — WebSocket/SSE Dashboard | ⬜ Chưa bắt đầu |
| 3B | Notifications — FCM Push Alerts | ⬜ Chưa bắt đầu |
| 5 | Admin Panel — Hoàn thiện | 🔄 Đang làm |
| 6 | ESP32 Firmware | ⬜ Chờ phần cứng |
| 7 | Production Deploy | ⬜ Chưa bắt đầu |

---

## Phase 0 — Setup & Infrastructure ✅

### Đã hoàn thành
- [x] Next.js 16 + TypeScript + Tailwind CSS 4
- [x] MongoDB Atlas cluster (M0 Free) — database: `AIoT`
- [x] HiveMQ Cloud broker — `6f570b9010f44b84b5738b9c13cfc891.s1.eu.hivemq.cloud:8883`
- [x] Google OAuth credentials (Google Cloud Console)
- [x] Cloudinary account — cloud: `ddxgfsbhh`, preset: `AIoT_smartGarden`
- [x] Firebase project — `aiot-smart-garden-c2373`
- [x] `.env.local` với tất cả biến môi trường
- [x] Vercel project linked

### Biến môi trường cần thiết
```env
NEXTAUTH_URL, NEXTAUTH_SECRET
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
MONGODB_URI, MONGODB_DB_NAME=AIoT
CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
MQTT_HOST, MQTT_PORT, MQTT_USERNAME, MQTT_PASSWORD
GEMINI_API_KEY
PLANT_AI_SERVICE_URL=http://localhost:8000
```

---

## Phase 1 — MVP: UI, Auth, E-commerce ✅

### Auth
- [x] NextAuth.js — Google OAuth + Admin credentials
- [x] Middleware bảo vệ `/dashboard` và `/admin`
- [x] Trang login/register
- [x] Role-based redirect (customer → dashboard, admin → admin)

### E-commerce
- [x] Landing page với GSAP scroll animations
- [x] Trang `/products` — grid + filter + sort
- [x] Trang `/products/[slug]` — chi tiết sản phẩm
- [x] Cart (CartProvider + CartDrawer)
- [x] Checkout flow cơ bản
- [ ] ⬜ Tích hợp thanh toán VNPay/Stripe
- [ ] ⬜ Email xác nhận đơn hàng (Resend)

### Dashboard cơ bản
- [x] Device grid `/dashboard`
- [x] Device detail layout với tabs
- [x] Overview tab (mock data)
- [x] Sensors/Controls tab (mock data)
- [x] AI Lab tab
- [x] Plant Doctor tab (Gemini API)
- [x] Settings tab

### Database Models
- [x] `User` — name, email, role, status
- [x] `Device` — deviceId, config, alertThresholds
- [x] `Product` — slug, category, price, specs
- [x] `Order` — items, status, payment

### API Routes hoàn thành
- [x] `GET/POST /api/devices`
- [x] `GET /api/products`, `GET /api/products/[slug]`
- [x] `POST /api/auth/[...nextauth]`
- [x] Admin CRUD: users, products, orders

---

## Phase 2A — AI Lab: YOLOv8 Integration ✅

### Python FastAPI Service
- [x] `plant_ai_service/main.py` — FastAPI + YOLOv8
- [x] `POST /predict` — inference với `plantAI.pt`
- [x] Confidence threshold: `conf=0.50, iou=0.45`
- [x] `classify_health()` — whitelist healthy classes
- [x] `get_recommendation()` — rule-based theo class
- [x] Trả về `originalWidth/Height` để scale bbox
- [x] `Dockerfile` + `requirements.txt`
- [x] `docker-compose.yml`

### Next.js AI Integration
- [x] `POST /api/ai/predict` — proxy + fuseDiagnosis
- [x] `lib/fuseDiagnosis.ts` — kết hợp AI + sensor context
- [x] `AITestUpload.tsx` — upload + bbox canvas overlay
- [x] Canvas bounding box với letterbox correction
- [x] `models/AIdiagnostic.ts` — MongoDB schema

### AI Lab UI
- [x] Upload zone drag-and-drop
- [x] Bounding box visualization trên canvas
- [x] Detection list với confidence bars
- [x] Card grid với ảnh full-background
- [x] Click card → Detail modal
- [x] Filter: Tất cả / Healthy / Cảnh báo / Nguy hiểm
- [x] Lưu kết quả vào MongoDB collection `sample`

### API Routes
- [x] `GET/POST /api/devices/[deviceId]/diagnostics`
- [x] `GET /api/devices/[deviceId]/diagnostics/[diagId]`
- [x] `GET /api/test-db` — kiểm tra MongoDB collections

---

## Phase 2B — Data Layer: Schemas & Ingest APIs 🔄

### Models cần tạo
- [ ] 🔄 `models/SensorReading.ts`
  ```ts
  { deviceId, timestamp, temp, humi, tds_ppm, ph, light_status, water_level }
  // MongoDB Time Series Collection
  // Indexes: deviceId + timestamp
  ```
- [ ] `models/Alert.ts`
  ```ts
  { deviceId, userId, type, severity, message, isRead, triggeredAt }
  ```

### API Routes cần tạo
- [ ] `POST /api/ingest` — **điểm nhận data chính từ ESP32**
  ```ts
  // Nhận: { metadata, sensor_data, ai_vision, timestamp }
  // Xử lý:
  //   1. Validate device token
  //   2. Lưu SensorReading
  //   3. Cập nhật Device.isOnline + lastSeenAt
  //   4. Nếu ai_vision.last_image_url → trigger AI phân tích
  //   5. Kiểm tra alertThresholds → tạo Alert nếu vượt ngưỡng
  ```
- [ ] `GET /api/devices/[deviceId]/readings?range=24h|7d|30d`
  - Trả sensor history cho chart
- [ ] `GET /api/devices/[deviceId]/latest`
  - Trả reading mới nhất cho Overview page
- [ ] `POST /api/devices/[deviceId]/command`
  - Gửi lệnh MQTT tới ESP32

### Overview Page cập nhật
- [ ] Fetch từ `/api/devices/[deviceId]/latest` thay mock
- [ ] Chart 24h từ `/api/devices/[deviceId]/readings`
- [ ] Activity strip: timestamp thật từ DB
- [ ] SmartAlerts: fetch từ MongoDB Alert collection

---

## Phase 2C — IoT: MQTT Real-time Connection ⬜

### Backend MQTT
- [ ] `lib/mqtt.ts` — MQTT client singleton
  ```ts
  // Connect: mqtts://broker.hivemq.cloud:8883
  // Subscribe: garden/# (tất cả devices)
  // On message: route tới handler theo topic pattern
  ```
- [ ] MQTT handler `garden/{deviceId}/sensors`
  - Parse JSON → gọi POST /api/ingest logic
- [ ] MQTT handler `garden/{deviceId}/camera`
  - Nhận thông báo ảnh đã chụp → trigger AI analysis
- [ ] MQTT publisher `garden/{deviceId}/commands`
  - Gửi: `pump_on`, `pump_off`, `light_on`, `light_off`, `capture_now`

### Device Command API
- [ ] `POST /api/devices/[deviceId]/command`
  ```ts
  // body: { command: "pump_on" | "light_off" | "capture_now" }
  // → MQTT publish tới garden/{deviceId}/commands
  // → Trả { success, sentAt }
  ```

### Sensors Tab cập nhật
- [ ] Toggle bơm nước → gọi `/api/devices/[deviceId]/command`
- [ ] Toggle đèn → gọi command API
- [ ] Nút "Capture Now" → `capture_now` command
- [ ] Lưu alert threshold → PATCH Device config

### MQTT Topics Map
```
garden/{deviceId}/sensors    ESP32 → Web  (sensor readings 30s/lần)
garden/{deviceId}/camera     ESP32 → Web  (ảnh chụp xong, URL)
garden/{deviceId}/commands   Web → ESP32  (điều khiển)
garden/{deviceId}/status     ESP32 → Web  (online/offline heartbeat)
```

---

## Phase 2D — Realtime: WebSocket Dashboard ⬜

### WebSocket Server
- [ ] Next.js Route Handler `GET /api/ws/[deviceId]`
  - Dùng `EventSource` (SSE) hoặc `WebSocket`
  - Gửi sensor updates tới Dashboard client
- [ ] Hoặc dùng thư viện `pusher-js` / `socket.io`

### Dashboard Realtime
- [ ] Overview page subscribe SSE
  - Metric cards cập nhật live khi nhận data mới
  - Activity strip: "Cập nhật X giây trước" đếm thật
  - Camera feed: hiển thị timestamp ảnh mới nhất
- [ ] Alert badge trên sidebar cập nhật live

---

## Phase 3A — Controls & Automation ⬜

### Actuator Controls (Sensors Tab)
- [ ] Toggle bơm nước (pump on/off) → MQTT
- [ ] Toggle đèn grow light (light on/off) → MQTT
- [ ] Hẹn giờ tưới → lưu Device.config → ESP32 đọc
- [ ] Lịch chụp ảnh tự động (1h/6h/12h/24h) → cameraInterval

### Alert Engine
- [ ] Rule engine khi nhận sensor data:
  ```
  TDS < threshold.min → Alert "TDS thấp"
  pH > threshold.max  → Alert "pH cao"
  Temp > 32°C        → Alert "Nhiệt độ cao"
  ```
- [ ] Smart Alerts page `/dashboard/alerts`
  - Fetch từ MongoDB Alert collection
  - Mark as read
  - Filter by severity

---

## Phase 3B — Push Notifications: Firebase FCM ⬜

### Backend
- [ ] `lib/firebase-admin.ts` — Firebase Admin SDK init
- [ ] Lưu FCM token vào `User.fcmToken` (từ client)
- [ ] `lib/sendNotification.ts`:
  ```ts
  sendPushNotification(userId, { title, body, data })
  ```
- [ ] Trigger trong `/api/ingest` khi vượt ngưỡng

### Frontend
- [ ] `lib/firebase-client.ts` — Firebase JS SDK
- [ ] Service Worker `public/firebase-messaging-sw.js`
- [ ] Permission request khi user login lần đầu
- [ ] Save FCM token → `PATCH /api/users/fcm-token`
- [ ] Toggle thông báo trong Settings tab

---

## Phase 4 — UI/UX: Theme System ⬜

### Vấn đề hiện tại
- Dark mode quá đậm (`#000000`) — khó đọc trên màn hình nhỏ
- Không có light mode
- `border-breathe` animation gây nhiễu mắt
- CSS variables hardcode không đổi được runtime
- Không có theme toggle

### Đề xuất cải tiến (tham khảo Vercel, Linear, Notion)

#### Light Mode Variables
```css
[data-theme="light"] {
  --bg-base:        #F8FAFC;    /* slate-50 */
  --bg-elevated:    #FFFFFF;    /* white */
  --bg-overlay:     #F1F5F9;    /* slate-100 */
  --bg-subtle:      #E2E8F0;    /* slate-200 */

  --border-subtle:  rgba(15, 23, 42, 0.07);
  --border-normal:  rgba(15, 23, 42, 0.12);

  --text-primary:   #0F172A;    /* slate-900 */
  --text-secondary: #475569;    /* slate-600 */
  --text-muted:     #94A3B8;    /* slate-400 */

  --shadow-card:    0 1px 3px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04);
}
```

#### Implementation Steps
- [ ] `components/ThemeProvider.tsx` — Context + localStorage
- [ ] `components/ThemeToggle.tsx` — Sun/Moon button
- [ ] Thêm `data-theme` attribute vào `<html>`
- [ ] Cập nhật `globals.css` — light mode variables
- [ ] Thêm ThemeToggle vào `AppHeaderClient.tsx`
- [ ] Giảm animation `border-breathe` → chỉ dùng ở hero
- [ ] Tăng contrast text: `--bg-elevated` dark từ #030303 → #0A0A0A

#### Design Improvements
- [ ] Sidebar: thêm labels cho nav items (hiện tại chỉ có icons nhỏ)
- [ ] Dashboard cards: bỏ hover translateY, dùng border highlight
- [ ] Typography: tăng line-height overview metrics
- [ ] Mobile responsive: sidebar collapse thành bottom nav
- [ ] Loading states: skeleton screens thay spinner

---

## Phase 5 — Admin Panel: Hoàn thiện 🔄

### Đã có
- [x] User list + ban/unban + role change
- [x] Product CRUD
- [x] Order list + status update
- [x] System diagnostics log

### Còn thiếu
- [ ] Dashboard stats thật từ MongoDB (hiện mock)
  - Tổng user, device online, doanh thu tháng
- [ ] Activate device → gán deviceId cho user sau khi mua
- [ ] Export CSV cho AI diagnostics log
- [ ] Bulk actions: ban nhiều user, xóa nhiều sản phẩm
- [ ] Product image upload → Cloudinary
- [ ] Pagination cho tất cả bảng (hiện load tất cả)

---

## Phase 6 — ESP32 Firmware ⬜

> Chờ phần cứng hoàn thiện

### Sensors
- [ ] TDS sensor (analog, cần calibration)
- [ ] pH sensor (analog, cần buffer solution)
- [ ] DHT22 hoặc SHT30 (Temp + Humidity)
- [ ] HC-SR04 (mực nước bể)
- [ ] Đọc mỗi 30 giây, publish MQTT

### Actuators
- [ ] Relay bơm nước (pump on/off)
- [ ] Relay đèn grow light
- [ ] Subscribe `garden/{deviceId}/commands`

### Camera
- [ ] OV2640 capture JPEG
- [ ] Upload lên `/api/devices/{deviceId}/capture` (HTTP POST)
- [ ] Hoặc MQTT binary (fragmented if > 256KB)
- [ ] Schedule theo `cameraInterval` từ config

### WiFi & MQTT
- [ ] WiFiManager (portal config lần đầu)
- [ ] MQTT reconnect tự động
- [ ] Heartbeat publish mỗi 60s tới `garden/{deviceId}/status`
- [ ] OTA firmware update

### Firmware Data Schema gửi về
```json
{
  "metadata": {
    "device_id": "HYDRO-TEICHI-01",
    "firmware": "v1.2.3",
    "mode": "HYDROPONICS_AUTO"
  },
  "sensor_data": {
    "temp": 27.4,
    "humi": 65.2,
    "tds_ppm": 850,
    "ph": 6.2,
    "water_level": 75,
    "light_status": true
  },
  "ai_vision": {
    "last_image_url": "https://...",
    "health_status": "Healthy",
    "confidence": 0.98,
    "issue_detected": "None"
  },
  "timestamp": 1711381200
}
```

---

## Phase 7 — Production Deployment ⬜

### Next.js → Vercel
- [ ] Vercel project kết nối GitHub repo
- [ ] Environment variables set trên Vercel dashboard
- [ ] Domain tuỳ chỉnh
- [ ] ISR cho trang products (`revalidate: 3600`)
- [ ] Edge config cho middleware

### Python FastAPI → Railway / Render
- [ ] Dockerfile tối ưu (multi-stage build)
- [ ] Set `MODEL_PATH` env var trỏ tới plantAI.pt
- [ ] Health check endpoint
- [ ] `PLANT_AI_SERVICE_URL` cập nhật sang production URL

### MongoDB Atlas
- [ ] Upgrade M0 → M10 nếu data lớn
- [ ] Time Series Collection cho SensorReading
- [ ] Indexes: `deviceId + timestamp` cho queries nhanh
- [ ] Backup policy

### Security
- [ ] Rate limiting trên `/api/ingest` (device token auth)
- [ ] Rotate MQTT credentials
- [ ] NEXTAUTH_SECRET strong random value
- [ ] Cloudinary signed uploads (bỏ unsigned preset)

---

## Thứ tự thực hiện đề xuất (từ nay)

```
Tuần 1:
  ✅ 2B: models/SensorReading.ts
  ✅ 2B: POST /api/ingest
  ✅ 2B: GET /api/devices/[id]/latest + readings

Tuần 2:
  ⬜ 4:  ThemeProvider + Light/Dark toggle
  ⬜ 4:  Cải thiện CSS variables
  ⬜ 2C: lib/mqtt.ts

Tuần 3:
  ⬜ 3A: Command API + Sensors tab wired up
  ⬜ 2D: WebSocket/SSE realtime
  ⬜ 3B: FCM Push notifications

Tuần 4+:
  ⬜ 5:  Admin panel hoàn thiện
  ⬜ 6:  Firmware ESP32 (khi có phần cứng)
  ⬜ 7:  Production deploy
```

---

## Third-party Services Summary

| Service | Mục đích | Config |
|---------|----------|--------|
| **MongoDB Atlas** | Database chính | `MONGODB_URI`, db: `AIoT` |
| **HiveMQ Cloud** | MQTT broker IoT | `MQTT_HOST:8883`, TLS |
| **Cloudinary** | Lưu ảnh sản phẩm | cloud: `ddxgfsbhh` |
| **Firebase FCM** | Push notifications | project: `aiot-smart-garden-c2373` |
| **Google OAuth** | Authentication | `GOOGLE_CLIENT_ID` |
| **Gemini API** | Plant Doctor chatbot | `GEMINI_API_KEY` |
| **Vercel** | Deploy Next.js | project: `prj_Q58Q9WQuXsAxCETHIl7kPF3CmHaS` |
| **Railway/Render** | Deploy Python FastAPI | `PLANT_AI_SERVICE_URL` |

---

## File Structure quan trọng

```
AIoT_SmartGarden/
├── app/
│   ├── api/
│   │   ├── ai/predict/          ✅ YOLOv8 proxy
│   │   ├── devices/[id]/
│   │   │   ├── diagnostics/     ✅ AI results CRUD
│   │   │   ├── command/         ⬜ MQTT command
│   │   │   ├── latest/          ⬜ Latest sensor
│   │   │   └── readings/        ⬜ Sensor history
│   │   ├── ingest/              ⬜ ESP32 data receiver
│   │   └── test-db/             ✅ DB connection test
│   └── dashboard/[deviceId]/
│       ├── overview/            🔄 Mock → real data
│       ├── sensors/             🔄 Mock → MQTT commands
│       ├── ai-lab/              ✅ Real AI + MongoDB
│       ├── plant-doctor/        ✅ Gemini chatbot
│       └── settings/            🔄 Save chưa kết nối DB
├── models/
│   ├── User.ts                  ✅
│   ├── Device.ts                ✅
│   ├── AIdiagnostic.ts          ✅ → collection: sample
│   ├── SensorReading.ts         ⬜
│   └── Alert.ts                 ⬜
├── lib/
│   ├── mqtt.ts                  ⬜
│   ├── fuseDiagnosis.ts         ✅
│   └── firebase-admin.ts        ⬜
├── plant_ai_service/
│   ├── main.py                  ✅ conf=0.50
│   ├── Dockerfile               ✅
│   └── requirements.txt         ✅
├── plantAI.pt                   ✅ YOLOv8 model
└── docker-compose.yml           ✅
```

---

## Phụ lục — Chi tiết AI Pipeline hiện tại

### Kiến trúc ứng dụng (tổng quan)

```
Frontend (Next.js)
├── Home + Products (E-commerce)
├── Auth (Google OAuth via NextAuth.js)
├── Dashboard (Device Management)
│   ├── Overview (Device cards, metrics)
│   ├── AI Lab (Disease detection + Environmental Risk Intelligence)
│   ├── Plant Doctor (Chatbot — Groq/OpenRouter/Ollama)
│   └── Settings
└── Admin Panel (User/Product/Order/Diagnostic management)

Backend (API Routes)
├── /api/devices          — Device CRUD
├── /api/products         — Product catalog
├── /api/ai/predict       — YOLOv8 disease detection proxy
├── /api/ai/chat          — LLM chat proxy (Groq/OpenRouter)
├── /api/ingest           — Sensor data từ ESP32
└── /api/admin/*          — Admin operations

AI Services (local)
├── PlantAI (FastAPI :8000)  — YOLOv8 plant disease detection
└── Ollama (:11434)          — LLM agronomy recommendations
```

### Sensor Fusion Pipeline

```
1. Camera → PlantAI (YOLOv8)
   ↓
2. topConfidence < 0.6?
   ├─ YES → kết hợp sensor context (TDS, pH, temp, humidity)
   └─ NO  → dùng kết quả YOLO trực tiếp
   ↓
3. lib/fuseDiagnosis.ts → fused diagnosis + recommendation
   ↓
4. Lưu vào MongoDB (aidiagnostics collection)
```

### Environmental Risk Intelligence Panel

```
Latest Sensor Reading
├── Extract: TDS, pH, Temperature, Humidity
├── Tính 4 Risk Scores:
│   ├── Nutrient Risk  (TDS-based)
│   ├── pH Risk
│   ├── Heat/Light Risk (temperature-based)
│   └── Fungal Risk    (humidity-based)
├── Feature Importance ranking (chỉ từ sensor có dữ liệu)
├── Dominant Risk Factor
├── 7-Day Treatment Plan (Ollama LLM)
└── Hiển thị: Overall Health · Critical Metric · Risk Dials · Immediate Action
```

### UI Pages đã hoàn thành

| Page | Route | Trạng thái |
|------|-------|-----------|
| Home | `/` | ✅ |
| Products listing | `/products` | ✅ |
| Product detail (basic) | `/products/[slug]` | ✅ |
| Cart | `/cart` | ✅ |
| Checkout (structure) | `/checkout` | ✅ |
| Dashboard home | `/dashboard` | ✅ |
| Device overview | `/dashboard/[deviceId]/overview` | ✅ |
| AI Lab | `/dashboard/[deviceId]/ai-lab` | ✅ |
| Plant Doctor | `/dashboard/[deviceId]/plant-doctor` | ✅ |
| Admin (structure) | `/admin/*` | ✅ |
| About Us | `/about` | ⬜ |
| Settings | `/dashboard/[deviceId]/settings` | ⬜ |
