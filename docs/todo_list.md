# ✅ Smart Garden AIoT — Todo List

> Dựa trên [design document](./smart_garden_aiot_design.md) · Cập nhật: 19/03/2026

---

## ⚙️ Phase 0 — Chuẩn Bị & Setup

### Môi trường & Tài khoản
- [ ] Tạo repo GitHub (monorepo hoặc tách `web` / `ai-service` / `firmware`)
- [ ] Tạo project Vercel, kết nối GitHub repo
- [ ] Tạo cluster MongoDB Atlas (M0 Free tier để dev)
- [ ] Tạo project Firebase → bật FCM (Push Notifications)
- [ ] Tạo tài khoản Cloudinary (lưu ảnh camera)
- [ ] Tạo tài khoản HiveMQ Cloud (MQTT broker)
- [ ] Tạo Google OAuth credentials (Google Cloud Console)
- [ ] Lấy Gemini API Key (Google AI Studio)

### Khởi tạo Next.js Project
- [x] `npx create-next-app@latest` với TypeScript + App Router + Tailwind
- [x] Cài đặt dependencies: `mongoose`, `next-auth`, `mqtt`, `recharts`, `lucide-react`
- [x] Cấu hình `.env.local` với tất cả biến môi trường
- [ ] Deploy thử lên Vercel, xác nhận build thành công
- [ ] Migrate các components từ Vite project → `components/dashboard/`

---

## 🏪 Phase 1 — MVP (E-commerce + Auth + Dashboard cơ bản)
> *Kết quả: Website có thể truy cập, đăng nhập Google, xem dashboard với data mock*

### Auth
- [x] Cài đặt NextAuth.js với Google Provider
- [x] Tạo Mongoose model `User` (role: customer/admin, status: active/banned)
- [x] Viết `middleware.ts` — bảo vệ route `/dashboard` và `/admin` theo role
- [x] Trang `/auth/login` — UI đăng nhập Google
- [x] Trang `/auth/register` — (redirect Google OAuth)
- [x] Redirect sau login: customer → `/dashboard`, admin → `/admin`

### E-commerce — Trang công khai
- [x] Trang chủ `/` — Hero, Feature Strip, Product Showcase, How It Works
- [x] Trang danh mục `/products` — grid product cards, filter (loại/giá/rating), sort
- [x] Trang chi tiết `/products/[slug]` — gallery, specs, CTA buttons
- [x] Trang giỏ hàng `/cart` — sidebar drawer, danh sách sản phẩm, tổng tiền

### Database — E-commerce
- [x] Mongoose model `Product` — seed 5–10 sản phẩm mẫu (seeds, nutrients, smart pot)
- [x] Mongoose model `Order`
- [x] API Route `GET /api/products` — list + filter
- [x] API Route `GET /api/products/[slug]` — chi tiết

### Dashboard User — Cơ bản
- [x] Mongoose model `Device`
- [x] Trang `/dashboard` — grid card tất cả chậu cây của user
- [x] Layout `/dashboard/layout.tsx` — sidebar + Pot Selector dropdown
- [x] Trang `/dashboard/[deviceId]/overview` — metric cards + chart (mock data)
- [x] Component `SmartAlerts` — 5 cảnh báo gần nhất
- [x] API Route `GET /api/devices` — trả về devices của user hiện tại (filter by userId)
- [x] API Route `POST /api/devices` — thêm chậu mới bằng activation code

---

## 📡 Phase 2 — IoT Integration (ESP32 + MQTT)
> *Kết quả: Sensor data real-time hiển thị trên dashboard*

### MQTT Backend
- [ ] Viết `lib/mqtt.ts` — kết nối HiveMQ Cloud, subscribe topic `garden/#`
- [ ] API Route `POST /api/sensors` — nhận sensor data từ ESP32, lưu vào MongoDB
- [ ] Mongoose model `SensorReading` — **Time Series Collection** (metadata: deviceId)
- [ ] WebSocket endpoint — push sensor data realtime đến client dashboard

