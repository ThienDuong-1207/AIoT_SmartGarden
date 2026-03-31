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
    // Gọi nội bộ ingest logic — tránh HTTP overhead
    try {
      const data = JSON.parse(message);
      const { dbConnect } = await import("@/lib/mongodb");
      const DeviceModel = (await import("@/models/Device")).default;
      const SensorReadingModel = (await import("@/models/SensorReading")).default;

      await dbConnect();
      await SensorReadingModel.create({
        deviceId,
        timestamp:    new Date(),
        temp:         data.temperature ?? data.temp,
        humi:         data.humidity ?? data.humi,
        tds_ppm:      data.tds_ppm ?? data.tds,
        ph:           data.ph,
        light_status: data.light_status,
        water_level:  data.water_level,
        raw:          data,
      });
      await DeviceModel.updateOne({ deviceId }, { isOnline: true, lastSeenAt: new Date() });
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
