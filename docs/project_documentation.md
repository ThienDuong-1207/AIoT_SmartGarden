# Project Documentation — Smart Garden AIoT

> **Cập nhật:** 01/04/2026 | **Version:** 1.2 | **Stack:** Next.js 14 · MongoDB Atlas · ESP32 · YOLOv8 · Ollama

---

## 📊 Tổng Quan Tiến Độ

### ✅ Hoàn Thành
- **Frontend:** Home page, Products listing, Product detail page (cơ bản), Auth (Google OAuth)
- **E-commerce:** Cart page, Checkout flow (structure), Product management
- **Database:** MongoDB integration, Models (User, Device, Product, Order, Diagnostic)
- **Dashboard:** Device overview, Sensor monitoring, AI Lab with Environmental Risk Intelligence
- **AI Features:** 
  - YOLOv8 plant disease detection (PlantAI service on port 8000)
  - Ollama LLM integration (port 11434) for 7-day treatment planning
  - Sensor fusion with multi-sensor fallback pipeline (YOLO → sensor → Ollama → save)
  - Environmental Risk Intelligence panel with risk scoring, feature importance, dominant factor analysis
- **API Endpoints:** `/api/devices`, `/api/products`, `/api/ai/chat`, `/api/ai/predict`, `/api/ingest`
- **Admin Panel:** Users, Products, Orders, Diagnostics pages (structure)
- **Authentication & Authorization:** NextAuth.js, Role-based middleware

### ⏳ Đang Làm / Sắp Làm
1. **Product Detail Page Enhancement** — Image slider/gallery, customer reviews section, related products recommendations
2. **About Us Page** — Company story, mission/vision, team profiles, contact form
3. **Shopping Cart Checkout Flow** — Complete payment integration (VNPay/Stripe), order confirmation email
4. **Dashboard Settings Tab** — Device naming, camera schedule, notification preferences, firmware info
5. **Plant Doctor Chatbot Page** — Dedicated chat interface, conversation history, care guide articles
6. **Push Notifications** — Firebase FCM setup, notification preferences, real-time alerts
7. **Admin Full Features** — User management, product CRUD, order tracking, AI diagnostic analytics
8. **Email Notifications** — Order confirmation, disease alerts, tips & tricks

---

## 📋 Chi Tiết Hệ Thống Hiện Tại

### 🎯 Kiến Trúc Ứng Dụng
```
Frontend (Next.js 14)
├── Home + Products (E-commerce)
├── Auth (Google OAuth via NextAuth.js)
├── Dashboard (Device Management)
│   ├── Overview (Device cards, metrics)
│   ├── AI Lab (Disease detection history, Environmental Risk Intelligence)
│   ├── Plant Doctor (Chatbot - TODO)
│   └── Settings (TODO)
└── Admin Panel (User/Product/Order/Diagnostic management)

Backend (API Routes)
├── /api/devices (Device CRUD)
├── /api/products (Product catalog)
├── /api/ai/predict (YOLOv8 disease detection)
├── /api/ai/chat (Ollama LLM recommendations)
├── /api/ai/ollama (Direct Ollama endpoint)
├── /api/ingest (Sensor data from ESP32)
└── /api/admin/* (Admin operations)

AI Services
├── PlantAI (FastAPI, port 8000) — YOLOv8 plant disease detection
└── Ollama (port 11434) — LLM for agronomy recommendations

Database (MongoDB Atlas)
├── users — User accounts, settings, FCM tokens (TODO)
├── devices — Smart pots, associations
├── sensor_readings — Time-series sensor data
├── ai_diagnostics — Disease detection results
├── products — E-commerce product catalog
├── orders — Purchase history
└── alerts — Alert history (TODO)
```

### 🤖 AI Pipeline (Current)

**Sensor Fusion för Disease Detection:**
```
1. Camera → YOLO (PlantAI service)
   ↓
2. Disease confidence < 0.6? 
   ├─ YES → Fetch latest sensor data (TDS, pH, temp, humidity)
   └─ NO → Use YOLO result
3. Combine with sensor context
   ↓
4. Generate fused diagnosis
   ↓
5. Save to MongoDB (ai_diagnostics)
```

**Environmental Risk Intelligence Panel:**
```
Latest Sensor Reading
├─ Extract: TDS, pH, Temperature, Humidity
├─ Calculate 4 Risk Scores:
│  ├─ Nutrient Risk (TDS-based)
│  ├─ pH Risk
│  ├─ Heat/Light Risk (temperature-based)
│  └─ Fungal Risk (humidity-based)
├─ Determine Feature Importance (only from available sensors)
├─ Identify Dominant Risk Factor
├─ Generate 7-day Treatment Plan (via Ollama LLM)
└─ Display: Overall Health, Critical Metric, Risk Dials, Feature Importance, Sensor Status, Immediate Action
```

