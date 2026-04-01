import mqtt, { type MqttClient } from "mqtt";

/*
  MQTT singleton cho Next.js server-side.
  Kết nối tới HiveMQ Cloud qua mqtts (TLS port 8883).

  Topics:
    garden/{deviceId}/sensors   — ESP32 gửi sensor data
    garden/{deviceId}/commands  — Server gửi lệnh điều khiển
    garden/{deviceId}/status    — ESP32 heartbeat online/offline
    garden/{deviceId}/camera    — ESP32 thông báo đã chụp ảnh xong
*/

declare global {
  var _mqttClient: MqttClient | undefined;
  var _mqttConnecting: boolean | undefined;
}

function getMqttOptions() {
  return {
    host:     process.env.MQTT_HOST ?? "broker.hivemq.com",
    port:     parseInt(process.env.MQTT_PORT ?? "8883"),
    protocol: "mqtts" as const,
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
    clientId: `smartgarden-server-${Math.random().toString(16).slice(2, 8)}`,
    reconnectPeriod: 5000,
    connectTimeout: 10000,
    keepalive: 60,
    rejectUnauthorized: true,
  };
}

export function getMqttClient(): MqttClient | null {
  // Không kết nối MQTT trong môi trường build / edge runtime
  if (typeof window !== "undefined") return null;
  if (!process.env.MQTT_HOST) return null;

  if (global._mqttClient?.connected) return global._mqttClient;

  // Tránh tạo nhiều connection trong hot-reload
  if (global._mqttConnecting) return global._mqttClient ?? null;

  global._mqttConnecting = true;

  try {
    const opts = getMqttOptions();
    const url  = `mqtts://${opts.host}:${opts.port}`;
    const client = mqtt.connect(url, opts);

    client.on("connect", () => {
      global._mqttConnecting = false;
      console.log("[mqtt] Connected to HiveMQ:", opts.host);

      // Subscribe tất cả garden topics
      client.subscribe("garden/#", { qos: 1 }, (err) => {
        if (err) console.error("[mqtt] Subscribe error:", err);
        else console.log("[mqtt] Subscribed to garden/#");
      });
    });

    client.on("message", (topic, message) => {
      handleMqttMessage(topic, message.toString()).catch((err) =>
        console.error("[mqtt] Message handler error:", err)
      );
    });

    client.on("error", (err) => {
      console.error("[mqtt] Connection error:", err.message);
      global._mqttConnecting = false;
    });

    client.on("offline", () => {
      console.warn("[mqtt] Client offline");
    });

    client.on("reconnect", () => {
      console.log("[mqtt] Reconnecting...");
    });

    global._mqttClient = client;
    return client;
  } catch (err) {
    console.error("[mqtt] Failed to create client:", err);
    global._mqttConnecting = false;
    return null;
  }
}

/*
  Publish command tới ESP32.
  garden/{deviceId}/commands
*/
export async function publishCommand(deviceId: string, payload: string): Promise<void> {
  const client = getMqttClient();
  if (!client) {
    throw new Error("MQTT client not available");
  }

  return new Promise((resolve, reject) => {
    const topic = `garden/${deviceId}/commands`;
    client.publish(topic, payload, { qos: 1, retain: false }, (err) => {
      if (err) reject(err);
      else {
        console.log(`[mqtt] Published to ${topic}:`, payload);
        resolve();
      }
    });
  });
}