### Dashboard — Realtime
- [ ] Cập nhật `overview/page.tsx` — subscribe WebSocket, cập nhật metric cards live
- [ ] `NutrientStabilityChart` — chart 24h từ `sensor_readings` thực tế
- [ ] API Route `GET /api/sensors/[deviceId]` — lịch sử sensor (query time range)

### ESP32 Firmware
- [ ] Viết firmware ESP32-S3 (Arduino/PlatformIO):
  - [ ] Đọc TDS sensor mỗi 30 giây
  - [ ] Đọc pH sensor mỗi 30 giây
  - [ ] Đọc DHT22 (nhiệt độ, độ ẩm)
  - [ ] Đọc HC-SR04 (mực nước)
  - [ ] Publish MQTT topic `garden/{deviceId}/sensors`
- [ ] Firmware lắng nghe lệnh từ `garden/{deviceId}/commands`
  - [ ] `pump_on` / `pump_off` — điều khiển relay bơm
  - [ ] `light_on` / `light_off` — điều khiển relay đèn
  - [ ] `capture_now` — trigger chụp ảnh camera
- [ ] Firmware chụp ảnh theo lịch (mặc định mỗi 6 giờ) và upload lên Cloudinary

### Dashboard — Sensor Control Tab
- [ ] Trang `/dashboard/[deviceId]/sensors` — UI điều khiển
- [ ] Toggle bơm nước, đèn (gửi MQTT command)
- [ ] Hẹn giờ tưới tự động
- [ ] Slider đặt ngưỡng cảnh báo (lưu vào `devices.config.alertThresholds`)
- [ ] Camera: nút "Chụp ngay" → publish MQTT → nhận ảnh về

---

## 🤖 Phase 3 — AI Features
> *Kết quả: Chẩn đoán bệnh lá tự động, push notification, Plant Doctor chatbot*

### YOLOv8 Training (Google Colab)
- [ ] Thu thập / download dataset PlantVillage (hoặc ảnh tự chụp)
- [ ] Tạo `plant_disease.yaml` config (classes: healthy, yellow_leaf, powdery_mildew…)
- [ ] Train YOLOv8n trên Colab với dataset
- [ ] Đánh giá: xem metrics (mAP, precision, recall) tại `results.png`
- [ ] Download `best.pt` từ `runs/detect/train/weights/`

### FastAPI AI Service (Railway)
- [ ] Tạo folder `ai-service/` với `main.py`, `requirements.txt`
- [ ] Viết endpoint `POST /predict` — load `best.pt`, chạy inference, trả annotated image
- [ ] Test local với `uvicorn main:app --reload`
- [ ] Deploy lên Railway, lấy public URL
- [ ] Set env var `AI_SERVICE_URL` trên Vercel

### AI Integration — Next.js
- [ ] API Route `POST /api/ai/diagnose` — gọi FastAPI → lấy sensor context → reasoning
- [ ] Mongoose model `AIDiagnostic`
- [ ] Hàm `buildDiagnosis()` — multi-sensor fusion rule engine
- [ ] Trang `/dashboard/[deviceId]/ai-lab` — grid lịch sử AI scans
- [ ] Component `DiagnosticCard` — ảnh gốc + annotated + diagnosis text

### Push Notifications
- [ ] Cấu hình Firebase Admin SDK ở backend
- [ ] Lưu FCM token của user vào `users.fcmToken`
- [ ] Hàm `sendPushNotification(deviceId, message)` — gửi khi AI phát hiện bất thường
- [ ] Cài đặt notification: user toggle on/off trong Settings tab

