/**
 * MongoDB Init Script — Smart Garden AIoT
 *
 * Chạy bằng mongosh:
 *   mongosh "mongodb+srv://Admin:admin123@aiot.rpilraf.mongodb.net/" --file scripts/init-db.js
 *
 * Hoặc mongosh local:
 *   mongosh --file scripts/init-db.js
 */

const DB_NAME = "AIoT";
db = db.getSiblingDB(DB_NAME);

print(`\n🌱 Initializing Smart Garden database: ${DB_NAME}\n`);

// ─── Helpers ──────────────────────────────────────────────────────────────────
function createCollection(name, validator) {
  const existing = db.getCollectionNames();
  if (existing.includes(name)) {
    print(`  ⚠  ${name} — already exists, skipping`);
    return;
  }
  db.createCollection(name, { validator });
  print(`  ✓  ${name} — created`);
}

function safeIndex(col, keys, opts) {
  try {
    col.createIndex(keys, opts);
  } catch (e) {
    // Index đã tồn tại (tên khác hoặc giống) — bỏ qua
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. users
// ═══════════════════════════════════════════════════════════════════════════════
createCollection("users", {
  $jsonSchema: {
    bsonType: "object",
    required: ["name", "email"],
    properties: {
      name:     { bsonType: "string" },
      email:    { bsonType: "string" },
      image:    { bsonType: "string" },
      password: { bsonType: "string" },
      provider: { bsonType: "string", enum: ["google", "credentials"] },
      role:     { bsonType: "string", enum: ["customer", "admin"] },
      status:   { bsonType: "string", enum: ["active", "banned"] },
    },
  },
});

safeIndex(db.users, { email: 1 },  { unique: true, name: "email_unique" });
safeIndex(db.users, { role: 1 },   { name: "role" });
safeIndex(db.users, { status: 1 }, { name: "status" });

// ═══════════════════════════════════════════════════════════════════════════════
// 2. devices
// ═══════════════════════════════════════════════════════════════════════════════
createCollection("devices", {
  $jsonSchema: {
    bsonType: "object",
    required: ["deviceId", "userId", "name", "activationCode"],
    properties: {
      deviceId:        { bsonType: "string" },
      userId:          { bsonType: "objectId" },
      name:            { bsonType: "string" },
      plantType:       { bsonType: "string" },
      firmwareVersion: { bsonType: "string" },
      wifiMAC:         { bsonType: "string" },
      isOnline:        { bsonType: "bool" },
      lastSeenAt:      { bsonType: "date" },
      activationCode:  { bsonType: "string" },
    },
  },
});

safeIndex(db.devices, { deviceId: 1 },        { unique: true, name: "deviceId_unique" });
safeIndex(db.devices, { userId: 1 },           { name: "userId" });
safeIndex(db.devices, { activationCode: 1 },   { unique: true, name: "activationCode_unique" });

// ═══════════════════════════════════════════════════════════════════════════════
// 3. sensorreadings
// ═══════════════════════════════════════════════════════════════════════════════
createCollection("sensorreadings", {
  $jsonSchema: {
    bsonType: "object",
    required: ["deviceId", "timestamp"],
    properties: {
      deviceId:     { bsonType: "string" },
      timestamp:    { bsonType: "date" },
      temp:         { bsonType: "double" },
      humi:         { bsonType: "double" },
      tds_ppm:      { bsonType: "double" },
      ph:           { bsonType: "double" },
      light_status: { bsonType: "bool" },
      water_level:  { bsonType: "double" },
    },
  },
});

// Compound index cho query chính
safeIndex(db.sensorreadings, 
  { deviceId: 1, timestamp: -1 },
  { name: "deviceId_timestamp" }
);

// TTL index: tự xóa sau 90 ngày (7.776.000 giây)
safeIndex(db.sensorreadings, 
  { timestamp: 1 },
  { expireAfterSeconds: 7776000, name: "ttl_90d" }
);

// ═══════════════════════════════════════════════════════════════════════════════
// 4. alerts
// ═══════════════════════════════════════════════════════════════════════════════
createCollection("alerts", {
  $jsonSchema: {
    bsonType: "object",
    required: ["deviceId", "type", "message"],
    properties: {
      deviceId:    { bsonType: "string" },
      userId:      { bsonType: "objectId" },
      type: {
        bsonType: "string",
        enum: [
          "tds_low", "tds_high",
          "ph_low", "ph_high",
          "temp_low", "temp_high",
          "water_low", "ai_disease", "device_offline",
        ],
      },
      severity:    { bsonType: "string", enum: ["info", "warning", "danger"] },
      message:     { bsonType: "string" },
      value:       { bsonType: "double" },
      threshold:   { bsonType: "double" },
      isRead:      { bsonType: "bool" },
      triggeredAt: { bsonType: "date" },
    },
  },
});

safeIndex(db.alerts, { deviceId: 1, triggeredAt: -1 }, { name: "deviceId_triggeredAt" });
safeIndex(db.alerts, { userId: 1, isRead: 1 },          { name: "userId_isRead" });
safeIndex(db.alerts, { isRead: 1 },                      { name: "isRead" });

// ═══════════════════════════════════════════════════════════════════════════════
// 5. aidiagnostics
// ═══════════════════════════════════════════════════════════════════════════════
createCollection("aidiagnostics", {
  $jsonSchema: {
    bsonType: "object",
    required: ["deviceId", "imageBase64", "status", "topConfidence"],
    properties: {
      deviceId:       { bsonType: "string" },
      capturedAt:     { bsonType: "date" },
      imageBase64:    { bsonType: "string" },
      status:         { bsonType: "string", enum: ["healthy", "warning", "danger"] },
      topDisease:     { bsonType: ["string", "null"] },
      topConfidence:  { bsonType: "double" },
      fusedDiagnosis: { bsonType: "string" },
      recommendation: { bsonType: "string" },
      aiModel:        { bsonType: "string" },
      processingMs:   { bsonType: "int" },
    },
  },
});

safeIndex(db.aidiagnostics, { deviceId: 1, capturedAt: -1 }, { name: "deviceId_capturedAt" });
safeIndex(db.aidiagnostics, { deviceId: 1, status: 1 },      { name: "deviceId_status" });

// ═══════════════════════════════════════════════════════════════════════════════
// 6. cameracaptures
// ═══════════════════════════════════════════════════════════════════════════════
createCollection("cameracaptures", {
  $jsonSchema: {
    bsonType: "object",
    required: ["deviceId", "imageBase64", "capturedAt"],
    properties: {
      deviceId:    { bsonType: "string" },
      imageBase64: { bsonType: "string" },
      capturedAt:  { bsonType: "date" },
    },
  },
});

safeIndex(db.cameracaptures, { deviceId: 1, capturedAt: -1 }, { name: "deviceId_capturedAt" });

// ═══════════════════════════════════════════════════════════════════════════════
// 7. orders
// ═══════════════════════════════════════════════════════════════════════════════
createCollection("orders", {
  $jsonSchema: {
    bsonType: "object",
    required: ["userId", "orderCode", "items", "totalAmount"],
    properties: {
      userId:      { bsonType: "objectId" },
      orderCode:   { bsonType: "string" },
      totalAmount: { bsonType: "double" },
      paymentMethod: { bsonType: "string", enum: ["cod", "banking"] },
      paymentStatus: { bsonType: "string", enum: ["pending", "paid", "failed"] },
      orderStatus: {
        bsonType: "string",
        enum: ["pending", "processing", "completed", "cancelled"],
      },
      deviceActivationCode: { bsonType: "string" },
    },
  },
});

safeIndex(db.orders, { userId: 1 },      { name: "userId" });
safeIndex(db.orders, { orderCode: 1 },   { unique: true, name: "orderCode_unique" });
safeIndex(db.orders, { orderStatus: 1 }, { name: "orderStatus" });

// ═══════════════════════════════════════════════════════════════════════════════
// 8. products
// ═══════════════════════════════════════════════════════════════════════════════
createCollection("products", {
  $jsonSchema: {
    bsonType: "object",
    required: ["slug", "name", "category", "price"],
    properties: {
      slug:     { bsonType: "string" },
      name:     { bsonType: "string" },
      category: { bsonType: "string", enum: ["seeds", "nutrients", "smart-pots"] },
      price:    { bsonType: "double" },
      stock:    { bsonType: "int" },
    },
  },
});

safeIndex(db.products, { slug: 1 },     { unique: true, name: "slug_unique" });
safeIndex(db.products, { category: 1 }, { name: "category" });
safeIndex(db.products, { tags: 1 },     { name: "tags" });

// ─── Done ─────────────────────────────────────────────────────────────────────
print(`\n✅ Done! Collections in ${DB_NAME}:`);
db.getCollectionNames().forEach(name => print(`   - ${name}`));
print("");
