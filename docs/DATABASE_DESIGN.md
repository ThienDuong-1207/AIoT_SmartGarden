# Database Design — Smart Garden AIoT

**Database:** MongoDB Atlas
**Database name:** `AIoT`
**Collections:** 8
**ODM:** Mongoose 9.x

---

## Sơ đồ quan hệ

```
┌──────────────────────────────────────────────────────────────────┐
│  users                                                           │
│  _id · name · email · role · status · provider                  │
└────┬─────────────────────────────────────────────────────────────┘
     │ 1:N (userId)                    │ 1:N (userId)
     ▼                                 ▼
┌─────────────────────┐     ┌──────────────────────────────────────┐
│  devices            │     │  orders                              │
│  deviceId (unique)  │     │  orderCode · items · totalAmount     │
│  userId · config    │     │  deviceActivationCode ──────────────►│
│  activationCode ◄───┼─────┘            devices.activationCode   │
└────────┬────────────┘                                            │
         │                                                         │
    deviceId (1:N)                                                 │
         │                                                         │
    ┌────┼──────────────────────────────────┐                     │
    │    │                │                 │                     │
    ▼    ▼                ▼                 ▼                     │
sensorreadings  alerts  aidiagnostics  cameracaptures            │
                                                                  │
                                          items[].productId       │
                                               ▼                  │
                                          products                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Collection 1 — `users`

Tài khoản người dùng. Hỗ trợ Google OAuth và đăng nhập bằng email/password (admin).

```js
{
  _id:       ObjectId,
  name:      String,          // required
  email:     String,          // required, unique
  image:     String,          // avatar URL từ Google
  password:  String,          // bcrypt hash, chỉ dùng cho admin credentials
  provider:  String,          // "google" | "credentials", default: "google"
  role:      String,          // "customer" | "admin", default: "customer"
  status:    String,          // "active" | "banned", default: "active"
  createdAt: Date,
  updatedAt: Date,
}
```

**Indexes:**
```
{ email: 1 }          unique
{ role: 1 }
{ status: 1 }
```

---

## Collection 2 — `devices`

Thiết bị ESP32. Mỗi thiết bị gắn với 1 user sau khi kích hoạt.

```js
{
  _id:             ObjectId,
  deviceId:        String,    // required, unique — VD: "sg-001", flash vào firmware
  userId:          ObjectId,  // ref: users._id, required
  name:            String,    // required — tên người dùng đặt
  plantType:       String,    // loại cây, default: "Unknown"
  firmwareVersion: String,    // default: "1.0.0"
  wifiMAC:         String,    // địa chỉ MAC WiFi của ESP32
  isOnline:        Boolean,   // default: false
  lastSeenAt:      Date,      // thời điểm nhận data gần nhất
  activationCode:  String,    // required, unique — in trong hộp sản phẩm

  config: {
    cameraInterval:       Number,   // giây, default: 21600 (6 tiếng)
    notificationsEnabled: Boolean,  // default: true
    alertThresholds: {
      tds:  { min: Number, max: Number },  // ppm, default: 800–1800
      ph:   { min: Number, max: Number },  // default: 5.5–7.0
      temp: { min: Number, max: Number },  // °C, default: 18–30
    },
  },

  createdAt: Date,
  updatedAt: Date,
}
```

**Indexes:**
```
{ deviceId: 1 }         unique
{ userId: 1 }
{ activationCode: 1 }   unique
```

**Ghi chú:**
- `isOnline` được tính lại realtime trong API: `lastSeenAt > now - 5 phút`
- `activationCode` liên kết với `orders.deviceActivationCode`
- `config.alertThresholds` có thể tùy chỉnh theo từng thiết bị

---

## Collection 3 — `sensorreadings`

Time-series data từ ESP32. Collection lớn nhất — cần TTL và compound index.

```js
{
  _id:          ObjectId,
  deviceId:     String,   // required, ref: devices.deviceId
  timestamp:    Date,     // required, default: Date.now
  temp:         Number,   // nhiệt độ nước (°C)
  humi:         Number,   // độ ẩm không khí (%)
  tds_ppm:      Number,   // nồng độ dinh dưỡng (ppm)
  ph:           Number,   // độ pH dung dịch
  light_status: Boolean,  // đèn grow light bật/tắt
  water_level:  Number,   // mực nước bồn (%)
  raw:          Mixed,    // raw payload gốc từ ESP32 (debug)
}
```

**Indexes:**
```
{ deviceId: 1, timestamp: -1 }          // compound — query chính
{ timestamp: 1 } expireAfterSeconds: 7776000  // TTL: tự xóa sau 90 ngày
```

**Ước tính dung lượng:**
```
1 thiết bị × 2 readings/phút × 60 × 24 = ~2.880 docs/ngày
10 thiết bị × 90 ngày = ~2.592.000 docs → ~500MB với TTL
```

**Nguồn dữ liệu:**
- MQTT topic `garden/{deviceId}/sensors` → `lib/mqtt.ts`
- HTTP POST `/api/ingest` → fallback khi mất MQTT

---

## Collection 4 — `alerts`

Cảnh báo tự động khi sensor vượt ngưỡng hoặc thiết bị offline.

```js
{
  _id:         ObjectId,
  deviceId:    String,    // required, ref: devices.deviceId
  userId:      ObjectId,  // ref: users._id
  type:        String,    // enum — xem bên dưới
  severity:    String,    // "info" | "warning" | "danger"
  message:     String,    // required — mô tả rõ ràng cho user
  value:       Number,    // giá trị thực tế tại lúc trigger
  threshold:   Number,    // ngưỡng bị vượt qua
  isRead:      Boolean,   // default: false
  triggeredAt: Date,      // default: Date.now
}
```

**Enum `type`:**
```
"tds_low"       TDS dưới ngưỡng tối thiểu
"tds_high"      TDS trên ngưỡng tối đa
"ph_low"        pH quá thấp
"ph_high"       pH quá cao
"temp_low"      Nhiệt độ quá thấp
"temp_high"     Nhiệt độ quá cao
"water_low"     Mực nước dưới 20%
"ai_disease"    AI phát hiện bệnh cây
"device_offline" Thiết bị mất kết nối
```

**Ngưỡng mặc định:**
```
TDS:         min 800 ppm   → tds_low (warning)
             max 1800 ppm  → tds_high (warning)
