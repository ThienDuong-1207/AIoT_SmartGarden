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

const MOCK_DEVICES: DeviceView[] = [
  { _id: "mock-1", deviceId: "SGP-2024-001", name: "Basil Pot", plantType: "Basil", isOnline: true, image: "/images/chaucay.webp" },
  { _id: "mock-2", deviceId: "SGP-2024-002", name: "Kitchen Greens", plantType: "Mustard green", isOnline: true, image: "/images/chau1.png" },
  { _id: "mock-3", deviceId: "SGP-2024-003", name: "Strawberry Pot", plantType: "Strawberry", isOnline: false, image: "/images/chau2.png" },
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
    return mapped.length ? mapped : MOCK_DEVICES;
  } catch {
    return MOCK_DEVICES;
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
  const devices = userId ? await getDevices(userId) : MOCK_DEVICES;
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
          <div
            className="flex flex-col items-center justify-center rounded-2xl py-20 text-center"
            style={{ background: "var(--bg-elevated)", border: "1px dashed var(--border-normal)" }}
          >
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "rgba(16,185,129,0.08)" }}>
              <Cpu size={24} style={{ color: "var(--emerald-400)" }} />
            </div>
            <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
              No devices yet
            </p>
            <p className="mt-2 max-w-xs text-sm" style={{ color: "var(--text-muted)" }}>
              Use an activation code to link your Smart Pot to your account.
            </p>
            <p
              className="mt-4 rounded-lg px-4 py-2 font-mono text-xs"
              style={{ background: "var(--bg-base)", border: "1px solid var(--border-subtle)", color: "var(--text-muted)" }}
            >
              {">"} POST /api/devices · {"{"} activationCode {"}"}
            </p>
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
