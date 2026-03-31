import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import SensorReadingModel from "@/models/SensorReading";
import DeviceModel from "@/models/Device";
import AlertModel from "@/models/Alert";
import { authorizeDevice } from "@/lib/deviceAuth";

type Params = Promise<{ deviceId: string }>;

/*
  GET /api/devices/[deviceId]/latest
  Trả reading mới nhất + thông tin online + alert count cho Overview page.
*/
export async function GET(req: NextRequest, { params }: { params: Params }) {
  try {
    const { deviceId } = await params;

    const auth = await authorizeDevice(req, deviceId);
    if (auth.error) return auth.error;

    await dbConnect();

    const [latest, device, unreadAlerts] = await Promise.all([
      SensorReadingModel
        .findOne({ deviceId })
        .sort({ timestamp: -1 })
        .select("-raw -__v")
        .lean(),
      DeviceModel
        .findOne({ deviceId })
        .select("isOnline lastSeenAt config name plantType")
        .lean(),
      AlertModel.countDocuments({ deviceId, isRead: false }),
    ]);

    if (!device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    // Kiểm tra offline: không gửi data trong 5 phút
    const isOnline = device.lastSeenAt
      ? Date.now() - new Date(device.lastSeenAt).getTime() < 5 * 60 * 1000
      : false;

    return NextResponse.json({
      reading: latest ?? null,
      device: {
        isOnline,
        lastSeenAt: device.lastSeenAt,
        name: device.name,
        plantType: device.plantType,
        thresholds: device.config?.alertThresholds,
      },
      unreadAlerts,
    });
  } catch (err) {
    console.error("[latest] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
