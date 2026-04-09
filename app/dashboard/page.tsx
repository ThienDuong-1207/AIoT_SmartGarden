import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import DeviceModel from "@/models/Device";
import { dbConnect } from "@/lib/mongodb";
import DeviceCard from "@/components/dashboard/DeviceCard";
import DashboardClient from "@/components/dashboard/DashboardClient";
import { ensureDefaultDevicesForUser, SHARED_DEVICE_IDS } from "@/lib/ensure-default-devices";

type DeviceView = {
  _id: string;
  deviceId: string;
  name: string;
  plantType: string;
  isOnline: boolean;
  lastSeenAt?: string | null;
  image?: string;
};

async function getDevices(userId: string): Promise<DeviceView[]> {
  try {
    await dbConnect();
    await ensureDefaultDevicesForUser(userId);

    const docs = await DeviceModel.find({
      $or: [{ userId }, { deviceId: { $in: SHARED_DEVICE_IDS } }],
    }).lean();

    const now = Date.now();
    const mapped = docs.map((d) => ({
      _id: String(d._id),
      deviceId: d.deviceId,
      name: d.name,
      plantType: d.plantType,
      isOnline: d.lastSeenAt
        ? now - new Date(d.lastSeenAt).getTime() < 5 * 60 * 1000
        : false,
      lastSeenAt: d.lastSeenAt ? new Date(d.lastSeenAt).toISOString() : null,
    }));
    return mapped;
  } catch {
    return [];
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const devices = userId ? await getDevices(userId) : [];
  const firstName = session?.user?.name?.split(" ").at(-1) ?? "there";

  return (
    <DashboardClient firstName={firstName} devices={devices}>
      {/* ── Device grid ── */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          Devices · {devices.length}
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {devices.map((device, i) => (
            <DeviceCard key={device._id} device={device} index={i} />
          ))}
        </div>
      </div>
    </DashboardClient>
  );
}
