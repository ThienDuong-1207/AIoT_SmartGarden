# ✅ Smart Garden AIoT — Todo List & Backlog

> Cập nhật: **01/04/2026** | **Phiên bản:** 2.0

---

## 🎨 Hướng Dẫn Đọc (Color Legend)

- **🟢 Xanh (✅ DONE)** — Phần đã hoàn thành
- **🔵 Xanh dương (🔄 ACTIVE)** — Đang làm / Có tiến độ  
- **🔴 Đỏ (❌ TODO)** — Chưa bắt đầu / Chưa xong
- **🟠 Cam (⏳ IN PROGRESS)** — Sắp làm / Đợi xử lý

---

## 🎯 Current Status Summary

| Phase | 🟢 Hoàn thành | 🔴 TODO | Trạng thái |
|-------|-----------|------|----------|
| **Phase 0** | ✅ Setup, Next.js, Dependencies | - | ✅ **DONE** |
| **Phase 1** | ✅ Auth, E-commerce, Dashboard, AI Lab | ❌ Product detail enhancements, About Us | 🔄 **ACTIVE** |
| **Phase 2** | ✅ Sensor ingestion, Device management | ❌ IoT control (pump/light), Watering schedule | ⏳ **TODO** |
| **Phase 3** | ✅ YOLOv8 + Ollama, Risk Intelligence | ❌ Plant Doctor page, Push notifications | 🔄 **ACTIVE** |
| **Phase 4** | ✅ Admin structure | ❌ Payment, Order tracking, Full CRUD | ⏳ **TODO** |

---

## 🟢 ✅ COMPLETED — Phase 0–1

### Environment Setup
- [x] Next.js 14 with App Router + TypeScript
- [x] MongoDB Atlas connection
- [x] Dependencies: mongoose, next-auth, mqtt, recharts, lucide-react, tailwindcss
- [x] Environment variables configuration

### Authentication
- [x] NextAuth.js with Google provider
- [x] User model (role: customer/admin, status: active/banned)
- [x] Middleware protection for `/dashboard`, `/admin`
- [x] Login/Register flows

### E-Commerce Frontend
- [x] Home page (hero, features, product showcase)
- [x] Products listing page with filters/sort
- [x] Product detail page (basic: image, name, price, description)
- [x] Shopping cart (sidebar/drawer)
- [x] Checkout page (structure)

