import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import DeviceModel from "@/models/Device";

/*
  POST /api/devices/sync-online
  Syncs isOnline flag from lastSeenAt using a 5-minute timeout window.

  Optional protection:
  - Set CRON_SECRET in env
  - Call with header: x-cron-secret: <CRON_SECRET>
*/
export async function POST(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const providedSecret = req.headers.get("x-cron-secret");

  if (cronSecret && providedSecret !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const cutoff = new Date(Date.now() - 5 * 60 * 1000);

  const [onlineResult, offlineResult] = await Promise.all([
    DeviceModel.updateMany(
      { lastSeenAt: { $gte: cutoff } },
      { $set: { isOnline: true } }
    ),
    DeviceModel.updateMany(
      {
        $or: [
          { lastSeenAt: { $lt: cutoff } },
          { lastSeenAt: { $exists: false } },
          { lastSeenAt: null },
        ],
      },
      { $set: { isOnline: false } }
    ),
  ]);

  return NextResponse.json({
    ok: true,
    cutoff,
    setOnline: onlineResult.modifiedCount,
    setOffline: offlineResult.modifiedCount,
  });
}
