import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import DeviceModel from "@/models/Device";
import { dbConnect } from "@/lib/mongodb";
import DeviceCard from "@/components/dashboard/DeviceCard";
import { Cpu, Wifi, WifiOff, Plus, Activity, Leaf } from "lucide-react";

type DeviceView = {
  _id: string;
  deviceId: string;
  name: string;
  plantType: string;
  isOnline: boolean;
  image?: string;
};

const MOCK_DEVICES: DeviceView[] = [
  { _id: "mock-1", deviceId: "SGP-2024-001", name: "Basil Pot",      plantType: "Basil",       isOnline: true,  image: "/images/chaucay.webp" },
  { _id: "mock-2", deviceId: "SGP-2024-002", name: "Kitchen Greens", plantType: "Mustard green", isOnline: true,  image: "/images/chau1.png"    },
  { _id: "mock-3", deviceId: "SGP-2024-003", name: "Strawberry Pot", plantType: "Strawberry",  isOnline: false, image: "/images/chau2.png"    },
];

async function getDevices(userId: string): Promise<DeviceView[]> {
  try {
    await dbConnect();
    const docs = await DeviceModel.find({ userId }).lean();
    const mapped = docs.map((d) => ({
      _id:       String(d._id),
      deviceId:  d.deviceId,
      name:      d.name,
      plantType: d.plantType,
      isOnline:  Boolean(d.isOnline),
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
  const userId  = session?.user?.id;
  const devices = userId ? await getDevices(userId) : MOCK_DEVICES;
  const firstName = session?.user?.name?.split(" ").at(-1) ?? "there";

  const onlineCount  = devices.filter((d) => d.isOnline).length;
  const offlineCount = devices.length - onlineCount;
  const uptimePct    = devices.length > 0 ? Math.round((onlineCount / devices.length) * 100) : 0;

  return (
    <section className="animate-fade-up space-y-6">

      {/* ── Greeting header ── */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{ background: "linear-gradient(135deg, var(--emerald-500), var(--emerald-600))" }}
            >
              <Leaf size={13} color="#fff" />
            </div>
            <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
              {getGreeting()},&nbsp;
              <span style={{ color: "var(--text-primary)" }}>{firstName}</span>
            </p>
          </div>
          <h1 className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>
            Your Garden
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            {onlineCount}/{devices.length} devices online
          </p>
        </div>

        <button
          className="btn-ghost shrink-0 gap-2 text-sm"
          title="Add device with activation code"
        >
          <Plus size={14} />
          Add Device
        </button>
      </div>

      {/* ── Stats row ── */}
      {devices.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { icon: Cpu,     label: "Total Devices", value: devices.length, color: "var(--text-primary)",  iconBg: "rgba(255,255,255,0.06)" },
            { icon: Wifi,    label: "Online",          value: onlineCount,    color: "var(--emerald-400)",   iconBg: "rgba(16,185,129,0.10)"  },
            { icon: WifiOff, label: "Offline",          value: offlineCount,   color: offlineCount > 0 ? "#F87171" : "var(--text-muted)", iconBg: offlineCount > 0 ? "rgba(239,68,68,0.10)" : "rgba(255,255,255,0.04)" },
            { icon: Activity, label: "Uptime",          value: `${uptimePct}%`, color: "var(--gold-400)",   iconBg: "rgba(245,158,11,0.10)"  },
          ].map(({ icon: Icon, label, value, color, iconBg }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-xl p-4"
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: iconBg }}>
                <Icon size={15} style={{ color }} />
              </div>
              <div>
                <p className="text-xl font-black leading-tight" style={{ color }}>{value}</p>
                <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

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
            <p className="font-semibold" style={{ color: "var(--text-primary)" }}>No devices yet</p>
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
    </section>
  );
}
