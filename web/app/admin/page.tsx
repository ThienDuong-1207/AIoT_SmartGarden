import Link from "next/link";
import { Users, Cpu, Package, ShieldAlert, Activity, ArrowRight } from "lucide-react";
import UserModel from "@/models/User";
import DeviceModel from "@/models/Device";
import OrderModel from "@/models/Order";
import { dbConnect } from "@/lib/mongodb";
import { requireAdminSession } from "@/lib/require-admin";

export default async function AdminPage() {
  await requireAdminSession();
  await dbConnect();

  const [users, devices, orders] = await Promise.all([
    UserModel.countDocuments(),
    DeviceModel.countDocuments(),
    OrderModel.countDocuments(),
  ]);

  const stats = [
    { icon: Users, label: "Tổng users", value: String(users), color: "var(--blue-400)", bg: "rgba(59,130,246,0.10)" },
    { icon: Cpu, label: "Thiết bị", value: String(devices), color: "var(--emerald-400)", bg: "rgba(16,185,129,0.10)" },
    { icon: Package, label: "Đơn hàng", value: String(orders), color: "var(--gold-400)", bg: "rgba(245,158,11,0.10)" },
    { icon: ShieldAlert, label: "Cảnh báo hệ thống", value: "0", color: "#F87171", bg: "rgba(239,68,68,0.10)" },
  ];

  const modules = [
    { label: "Quản lý Users", href: "/admin/users", desc: "Xem danh sách, role, ban/unban, hồ sơ chi tiết" },
    { label: "Quản lý Orders", href: "/admin/orders", desc: "Theo dõi đơn hàng và cập nhật trạng thái nhanh" },
    { label: "Quản lý Products", href: "/admin/products", desc: "Xem catalog và xóa/chỉnh sửa sản phẩm" },
    { label: "Diagnostics", href: "/admin/diagnostics", desc: "Theo dõi log AI/system và export CSV" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-1.5 font-mono text-xs font-semibold uppercase tracking-[0.15em]" style={{ color: "var(--emerald-500)" }}>
          {"// ADMIN CONSOLE"}
        </p>
        <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
          Admin Dashboard
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Quản trị users, đơn hàng, sản phẩm và giám sát hệ thống.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="stat-card flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: bg, color }}>
              <Icon size={18} />
            </div>
            <div>
              <p className="text-2xl font-black" style={{ color }}>{value}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div
        className="flex items-center gap-4 rounded-2xl px-6 py-4"
        style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.16)" }}
      >
        <Activity size={18} style={{ color: "var(--emerald-500)" }} />
        <div className="flex-1">
          <p className="text-sm font-semibold" style={{ color: "var(--emerald-400)" }}>
            Hệ thống đang hoạt động bình thường
          </p>
          <p className="mt-0.5 font-mono text-xs" style={{ color: "var(--text-muted)" }}>
            MongoDB Atlas · HiveMQ MQTT · Vercel · Cloudinary
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {modules.map((module) => (
          <Link
            key={module.href}
            href={module.href}
            className="dark-card flex flex-col gap-3 p-5 transition-transform hover:-translate-y-0.5"
          >
            <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{module.label}</p>
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{module.desc}</p>
            <span className="mt-auto inline-flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--emerald-400)" }}>
              Mở module
              <ArrowRight size={13} />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
