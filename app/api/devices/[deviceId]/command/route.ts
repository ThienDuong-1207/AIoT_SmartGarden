import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import DeviceModel from "@/models/Device";
import { publishCommand } from "@/lib/mqtt";
import { authorizeDevice } from "@/lib/deviceAuth";

type Params = Promise<{ deviceId: string }>;

const VALID_COMMANDS = [
  "pump_on", "pump_off",
  "light_on", "light_off",
  "capture_now",
  "reboot",
] as const;

type Command = (typeof VALID_COMMANDS)[number];

/*
  POST /api/devices/[deviceId]/command
  body: { command: "pump_on" | "pump_off" | "light_on" | "light_off" | "capture_now" }
  → publish tới MQTT topic: garden/{deviceId}/commands
*/
export async function POST(req: NextRequest, { params }: { params: Params }) {
  try {
    const { deviceId } = await params;

    const auth = await authorizeDevice(req, deviceId);
    if (auth.error) return auth.error;

    const {
      command,
      suppressPushMs,
    }: { command: Command; suppressPushMs?: number } = await req.json();

    if (!VALID_COMMANDS.includes(command)) {
      return NextResponse.json(
        { error: `Invalid command. Valid: ${VALID_COMMANDS.join(", ")}` },
        { status: 400 }
      );
    }

    await dbConnect();

    const device = await DeviceModel.findOne({ deviceId }).lean();
    if (!device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    const sentAt = new Date();
    const payload = JSON.stringify({ command, sentAt: sentAt.toISOString() });

    // Optional: mute push notifications for a short window (used by AI Lab manual capture)
    if (command === "capture_now" && suppressPushMs && suppressPushMs > 0) {
      const muteUntil = new Date(sentAt.getTime() + Math.min(suppressPushMs, 5 * 60 * 1000));
      await DeviceModel.updateOne({ deviceId }, { $set: { mutePushUntil: muteUntil } });
    }

    // Publish MQTT (non-blocking — nếu MQTT chưa kết nối thì log lỗi nhẹ)
    try {
      await publishCommand(deviceId, payload);
    } catch (mqttErr) {
      console.warn("[command] MQTT publish failed (device may be offline):", mqttErr);
      // Vẫn trả success vì lệnh đã được ghi nhận
    }

    return NextResponse.json({ ok: true, command, deviceId, sentAt });
  } catch (err) {
    console.error("[command] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
