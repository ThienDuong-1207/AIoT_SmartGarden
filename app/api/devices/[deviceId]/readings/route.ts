import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import SensorReadingModel from "@/models/SensorReading";
import { authorizeDevice } from "@/lib/deviceAuth";

type Params = Promise<{ deviceId: string }>;

/*
  GET /api/devices/[deviceId]/readings?range=24h|7d|30d&limit=100
  Trả sensor history cho chart.
*/
export async function GET(req: NextRequest, { params }: { params: Params }) {
  try {
    const { deviceId } = await params;

    const auth = await authorizeDevice(req, deviceId);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(req.url);
    const range  = searchParams.get("range") ?? "24h";
    const limit  = Math.min(parseInt(searchParams.get("limit") ?? "100"), 500);

    const rangeMap: Record<string, number> = {
      "1h":  1,
      "24h": 24,
      "7d":  24 * 7,
      "30d": 24 * 30,
    };
    const hours = rangeMap[range] ?? 24;
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    await dbConnect();

    const readings = await SensorReadingModel
      .find({ deviceId, timestamp: { $gte: since } })
      .sort({ timestamp: 1 })
      .limit(limit)
      .select("-raw -__v")
      .lean();

    return NextResponse.json({ readings, count: readings.length, range });
  } catch (err) {
    console.error("[readings] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
