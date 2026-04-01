import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import SensorReadingModel from "@/models/SensorReading";
import { authorizeDevice } from "@/lib/deviceAuth";

type Params = Promise<{ deviceId: string }>;

/*
  GET /api/devices/[deviceId]/readings?range=6h|24h|7d|30d&limit=100
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
      "6h":  6,
      "24h": 24,
      "7d":  24 * 7,
      "30d": 24 * 30,
    };
    const hours = rangeMap[range] ?? 24;
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    await dbConnect();

    const readings = await SensorReadingModel
      .find({
        deviceId,
        $or: [
          { timestamp: { $gte: since } },
          { createdAt: { $gte: since } },
        ],
      })
      .sort({ timestamp: 1, createdAt: 1 })
      .limit(limit)
      .select("-raw -__v")
      .lean();

    const toFiniteOrUndefined = (v: unknown) => {
      const n = typeof v === "number" ? v : Number(v);
      return Number.isFinite(n) ? n : undefined;
    };

    type NormalizedReading = Record<string, unknown> & {
      timestamp: string;
      temp: number | undefined;
      humi: number | undefined;
      tds_ppm: number | undefined;
      ph: number | undefined;
    };

    const normalized: NormalizedReading[] = [];
    for (const item of readings) {
      const r = item as Record<string, unknown>;
      const tsRaw = r.timestamp ?? r.createdAt;
      const ts = tsRaw ? new Date(String(tsRaw)) : null;
      if (!ts || Number.isNaN(ts.getTime())) continue;

      normalized.push({
        ...r,
        timestamp: ts.toISOString(),
        temp: toFiniteOrUndefined(r.temp),
        humi: toFiniteOrUndefined(r.humi ?? r.hum ?? r.humidity),
        tds_ppm: toFiniteOrUndefined(r.tds_ppm ?? r.tds),
        ph: toFiniteOrUndefined(r.ph),
      });
    }

    normalized.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return NextResponse.json({ readings: normalized, count: normalized.length, range });
  } catch (err) {
    console.error("[readings] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
