import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { dbConnect } from "@/lib/mongodb";
import DeviceModel from "@/models/Device";
import UserModel from "@/models/User";
import { getMqttClient } from "@/lib/mqtt";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ deviceId: string }> }
) {
  try {
    const { deviceId } = await params;

    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const user = await UserModel.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const device = await DeviceModel.findOne({ deviceId, userId: user._id });
    if (!device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    const cfg: any = device.config || {};
    cfg.pump ??= { status: false, schedule: [], activationCount: 0 };
    cfg.light ??= { status: false, brightness: 100, schedule: [] };
    cfg.watering ??= { autoMode: false, intervalHours: 6, schedule: [] };
    cfg.sensor ??= { calibrationMode: false, calibratingType: null };
    cfg.operationEvents ??= [];

    const body = await req.json();
    const { pump, light, watering, sensor } = body;
    let calibrationCommand: { action: "start" | "cancel" | "complete"; sensorType: "TDS" | "pH" } | null = null;
    const newEvents: Array<{ type: string; timestamp: Date; meta?: Record<string, unknown> }> = [];

    // Update pump config
    if (pump !== undefined) {
      const prevPumpStatus = !!cfg.pump.status;
      if (pump.status !== undefined) cfg.pump.status = pump.status;
      if (pump.schedule !== undefined) cfg.pump.schedule = pump.schedule;
      if (pump.status === true) {
        cfg.pump.lastActivated = new Date();
        cfg.pump.activationCount = (cfg.pump.activationCount || 0) + 1;
      }
      if (pump.status !== undefined && prevPumpStatus !== !!pump.status) {
        newEvents.push({ type: pump.status ? "pump_on" : "pump_off", timestamp: new Date() });
      }
    }

    // Update light config
    if (light !== undefined) {
      const prevLightStatus = !!cfg.light.status;
      if (light.status !== undefined) cfg.light.status = light.status;
      if (light.brightness !== undefined) cfg.light.brightness = Math.max(0, Math.min(100, light.brightness));
      if (light.schedule !== undefined) cfg.light.schedule = light.schedule;
      if (light.status !== undefined && prevLightStatus !== !!light.status) {
        newEvents.push({ type: light.status ? "light_on" : "light_off", timestamp: new Date() });
      }
      if (light.schedule !== undefined) {
        newEvents.push({ type: "light_preset_changed", timestamp: new Date(), meta: { scheduleCount: Array.isArray(light.schedule) ? light.schedule.length : 0 } });
      }
    }

    // Update watering config
    if (watering !== undefined) {
      if (watering.autoMode !== undefined) cfg.watering.autoMode = watering.autoMode;
      if (watering.intervalHours !== undefined) {
        cfg.watering.intervalHours = Math.max(1, Math.min(24, Number(watering.intervalHours) || 1));
      }
      if (watering.schedule !== undefined) cfg.watering.schedule = watering.schedule;
    }

    // Update sensor calibration config
    if (sensor !== undefined) {
      if (sensor.calibrationMode !== undefined) cfg.sensor.calibrationMode = sensor.calibrationMode;
      if (sensor.calibratingType !== undefined) cfg.sensor.calibratingType = sensor.calibratingType;
      if (sensor.command?.action && sensor.command?.sensorType) {
        calibrationCommand = {
          action: sensor.command.action,
          sensorType: sensor.command.sensorType,
        };
        if (sensor.command.action === "start") {
          newEvents.push({ type: "calibration_start", timestamp: new Date(), meta: { sensorType: sensor.command.sensorType } });
        }
        if (sensor.command.action === "complete") {
          newEvents.push({ type: "calibration_complete", timestamp: new Date(), meta: { sensorType: sensor.command.sensorType } });
        }
      }
      if (sensor.calibrationMode === false && sensor.calibratingType === null) {
        cfg.sensor.lastCalibrated = new Date();
      }
    }

    if (newEvents.length > 0) {
      cfg.operationEvents = [...cfg.operationEvents, ...newEvents].slice(-200);
    }

    device.config = cfg;
    await device.save();

    // Publish MQTT command to ESP32
    const mqttClient = getMqttClient();
    if (mqttClient) {
      const command = {
        pump: cfg.pump,
        light: cfg.light,
        watering: cfg.watering,
        sensor: cfg.sensor,
        calibrationCommand,
        timestamp: new Date().toISOString(),
      };
      mqttClient.publish(
        `garden/${deviceId}/commands`,
        JSON.stringify(command),
        { qos: 1 }
      );
    }

    return NextResponse.json({
      success: true,
      device: {
        deviceId: device.deviceId,
        config: cfg,
      },
    });
  } catch (error) {
    console.error("[PATCH /api/devices/:deviceId/config]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update device config" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ deviceId: string }> }
) {
  try {
    const { deviceId } = await params;

    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const user = await UserModel.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const device = await DeviceModel.findOne({ deviceId, userId: user._id });
    if (!device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    const cfg: any = device.config || {};
    cfg.pump ??= { status: false, schedule: [], activationCount: 0 };
    cfg.light ??= { status: false, brightness: 100, schedule: [] };
    cfg.watering ??= { autoMode: false, intervalHours: 6, schedule: [] };
    cfg.sensor ??= { calibrationMode: false, calibratingType: null };
    cfg.operationEvents ??= [];

    device.config = cfg;
    await device.save();

    return NextResponse.json({
      success: true,
      config: cfg,
    });
  } catch (error) {
    console.error("[GET /api/devices/:deviceId/config]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch device config" },
      { status: 500 }
    );
  }
}