### Plant Doctor Chatbot
- [ ] API Route `POST /api/ai/chat` — Gemini 1.5 Flash với system prompt thủy canh
- [ ] Inject sensor context (TDS, pH, temp) vào mỗi request
- [ ] Persist `chat_history` vào MongoDB
- [ ] Trang `/dashboard/[deviceId]/plant-doctor` — chat UI ([PlantDoctorChat.tsx](file:///f:/BIGBOSS/GitHub/smart-garden-aiot/src/app/components/PlantDoctorChat.tsx))
- [ ] Tab "Hướng dẫn" — bài viết cơ bản về thủy canh

---

## 🛡️ Phase 4 — Admin Panel + E-commerce đầy đủ
> *Kết quả: Admin quản lý người dùng/đơn hàng, checkout hoàn chỉnh*

### Admin Panel
- [ ] Layout `/admin/layout.tsx` — sidebar admin
- [ ] Trang `/admin` — thống kê: số user, devices online, doanh thu tháng (charts)
- [ ] Trang `/admin/users` — bảng danh sách, search, filter
- [ ] Trang `/admin/users/[id]` — profile + danh sách chậu + đơn hàng của user
- [ ] API Route `PATCH /api/admin/users/[id]` — đổi role, ban/unban
- [ ] API Route `DELETE /api/admin/users/[id]` — soft delete
- [ ] Trang `/admin/products` — CRUD sản phẩm (thêm/sửa/xóa, upload ảnh Cloudinary)
- [ ] Trang `/admin/orders` — danh sách đơn, cập nhật trạng thái
- [ ] Trang `/admin/diagnostics` — log AI toàn hệ thống, thống kê + export CSV
- [ ] Sau khi ship Smart Pot: admin kích hoạt device → gán `deviceId` cho user

### E-commerce — Hoàn chỉnh
- [ ] Trang checkout `/checkout` — form địa chỉ giao hàng
- [ ] Tích hợp thanh toán VNPay (hoặc Stripe)
- [ ] Webhook xác nhận thanh toán → tạo Order → trigger kích hoạt device
- [ ] Trang xác nhận đơn hàng với mã đơn
- [ ] Email xác nhận đơn hàng (Resend / Nodemailer)

### Dashboard — Settings Tab
- [ ] Trang `/dashboard/[deviceId]/settings` — đổi tên, ảnh chậu
- [ ] Cài đặt lịch chụp camera (input số giờ → lưu `cameraInterval`)
- [ ] Toggle thông báo Push / Email
- [ ] Xem thông tin firmware (version, MAC)
- [ ] Nút "Xoá thiết bị khỏi tài khoản"

---

## 🧪 Kiểm Tra & Ra Mắt

- [ ] Test end-to-end: mua hàng → nhận thiết bị → kích hoạt → xem dashboard
- [ ] Test AI pipeline: chụp ảnh → FastAPI → hiển thị diagnosis + push notification
- [ ] Test phân quyền: customer không vào được `/admin`
- [ ] Tối ưu Vercel: cấu hình `ISR` cho trang sản phẩm, `Edge` cho API sensors
- [ ] Cấu hình domain tuỳ chỉnh trên Vercel
- [ ] Viết README hướng dẫn setup môi trường (cho team)

---

## 📊 Tiến Độ Tổng Thể

| Phase | Mô tả | Ước tính | Trạng thái |
|---|---|---|---|
| Phase 0 | Setup & chuẩn bị | 1–2 ngày | ⬜ Chưa bắt đầu |
| Phase 1 | MVP e-commerce + auth + dashboard | 4–6 tuần | ⬜ Chưa bắt đầu |
| Phase 2 | IoT + ESP32 + MQTT realtime | 3–4 tuần | ⬜ Chưa bắt đầu |
| Phase 3 | AI features (YOLOv8 + chatbot) | 3–4 tuần | ⬜ Chưa bắt đầu |
| Phase 4 | Admin panel + checkout đầy đủ | 2–3 tuần | ⬜ Chưa bắt đầu |
| **Tổng** | | **~13–19 tuần** | |
