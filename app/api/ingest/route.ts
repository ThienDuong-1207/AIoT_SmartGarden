import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import DeviceModel from "@/models/Device";
import SensorReadingModel from "@/models/SensorReading";
import AlertModel from "@/models/Alert";
import { sendNotification, alertToNotification } from "@/lib/sendNotification";

/*
  POST /api/ingest
  Nhận data từ ESP32 theo format:
  {
    "device_id": "sg-001",
    "token": "...",            // optional: activation code để xác thực
    "timestamp": 1234567890,   // Unix epoch (optional)
    "sensor_data": {
      "temperature": 24.3,
      "humidity": 68,
      "tds_ppm": 1150,
      "ph": 6.2,
      "light_status": true,
      "water_level": 85
    }
  }
*/

export async function POST(req: NextRequest) {
  try {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload. Use double quotes and remove comments/trailing commas." },
        { status: 400 }
      );
    }

    const deviceId: string = body.device_id ?? body.deviceId;
    if (!deviceId) {
      return NextResponse.json({ error: "device_id required" }, { status: 400 });
    }

    await dbConnect();

    // Tìm thiết bị
    const device = await DeviceModel.findOne({ deviceId });
    if (!device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    // Bắt buộc token (activation code) — lấy từ body hoặc Authorization header
    const headerToken = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
    const token = body.token ?? headerToken;

    if (!token) {
      return NextResponse.json({ error: "Token required" }, { status: 401 });
    }
    if (token !== device.activationCode) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const sd = body.sensor_data ?? {};
    const ts = body.timestamp ? new Date(body.timestamp * 1000) : new Date();
    const isPushMuted = !!(device.mutePushUntil && new Date(device.mutePushUntil).getTime() > ts.getTime());

    // Lưu SensorReading
    const reading = await SensorReadingModel.create({
      deviceId,
      timestamp:    ts,
      temp:         sd.temperature ?? sd.temp,
      humi:         sd.humidity ?? sd.humi,
      tds_ppm:      sd.tds_ppm ?? sd.tds,
      ph:           sd.ph,
      light_status: sd.light_status,
      water_level:  sd.water_level,
      raw:          body,
    });

    // Cập nhật Device online status
    await DeviceModel.updateOne(
      { deviceId },
      { isOnline: true, lastSeenAt: ts }
    );

    // Kiểm tra ngưỡng cảnh báo → tạo Alert
    const thresholds = device.config?.alertThresholds ?? {};
    const alerts: Array<{
      deviceId: string;
      userId: typeof device.userId;
      type: string;
      severity: string;
      message: string;
      value?: number;
      threshold?: number;
      triggeredAt: Date;
    }> = [];

    if (sd.tds_ppm != null && thresholds.tds) {
      if (sd.tds_ppm < thresholds.tds.min) {
        alerts.push({
          deviceId, userId: device.userId,
          type: "tds_low", severity: "warning",
          message: `Low TDS: ${sd.tds_ppm} ppm (minimum threshold: ${thresholds.tds.min} ppm)`,
          value: sd.tds_ppm, threshold: thresholds.tds.min, triggeredAt: ts,
        });
      } else if (sd.tds_ppm > thresholds.tds.max) {
        alerts.push({
          deviceId, userId: device.userId,
          type: "tds_high", severity: "warning",
          message: `High TDS: ${sd.tds_ppm} ppm (maximum threshold: ${thresholds.tds.max} ppm)`,
          value: sd.tds_ppm, threshold: thresholds.tds.max, triggeredAt: ts,
        });
      }
    }

    if (sd.ph != null && thresholds.ph) {
      if (sd.ph < thresholds.ph.min) {
        alerts.push({
          deviceId, userId: device.userId,
          type: "ph_low", severity: "danger",
          message: `pH too low: ${sd.ph} (minimum threshold: ${thresholds.ph.min})`,
          value: sd.ph, threshold: thresholds.ph.min, triggeredAt: ts,
        });
      } else if (sd.ph > thresholds.ph.max) {
        alerts.push({
          deviceId, userId: device.userId,
          type: "ph_high", severity: "danger",
          message: `pH too high: ${sd.ph} (maximum threshold: ${thresholds.ph.max})`,
          value: sd.ph, threshold: thresholds.ph.max, triggeredAt: ts,
        });
      }
    }

    if (sd.temperature != null && thresholds.temp) {
      if (sd.temperature < thresholds.temp.min) {
        alerts.push({
          deviceId, userId: device.userId,
          type: "temp_low", severity: "warning",
          message: `Low temperature: ${sd.temperature}°C (minimum threshold: ${thresholds.temp.min}°C)`,
          value: sd.temperature, threshold: thresholds.temp.min, triggeredAt: ts,
        });
      } else if (sd.temperature > thresholds.temp.max) {
        alerts.push({
          deviceId, userId: device.userId,
          type: "temp_high", severity: "warning",
          message: `High temperature: ${sd.temperature}°C (maximum threshold: ${thresholds.temp.max}°C)`,
          value: sd.temperature, threshold: thresholds.temp.max, triggeredAt: ts,
        });
      }
    }

    if (sd.water_level != null && sd.water_level < 20) {
      alerts.push({
        deviceId, userId: device.userId,
        type: "water_low", severity: "danger",
        message: `Low water level: ${sd.water_level}% — refill immediately!`,
        value: sd.water_level, threshold: 20, triggeredAt: ts,
      });
    }

    if (alerts.length > 0) {
      await AlertModel.insertMany(alerts);

      // Gửi FCM push notification cho từng alert (fire-and-forget, không block response)
      if (!isPushMuted) {
        const deviceName = device.name ?? deviceId;
        const userId = device.userId?.toString();
        if (userId) {
          for (const alert of alerts) {
            sendNotification(
              userId,
              alertToNotification(alert.type, alert.message, deviceName)
            ).catch(() => {});
          }
        }
      }
    }

    return NextResponse.json({
      ok: true,
      readingId: reading._id,
      alertsCreated: alerts.length,
      timestamp: ts,
    });
  } catch (err) {
    console.error("[ingest] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