pH:          min 5.5       → ph_low (danger)
             max 7.0       → ph_high (danger)
Nhiệt độ:   min 18°C      → temp_low (warning)
             max 30°C      → temp_high (warning)
Mực nước:   < 20%         → water_low (danger)
```

**Indexes:**
```
{ deviceId: 1, triggeredAt: -1 }
{ userId: 1, isRead: 1 }
{ isRead: 1 }
```

---

## Collection 5 — `aidiagnostics`

Kết quả phân tích ảnh cây bằng YOLOv8 model. Kết hợp với dữ liệu sensor tại thời điểm chụp.

> ⚠️ **Bug hiện tại:** Model đang ghi vào collection `"sample"`. Cần sửa `models/AIdiagnostic.ts` dòng 62:
> ```ts
> // Xóa tham số thứ 3 "sample"
> export default mongoose.model("AIdiagnostic", AIdiagnosticSchema);
> ```

```js
{
  _id:         ObjectId,
  deviceId:    String,    // required, ref: devices.deviceId
  capturedAt:  Date,      // default: Date.now

  imageBase64: String,    // data:image/jpeg;base64,... (tạm thời, xem ghi chú)

  sensorContext: {        // snapshot sensor tại thời điểm chụp
    tds:         Number | null,
    ph:          Number | null,
    temperature: Number | null,
    humidity:    Number | null,
  },

  detections: [{          // tất cả objects YOLOv8 phát hiện
    class:      String,   // tên bệnh / trạng thái
    confidence: Number,   // 0.0 – 1.0
    bbox:       [Number], // [x1, y1, x2, y2] pixel coords
  }],

  status:         String, // "healthy" | "warning" | "danger"
  topDisease:     String | null,
  topConfidence:  Number, // 0.0 – 1.0
  fusedDiagnosis: String, // nhận xét kết hợp AI + sensor
  recommendation: String, // hướng dẫn xử lý
  aiModel:        String, // "YOLOv8-plantAI"
  processingMs:   Number, // thời gian inference (ms)

  createdAt: Date,
  updatedAt: Date,
}
```

**Indexes:**
```
{ deviceId: 1, capturedAt: -1 }   // compound
{ deviceId: 1, status: 1 }        // filter theo trạng thái
```

**Ghi chú — imageBase64:**
Hiện tại lưu base64 thẳng vào MongoDB. Mỗi ảnh ~300–600KB → document ~800KB.
Khi có nhiều thiết bị nên chuyển sang **Cloudinary hoặc S3**, chỉ lưu URL.

---

## Collection 6 — `cameracaptures`

Snapshot tạm thời từ camera ESP32. Chỉ dùng để frontend polling lấy ảnh sau lệnh `capture_now`. Tự động xóa khi quá 10 ảnh/thiết bị.

```js
{
  _id:         ObjectId,
  deviceId:    String,  // required, ref: devices.deviceId
  imageBase64: String,  // data:image/jpeg;base64,...
  capturedAt:  Date,    // required, default: Date.now
}
```

**Indexes:**
```
{ deviceId: 1, capturedAt: -1 }   // compound
```

**Retention policy:**
Mỗi lần ESP32 upload ảnh mới, server giữ tối đa 10 snapshot gần nhất và xóa các ảnh cũ hơn.

---

## Collection 7 — `orders`

Đơn hàng e-commerce. Mỗi đơn có thể kèm mã kích hoạt thiết bị.

```js
{
  _id:       ObjectId,
  userId:    ObjectId,  // required, ref: users._id
  orderCode: String,    // required, unique — VD: "ORD-20240327-A1B2"

  items: [{
    productId: ObjectId, // ref: products._id
    name:      String,   // snapshot tên sản phẩm lúc mua
    qty:       Number,
    price:     Number,   // giá lúc mua (không thay đổi khi product đổi giá)
  }],

  totalAmount:     Number,  // required
  shippingAddress: Mixed,   // { name, phone, address, city, ... }
  paymentMethod:   String,  // "cod" | "banking", default: "cod"

  paymentStatus: String,    // "pending" | "paid" | "failed"
  orderStatus:   String,    // "pending" | "processing" | "completed" | "cancelled"

  deviceActivationCode: String, // liên kết tới devices.activationCode

  createdAt: Date,
  updatedAt: Date,
}
```

**Indexes:**
```
{ userId: 1 }
{ orderCode: 1 }   unique
{ orderStatus: 1 }
```

**Ghi chú:**
`items[].name` và `items[].price` lưu snapshot tại thời điểm mua — đảm bảo lịch sử đơn hàng không bị ảnh hưởng khi admin sửa sản phẩm.

---

## Collection 8 — `products`

Sản phẩm bán trên cửa hàng (hạt giống, dinh dưỡng, chậu thông minh).

```js
{
  _id:         ObjectId,
  slug:        String,   // required, unique — URL-friendly, VD: "hat-giong-rau-cai"
  name:        String,   // required
  category:    String,   // "seeds" | "nutrients" | "smart-pots"
  price:       Number,   // required — giá gốc (VND)
  salePrice:   Number,   // giá khuyến mãi (optional)
  images:      [String], // mảng URL ảnh
  description: String,
  specs:       Mixed,    // thông số kỹ thuật dạng key-value
  stock:       Number,   // default: 0
  rating:      Number,   // trung bình, default: 0
  reviewCount: Number,   // default: 0
  tags:        [String], // tìm kiếm, filter

  createdAt: Date,
  updatedAt: Date,
}
```

**Indexes:**
```
{ slug: 1 }       unique
{ category: 1 }
{ tags: 1 }
```

---

## Tổng hợp indexes theo collection

```
users:           email(unique), role, status
devices:         deviceId(unique), userId, activationCode(unique)
sensorreadings:  {deviceId,timestamp}(compound), timestamp(TTL 90d)
alerts:          {deviceId,triggeredAt}, {userId,isRead}, isRead
aidiagnostics:   {deviceId,capturedAt}, {deviceId,status}
cameracaptures:  {deviceId,capturedAt}
orders:          userId, orderCode(unique), orderStatus
products:        slug(unique), category, tags
```

---

## Ước tính dung lượng (10 thiết bị, 1 năm)

| Collection | Docs | Avg size | Total |
|---|---|---|---|
| `users` | ~100 | 1 KB | < 1 MB |
| `devices` | ~50 | 2 KB | < 1 MB |
| `sensorreadings` | ~10M (TTL 90d) | 200 B | ~2 GB |
| `alerts` | ~50K | 300 B | ~15 MB |
| `aidiagnostics` | ~5K | 600 KB | ~3 GB |
| `cameracaptures` | ~500 (max 10×50) | 400 KB | ~200 MB |
| `orders` | ~1K | 2 KB | ~2 MB |
| `products` | ~50 | 5 KB | < 1 MB |

> `aidiagnostics` và `cameracaptures` chiếm nhiều nhất do lưu imageBase64.
> Khi scale lên nên dùng Cloudinary/S3 để giảm còn < 10 MB.

---
