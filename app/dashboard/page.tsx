import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import DeviceModel from "@/models/Device";
import { dbConnect } from "@/lib/mongodb";
import DeviceCard from "@/components/dashboard/DeviceCard";
import DashboardClient from "@/components/dashboard/DashboardClient";
import { Cpu } from "lucide-react";

type DeviceView = {
  _id: string;
  deviceId: string;
  name: string;
  plantType: string;
  isOnline: boolean;
  lastSeenAt?: string | null;
  image?: string;
};

const SAMPLE_DEVICES: DeviceView[] = [
  {
    _id: "demo-1",
    deviceId: "SG-DEMO-001",
    name: "Demo Basil Pot",
    plantType: "Basil",
    isOnline: false,
    image: "/images/chaucay.webp",
  },
  {
    _id: "demo-2",
    deviceId: "SG-DEMO-002",
    name: "Demo Lettuce Pot",
    plantType: "Lettuce",
    isOnline: false,
    image: "/images/chau1.png",
  },
];

async function getDevices(userId: string): Promise<DeviceView[]> {
  try {
    await dbConnect();
    const docs = await DeviceModel.find({ userId }).lean();
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

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const devices = userId ? await getDevices(userId) : [];
  const firstName = session?.user?.name?.split(" ").at(-1) ?? "there";
  const greeting = getGreeting();

  return (
    <DashboardClient greeting={greeting} firstName={firstName} devices={devices}>
      {/* ── Device grid ── */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          Devices · {devices.length}
        </p>

        {devices.length === 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SAMPLE_DEVICES.map((device, i) => (
              <DeviceCard key={device._id} device={device} index={i} />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {devices.map((device, i) => (
              <DeviceCard key={device._id} device={device} index={i} />
            ))}
          </div>
        )}
      </div>
    </DashboardClient>
  );
}
