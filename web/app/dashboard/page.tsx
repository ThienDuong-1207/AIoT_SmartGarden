import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import DeviceModel from "@/models/Device";
import { dbConnect } from "@/lib/mongodb";
import DeviceCard from "@/components/dashboard/DeviceCard";
import { Cpu, Wifi, WifiOff, Plus, Activity } from "lucide-react";

type DeviceView = {
  _id: string;
  deviceId: string;
  name: string;
  plantType: string;
  isOnline: boolean;
  image?: string;
};

const MOCK_DEVICES: DeviceView[] = [
  { _id: "mock-1", deviceId: "SGP-2024-001", name: "Chậu Húng Quế",   plantType: "Húng quế", isOnline: true,  image: "/images/chaucay.webp" },
  { _id: "mock-2", deviceId: "SGP-2024-002", name: "Rau Cải Nhà Bếp", plantType: "Cải xanh", isOnline: true,  image: "/images/chau1.png"    },
  { _id: "mock-3", deviceId: "SGP-2024-003", name: "Chậu Dâu Tây",    plantType: "Dâu tây",  isOnline: false, image: "/images/chau2.png"    },
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

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId  = session?.user?.id;
  const devices = userId ? await getDevices(userId) : [];

  const onlineCount  = devices.filter((d) => d.isOnline).length;
  const offlineCount = devices.length - onlineCount;

  return (
    <section className="animate-fade-up space-y-8">

      {/* ── Page heading ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p
            className="mb-1.5 font-mono text-xs font-semibold uppercase tracking-[0.15em]"
            style={{ color: "var(--emerald-500)" }}
          >
            // DEVICE GRID
          </p>
          <h1
            className="text-3xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Chậu cây của bạn
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            Chọn thiết bị để theo dõi metrics, camera và cảnh báo AI.
          </p>
        </div>

        {/* Add device button */}
        <button
          className="btn-ghost shrink-0 gap-2 text-sm"
          title="Thêm thiết bị bằng activation code"
        >
          <Plus size={15} />
          Thêm thiết bị
        </button>
      </div>

      {/* ── Summary stats bar ── */}
      {devices.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              icon: Cpu,
              label: "Tổng thiết bị",
              value: devices.length,
              color: "var(--text-primary)",
              iconColor: "var(--text-secondary)",
            },
            {
              icon: Wifi,
              label: "Đang online",
              value: onlineCount,
              color: "var(--emerald-400)",
              iconColor: "var(--emerald-500)",
            },
            {
              icon: WifiOff,
              label: "Offline",
              value: offlineCount,
              color: offlineCount > 0 ? "#F87171" : "var(--text-muted)",
              iconColor: offlineCount > 0 ? "#EF4444" : "var(--text-muted)",
            },
            {
              icon: Activity,
              label: "Uptime",
              value: devices.length > 0 ? `${Math.round((onlineCount / devices.length) * 100)}%` : "—",
              color: "var(--gold-400)",
              iconColor: "var(--gold-500)",
            },
          ].map(({ icon: Icon, label, value, color, iconColor }) => (
            <div key={label} className="stat-card flex items-center gap-3">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{ background: "rgba(255,255,255,0.04)", color: iconColor }}
              >
                <Icon size={16} />
              </div>
              <div>
                <p className="text-xl font-black" style={{ color }}>
                  {value}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {label}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Device cards grid ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {devices.length === 0 ? (
          /* Empty state */
          <div
            className="col-span-full flex flex-col items-center justify-center rounded-2xl py-20 text-center"
            style={{
              background: "var(--bg-elevated)",
              border: "1px dashed var(--border-normal)",
            }}
          >
            <div
              className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{ background: "rgba(16,185,129,0.08)", color: "var(--emerald-400)" }}
            >
              <Cpu size={28} />
            </div>
            <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
              Chưa có thiết bị nào
            </p>
            <p
              className="mt-2 max-w-xs text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              Dùng activation code để liên kết Smart Pot với tài khoản của bạn.
            </p>
            <p
              className="mt-4 rounded-lg px-4 py-2 font-mono text-xs"
              style={{
                background: "var(--bg-overlay)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-muted)",
              }}
            >
              {">"} POST /api/devices · {"{"} activationCode {"}"}
            </p>
          </div>
        ) : (
          devices.map((device, i) => (
            <DeviceCard key={device._id} device={device} index={i} />
          ))
        )}
      </div>
    </section>
  );
}