### Database & API
- [x] Product model + seed data (5–10 products)
- [x] Order model
- [x] GET /api/products (list + filter)
- [x] GET /api/products/[slug]
- [x] Device model
- [x] GET /api/devices (user's devices)
- [x] POST /api/devices (new device with activation code)

### Dashboard
- [x] Dashboard home (device grid)
- [x] Device layout + sidebar
- [x] Overview tab (metrics, smart alerts)
- [x] AI Lab tab (disease scan history)
  - [x] Environmental Risk Intelligence panel (6 sections)
    - [x] Overall Health metric
    - [x] Critical Metric identification
    - [x] Risk scoring (Nutrient, pH, Heat/Light, Fungal)
    - [x] Feature Importance ranking (only from available sensors)
    - [x] Sensor Status Summary (filtered to show only available sensors)
    - [x] Immediate Action Required (with null handling)
  - [x] 7-Day Treatment Planner (Ollama-based)
  - [x] Diagnostic history cards

### AI Features Completed
- [x] YOLOv8 plant disease detection (PlantAI on port 8000)
- [x] Ollama LLM integration (port 11434)
- [x] Sensor fusion pipeline (YOLO → sensor fetch → Ollama → save)
- [x] Fused diagnosis with sensor context
- [x] Multi-sensor fallback logic
- [x] GET /api/ai/predict (YOLOv8 endpoint)
- [x] GET /api/ai/ollama (Direct LLM endpoint)
- [x] POST /api/ingest (Sensor data from ESP32)

### Admin Panel (Structure)
- [x] Admin layout and sidebar
- [x] /admin/users page
- [x] /admin/products page
- [x] /admin/orders page
- [x] /admin/diagnostics page

---

## 🔵 🔄 IN PROGRESS — Phase 1–3

### 🟢 Product Page Enhancement
- [ ] **Image Gallery/Slider**
  - [ ] Implement React carousel (swiper/glide.js) for product images
  - [ ] Thumbnail preview selector
  - [ ] Zoom on hover functionality
  - File: `app/products/[slug]/page.tsx`

- [ ] **Customer Reviews Section**
  - [ ] Review model (rating, text, user, date)
  - [ ] Display average rating + review count
  - [ ] Show 5–10 recent reviews
  - [ ] Add review form (if authenticated)
  - API: POST /api/products/[slug]/reviews

- [ ] **Related Products**
  - [ ] Fetch products from same category (excluding current)
  - [ ] Display 4–6 in carousel below main product
  - File: `components/ProductRecommendations.tsx`

- [ ] **Product Badges**
  - [ ] "New", "Best Seller", "Discount" badges
  - [ ] Stock status indicator
  - [ ] Delivery estimate

### 🔴 About Us Page
- [ ] Create `/about` page route
- [ ] **Sections:**
  - [ ] Company story/mission (hero)
  - [ ] Why Smart Garden (benefits, differentiators)
  - [ ] Team profiles (founder, key members)
  - [ ] Features highlight
  - [ ] Contact section with form
- [ ] **Contact Form:**
  - [ ] Name, email, subject, message fields
  - [ ] Validation + submission to email (Resend/Nodemailer)
  - [ ] Success/error feedback

### 🔴 Dashboard — Settings Tab
- [ ] Create `/dashboard/[deviceId]/settings` page
- [ ] **Device Management:**
  - [ ] Edit device name + description
  - [ ] Upload device cover image (Cloudinary)
  - [ ] Device status + firmware version
  - [ ] MAC address display
- [ ] **Notification Preferences:**
  - [ ] Toggle push notifications (on/off)
  - [ ] Toggle email alerts
  - [ ] Set alert threshold levels
- [ ] **Camera Settings:**
  - [ ] Schedule camera captures (e.g., every 6 hours)
  - [ ] Auto-capture toggle
  - [ ] Manual capture button
- [ ] **Danger Zone:**
  - [ ] Remove device from account button
  - [ ] Confirmation dialog

### 🔴 Dashboard — Plant Doctor Tab
- [ ] Create `/dashboard/[deviceId]/plant-doctor` page
- [ ] **Chat UI:**
  - [ ] Message list (user/AI alternating)
  - [ ] Input field + send button
  - [ ] Typing indicator when Ollama responding
  - [ ] Sensor context injection (auto-include current TDS, pH, temp, humidity in each query)
- [ ] **Chat History:**
  - [ ] Persist conversations to MongoDB (`chat_history` collection)
  - [ ] Display previous chats / conversation list
  - [ ] New chat button
- [ ] **Care Guide Articles:**
  - [ ] Tab for hydroponics tips, nutrient cycling, disease prevention
  - [ ] FAQ section
  - File: `components/dashboard/CareTipsArticles.tsx`

### 🟠 Push Notifications
- [ ] **Firebase Setup:**
  - [ ] Initialize Firebase Admin SDK in backend
  - [ ] Configure FCM credentials
- [ ] **Frontend Registration:**
  - [ ] Request notification permission on app load
  - [ ] Retrieve FCM token from user's browser
  - [ ] Save token to `users.fcmTokens` array in MongoDB
- [ ] **Notification Triggers:**
  - [ ] Send push when AI detects disease (confidence > threshold)
  - [ ] Send when sensor exceeds alert threshold
  - [ ] Send 7-day plan reminder
- [ ] **User Settings:**
  - [ ] Notification preference toggles
  - [ ] Category-based subscriptions (disease, anomaly, reminder)
- [ ] **Files to create/modify:**
  - [ ] `lib/firebase-admin.ts` (send notifications)
  - [ ] `app/api/notifications/register` (token storage)
  - [ ] `app/api/notifications/send` (trigger endpoint)

---

## 🔴 ⏳ TODO — Phase 2–4

### 🔴 IoT Peripheral Control
- [x] API config endpoint: `PATCH /api/devices/:id/config`
- [x] Dashboard route: `/dashboard/[deviceId]/controls`
- [ ] **Pump Control:**
  - [x] Dashboard UI toggle (ON/OFF)
  - [x] Send MQTT command: `garden/{deviceId}/commands` (payload config)
  - [x] Visual feedback (green= running, gray= off)
  - File: `components/dashboard/PumpControl.tsx`

- [ ] **Light Control:**
  - [x] Toggle on/off
  - [x] Brightness slider (0–100%)
  - [x] Schedule presets (12h light, 16h light, custom)
  - File: `components/dashboard/LightControl.tsx`

- [ ] **Watering Schedule:**
  - [x] Set auto water times (e.g., 08:00, 14:00, 20:00)
  - [x] Interval selector (every X hours)
  - [x] Save to device config via API
  - [x] Firmware receives via MQTT command payload

- [ ] **Sensor Calibration:**
  - [x] Calibration wizard for pH, TDS sensors
  - [x] Step-by-step instructions
  - [x] Send calibration command to ESP32 via MQTT

### 🔴 Orders & Checkout
- [ ] **Checkout Form:**
  - [ ] Shipping address input (name, phone, address, ward, district, city)
  - [ ] Shipping method selector (standard, express)
  - [ ] Order summary (products, totals, tax estimate)
  - File: `app/checkout/page.tsx`

- [ ] **Payment Integration:**
  - [ ] VNPay integration (recommended for Vietnam)
    - [ ] API Route POST `/api/payments/vnpay/create`
    - [ ] Webhook `/api/payments/vnpay/callback` → update order status
  - [ ] OR Stripe (international)
    - [ ] Stripe session creation
    - [ ] Client-side Stripe.js integration
  - [ ] Test transactions in sandbox mode

- [ ] **Order Confirmation:**
  - [ ] Confirmation page with order ID, items, delivery estimate
  - [ ] Email confirmation (Resend/Nodemailer)
  - [ ] Status: pending → processing → shipped → delivered

- [ ] **Order History:**
  - [ ] Profile tab: View past orders
  - [ ] Order detail page: items, shipping, tracking
  - [ ] Reorder button

### 🔴 Email Notifications
- [ ] **Setup Email Service:**
  - [ ] Use Resend.com (recommended) or Nodemailer
  - [ ] Configure sender email + templates

- [ ] **Emails to Send:**
  - [ ] Order confirmation (after checkout)
  - [ ] Shipping notification (tracking link)
  - [ ] Disease alert notification
  - [ ] Weekly tips & tricks digest
  - [ ] Account activity alerts

### 🔴 Admin Panel — Full Features
- [ ] **User Management:**
  - [ ] Search + filter users
  - [ ] View user profile, devices, orders
  - [ ] Ban/unban user (soft delete)
  - [ ] Edit user role
  - [ ] API: PATCH /api/admin/users/[id], DELETE /api/admin/users/[id]

- [ ] **Product Management:**
  - [ ] Full CRUD (create, read, update, delete products)
  - [ ] Bulk image upload (Cloudinary)
  - [ ] Stock/inventory tracking
  - [ ] Price history
  - [ ] API: POST, PUT, DELETE /api/admin/products/[id]

- [ ] **Order Management:**
  - [ ] Order list with filters (status, date range)
  - [ ] Order detail page
  - [ ] Update order status (processing → shipped → delivered)
  - [ ] Export orders to CSV
  - [ ] Refund/cancel orders
  - [ ] API: GET, PATCH /api/admin/orders/[id]

- [ ] **Diagnostic Analytics:**
  - [ ] AI scan history (charts, trends)
  - [ ] Most common diseases detected
  - [ ] Disease spread over time
  - [ ] Export diagnostic data
  - [ ] Sensor anomaly trends
  - [ ] API: GET /api/admin/diagnostics (with filtering)

- [ ] **Device Activation:**
  - [ ] Admin generates activation codes
  - [ ] Assign code to customer (one-time use)
  - [ ] Track which device belongs to which user
  - [ ] Revoke/regenerate codes

### 🔴 Hardware & Firmware Integration (Phase 2)
- [ ] **ESP32 Firmware:**
  - [ ] Sensor reading loop (TDS, pH, temp, humidity every 30s)
  - [ ] MQTT publish to `garden/{deviceId}/sensors`
  - [ ] MQTT subscribe to `garden/{deviceId}/commands` (pump, light, capture)
  - [ ] Camera image capture + Cloudinary upload
  - [ ] Graceful error handling + reconnection logic
  - [ ] Firmware over-the-air (OTA) update support

- [ ] **Real-time Dashboard Updates:**
  - [ ] WebSocket connection for sensor feeds
  - [ ] Live chart updates (24h sensor history)
  - [ ] Real-time alert triggers
  - [ ] Connection status indicator

---

## 📊 Priority Matrix

### High Impact + Low Effort (DO FIRST)
1. ✅ Product page enhancements (gallery, related products)
2. ✅ About Us page
3. ✅ Dashboard Settings tab
4. ✅ Plant Doctor chat page

### High Impact + Medium Effort
5. Push notifications (Firebase FCM)
6. Payment integration (VNPay/Stripe)
7. Email notifications
8. Pump/Light control UI

### Medium Impact + Medium Effort
9. Admin full CRUD features
10. Order management & history
11. Product reviews system
12. Sensor calibration UI

### Lower Priority
13. Watering schedule advanced features
14. Hardware firmware optimization
15. Analytics dashboards

---

## 🚀 Deployment Checklist

- [ ] All features in main branch tested
- [ ] Environment variables configured on Vercel
- [ ] Database migrations completed
- [ ] API endpoints tested in production
- [ ] Images optimized (Cloudinary)
- [ ] SEO meta tags added
- [ ] Analytics setup (Google Analytics)
- [ ] Error monitoring (Sentry or similar)
- [ ] Performance audit (Lighthouse)
- [ ] Security audit (OWASP)
- [ ] Domain + SSL configured
- [ ] Email service tested
- [ ] Push notifications verified

---

## 📝 Notes

- **AI Services:** PlantAI and Ollama run locally on Mac M1 (see NATIVE_AI_SETUP.md for startup commands)
- **Image Storage:** Using Cloudinary for product and device images
- **Database:** MongoDB Atlas (M0 free tier for dev, upgrade for production)
- **Frontend:** Next.js 14 with Tailwind CSS + shadcn/ui components
- **State Management:** React hooks (no Redux needed for current complexity)

---

## 📅 Timeline Estimate

| Task Batch | Effort | Target Duration |
|-----------|--------|------------------|
| Product enhancements + About + Settings | 2–3 weeks | Next iteration |
| Plant Doctor + Push notifications | 3–4 weeks | Following sprint |
| Payment + Checkout | 2–3 weeks | Q2 2026 |
| IoT control + firmware | 3–4 weeks | Q2 2026 |
| Admin full features | 2–3 weeks | Q2 2026 |
| **Total remaining** | ~13–17 weeks | **Until Q3 2026** |