**7-Day Treatment Planner (Ollama):**
- Days 1-2: Stabilize pH and nutrient levels, recalibrate sensors
- Days 3-5: Implement corrective actions for dominant risk factor
- Days 6-7: Validate improvements via repeat scans and sensor trending

### 📱 UI Components & Pages

**Completed Components:**
- `AppHeader` — Navigation with auth status
- `HomeHero` — Landing section
- `ProductsClient` — Product grid with filters
- `ProductCard` — Product preview
- `DeviceCard` — Device status card
- `SmartAlerts` — Alert list
- `AITestUpload` — Manual disease scan upload
- `Environmental Risk Intelligence Panel` — 6-section risk analysis dashboard

**Pages Done:**
- `/` — Home (hero, features, product showcase)
- `/products` — Product listing
- `/products/[slug]` — Product detail (basic)
- `/cart` — Shopping cart
- `/checkout` (structure)
- `/dashboard` — Device list
- `/dashboard/[deviceId]/overview` — Device metrics
- `/dashboard/[deviceId]/ai-lab` — Disease analysis history + Environmental Risk Intelligence
- `/admin/*` — Admin pages (structure)

**Pages TODO:**
- `/about` — Company info + contact
- `/dashboard/[deviceId]/plant-doctor` — Chat interface
- `/dashboard/[deviceId]/settings` — Device configuration
- `/products/[slug]` (enhanced) — Reviews, recommendations

### 🔧 Configuration & Services

**Local Services (Mac M1/M2):**
- PlantAI: `uvicorn plant_ai_service.main:app --host 0.0.0.0 --port 8000`
- Ollama: `ollama serve` (automatically serves on :11434)

**Environment Variables (.env.local):**
```bash
# NextAuth
NEXTAUTH_SECRET=...
GOOGLE_ID=...
GOOGLE_SECRET=...

# MongoDB
MONGODB_URI=...

# API Services
PLANT_AI_SERVICE_URL=http://localhost:8000
OLLAMA_BASE_URL=http://localhost:11434

# Storage
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_UPLOAD_PRESET=...

# (TODO) Firebase FCM, Payment gateway
```

---

## 🎯 Current Focus Areas

### AI Lab Enhancements ✅
- ✅ Environmental Risk Intelligence panel (6 metrics + risk scoring)
- ✅ Feature importance calculation (only from available sensors)
- ✅ Sensor status filtering (show only available sensors)
- ✅ Immediate action logic with null handling
- ✅ 7-day treatment planner (Ollama-based)

### Next Priority
1. **Product Page Enhancement** — Add image gallery, reviews, related products
2. **About Us Design** — Create company story page
3. **Settings Tab** — Device configuration UI
4. **Plant Doctor Chat** — Dedicated chatbot interface
5. **Payment Integration** — VNPay/Stripe checkout

---

## 📚 File Locations

### Key Files
- **App Routes:** `app/` (pages, api, auth, dashboard, admin)
- **Components:** `components/` (dashboard, marketing, admin, providers, ui)
- **Styles:** `app/globals.css`, `tailwind.config.ts`
- **Database:** `models/` (MongoDB schemas)
- **Library:** `lib/` (auth, MQTT, MongoDB, utilities)
- **Docs:** `docs/` (NATIVE_AI_SETUP, design specs, projects phases)

### AI Lab Client Component
- **File:** `app/dashboard/[deviceId]/ai-lab/AILabClient.tsx`
- **Features:** Environmental Risk Intelligence, AI scan history, disease detection cards
- **Dependencies:** Ollama (7-day planner), PlantAI diagnostic data

### Tong quan
- **web/:** ung dung Next.js App Router, gom giao dien va API route.
- **Cac file .md o thu muc goc:** tai lieu thiet ke, test, todo, ghi chu.

### List of Files (Selected)
- **Config:** `.gitignore`, `.env.local`, `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`.
- **Docs:** `AGENTS.md`, `CLAUDE.md`, `README.md`.
- **Pages (App Router):**
    - `app/page.tsx` (Home)
    - `app/dashboard/...` (Dashboard routes)
    - `app/products/...` (E-commerce routes)
    - `app/api/...` (Backend API endpoints)
- **Components:** `components/dashboard`, `components/marketing`.
- **Lib:** `lib/mongodb.ts`, `lib/auth.ts`, `lib/mqtt.ts`.
- **Models:** Mongoose models in `models/`.

(See detailed file list in original `project_file_information.md` if needed for detailed audit).