/*
  Xử lý message nhận từ ESP32.
  Được gọi tự động từ client.on("message").
*/
async function handleMqttMessage(topic: string, message: string) {
  // Pattern: garden/{deviceId}/{type}
  const match = topic.match(/^garden\/([^/]+)\/(.+)$/);
  if (!match) return;

  const [, deviceId, type] = match;

  if (type === "sensors") {
    try {
      const data = JSON.parse(message);
      const { dbConnect } = await import("@/lib/mongodb");
      const DeviceModel        = (await import("@/models/Device")).default;
      const SensorReadingModel = (await import("@/models/SensorReading")).default;
      const AlertModel         = (await import("@/models/Alert")).default;
      const { sendNotification, alertToNotification } = await import("@/lib/sendNotification");

      await dbConnect();

      const ts = new Date();
      await SensorReadingModel.create({
        deviceId,
        timestamp:    ts,
        temp:         data.temperature ?? data.temp,
        humi:         data.humidity ?? data.humi,
        tds_ppm:      data.tds_ppm ?? data.tds,
        ph:           data.ph,
        light_status: data.light_status,
        water_level:  data.water_level,
        raw:          data,
      });

      const device = await DeviceModel.findOneAndUpdate(
        { deviceId },
        { isOnline: true, lastSeenAt: ts },
        { new: false } // trả về doc cũ để đọc config + userId
      );

      if (!device) return;
      const isPushMuted = !!(device.mutePushUntil && new Date(device.mutePushUntil).getTime() > ts.getTime());

      // Kiểm tra ngưỡng → tạo Alert + gửi FCM
      const thresholds = device.config?.alertThresholds ?? {};
      const alerts: Array<{ deviceId: string; userId: unknown; type: string; severity: string; message: string; value?: number; threshold?: number; triggeredAt: Date }> = [];

      const tds  = data.tds_ppm ?? data.tds;
      const ph   = data.ph;
      const temp = data.temperature ?? data.temp;
      const wl   = data.water_level;

      if (tds != null && thresholds.tds) {
        if (tds < thresholds.tds.min)
          alerts.push({ deviceId, userId: device.userId, type: "tds_low",  severity: "warning", message: `Low TDS: ${tds} ppm (min ${thresholds.tds.min} ppm)`, value: tds, threshold: thresholds.tds.min, triggeredAt: ts });
        else if (tds > thresholds.tds.max)
          alerts.push({ deviceId, userId: device.userId, type: "tds_high", severity: "warning", message: `High TDS: ${tds} ppm (max ${thresholds.tds.max} ppm)`, value: tds, threshold: thresholds.tds.max, triggeredAt: ts });
      }
      if (ph != null && thresholds.ph) {
        if (ph < thresholds.ph.min)
          alerts.push({ deviceId, userId: device.userId, type: "ph_low",  severity: "danger", message: `pH too low: ${ph} (min ${thresholds.ph.min})`, value: ph, threshold: thresholds.ph.min, triggeredAt: ts });
        else if (ph > thresholds.ph.max)
          alerts.push({ deviceId, userId: device.userId, type: "ph_high", severity: "danger", message: `pH too high: ${ph} (max ${thresholds.ph.max})`, value: ph, threshold: thresholds.ph.max, triggeredAt: ts });
      }
      if (temp != null && thresholds.temp) {
        if (temp < thresholds.temp.min)
          alerts.push({ deviceId, userId: device.userId, type: "temp_low",  severity: "warning", message: `Low temperature: ${temp}°C (min ${thresholds.temp.min}°C)`, value: temp, threshold: thresholds.temp.min, triggeredAt: ts });
        else if (temp > thresholds.temp.max)
          alerts.push({ deviceId, userId: device.userId, type: "temp_high", severity: "warning", message: `High temperature: ${temp}°C (max ${thresholds.temp.max}°C)`, value: temp, threshold: thresholds.temp.max, triggeredAt: ts });
      }
      if (wl != null && wl < 20)
        alerts.push({ deviceId, userId: device.userId, type: "water_low", severity: "danger", message: `Low water level: ${wl}% — refill immediately!`, value: wl, threshold: 20, triggeredAt: ts });

      if (alerts.length > 0) {
        await AlertModel.insertMany(alerts);
        if (!isPushMuted) {
          const deviceName = device.name ?? deviceId;
          const userId = device.userId?.toString();
          if (userId) {
            for (const alert of alerts) {
              sendNotification(userId, alertToNotification(alert.type, alert.message, deviceName)).catch(() => {});
            }
          }
        }
      }
    } catch (err) {
      console.error("[mqtt] Sensor ingest error:", err);
    }
  }

  if (type === "status") {
    try {
      const data = JSON.parse(message);
      const { dbConnect } = await import("@/lib/mongodb");
      const DeviceModel = (await import("@/models/Device")).default;
      await dbConnect();
      await DeviceModel.updateOne(
        { deviceId },
        { isOnline: data.online !== false, lastSeenAt: new Date() }
      );
    } catch (err) {
      console.error("[mqtt] Status update error:", err);
    }
  }
}
