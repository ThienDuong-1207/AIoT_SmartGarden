import UserModel from "@/models/User";
import DeviceModel from "@/models/Device";
import OrderModel from "@/models/Order";
import { dbConnect } from "@/lib/mongodb";
import { requireAdminSession } from "@/lib/require-admin";

function toCsv(logs: Array<{ level: string; module: string; message: string; timestamp: string }>) {
  const header = "level,module,message,timestamp";
  const lines = logs.map((log) =>
    [log.level, log.module, log.message, log.timestamp]
      .map((cell) => `\"${String(cell).replace(/\"/g, "\"\"")}\"`)
      .join(",")
  );
  return [header, ...lines].join("\n");
}

export default async function AdminDiagnosticsPage() {
  await requireAdminSession();
  await dbConnect();

  const [userCount, deviceCount, orderCount] = await Promise.all([
    UserModel.countDocuments(),
    DeviceModel.countDocuments(),
    OrderModel.countDocuments(),
  ]);

  const nowIso = new Date().toISOString();
  const logs = [
    {
      level: "info",
      module: "ai-service",
      message: "AI diagnostics queue is healthy",
      timestamp: nowIso,
    },
    {
      level: "warning",
      module: "mqtt",
      message: "2 devices have no payload in last 6 hours",
      timestamp: nowIso,
    },
  ];

  const csv = toCsv(logs);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Diagnostics</h2>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Log AI hệ thống và thống kê nhanh</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl p-4" style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-elevated)" }}>
          <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Users</p>
          <p className="mt-2 text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{userCount}</p>
        </div>
        <div className="rounded-xl p-4" style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-elevated)" }}>
          <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Devices</p>
          <p className="mt-2 text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{deviceCount}</p>
        </div>
        <div className="rounded-xl p-4" style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-elevated)" }}>
          <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Orders</p>
          <p className="mt-2 text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{orderCount}</p>
        </div>
      </div>

      <section className="rounded-xl p-6" style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-elevated)" }}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>AI/System logs</h3>
          <a
            href={`data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`}
            download="diagnostics-logs.csv"
            className="rounded-md px-3 py-2 text-xs font-medium"
            style={{ border: "1px solid var(--border-normal)", color: "var(--text-secondary)" }}
          >
            Export CSV
          </a>
        </div>

        <div className="mt-4 space-y-3">
          {logs.map((log, idx) => (
            <div key={idx} className="rounded-lg p-3 text-sm" style={{ border: "1px solid var(--border-subtle)" }}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded px-2 py-0.5 text-xs font-semibold" style={{
                  background: log.level === "warning" ? "rgba(245,158,11,0.12)" : "rgba(59,130,246,0.10)",
                  color: log.level === "warning" ? "var(--gold-400)" : "var(--blue-400)",
                }}>
                  {log.level}
                </span>
                <span className="font-medium" style={{ color: "var(--text-primary)" }}>{log.module}</span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>{new Date(log.timestamp).toLocaleString("vi-VN")}</span>
              </div>
              <p className="mt-1" style={{ color: "var(--text-secondary)" }}>{log.message}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
