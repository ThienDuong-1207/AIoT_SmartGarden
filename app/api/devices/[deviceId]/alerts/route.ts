import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import AlertModel from "@/models/Alert";
import { authorizeDevice } from "@/lib/deviceAuth";

type Params = Promise<{ deviceId: string }>;

/* GET /api/devices/[deviceId]/alerts?limit=10&unread=true */
export async function GET(req: NextRequest, { params }: { params: Params }) {
  try {
    const { deviceId } = await params;

    const auth = await authorizeDevice(req, deviceId);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(req.url);
    const limit  = Math.min(parseInt(searchParams.get("limit") ?? "20"), 100);
    const unread = searchParams.get("unread") === "true";

    await dbConnect();

    const query: Record<string, unknown> = { deviceId };
    if (unread) query.isRead = false;

    const alerts = await AlertModel
      .find(query)
      .sort({ triggeredAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ alerts, count: alerts.length });
  } catch (err) {
    console.error("[alerts] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/* PATCH /api/devices/[deviceId]/alerts  → mark all as read */
export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  try {
    const { deviceId } = await params;

    const auth = await authorizeDevice(req, deviceId);
    if (auth.error) return auth.error;

    await dbConnect();
    const result = await AlertModel.updateMany({ deviceId, isRead: false }, { isRead: true });
    return NextResponse.json({ ok: true, updated: result.modifiedCount });
  } catch (err) {
    console.error("[alerts patch] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
