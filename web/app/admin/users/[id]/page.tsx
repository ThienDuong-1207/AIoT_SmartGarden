import { notFound } from "next/navigation";
import { dbConnect } from "@/lib/mongodb";
import { requireAdminSession } from "@/lib/require-admin";
import UserModel from "@/models/User";
import DeviceModel from "@/models/Device";
import OrderModel from "@/models/Order";
import AdminUserActions from "@/components/admin/AdminUserActions";

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminSession();
  const { id } = await params;

  await dbConnect();

  const [user, devices, orders] = await Promise.all([
    UserModel.findById(id).lean(),
    DeviceModel.find({ userId: id }).sort({ createdAt: -1 }).lean(),
    OrderModel.find({ userId: id }).sort({ createdAt: -1 }).lean(),
  ]);

  if (!user) {
    notFound();
  }

  const userId = String(user._id);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Hồ sơ người dùng</h2>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Quản lý quyền, trạng thái và tài sản liên quan</p>
      </div>

      <section className="rounded-xl p-6" style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-elevated)" }}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Tên</p>
            <p className="mt-1 font-semibold" style={{ color: "var(--text-primary)" }}>{user.name}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Email</p>
            <p className="mt-1 font-semibold" style={{ color: "var(--text-primary)" }}>{user.email}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Role</p>
            <p className="mt-1 font-semibold" style={{ color: "var(--text-primary)" }}>{user.role}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Status</p>
            <p className="mt-1 font-semibold" style={{ color: "var(--text-primary)" }}>{user.status}</p>
          </div>
        </div>

        <div className="mt-6">
          <AdminUserActions
            userId={userId}
            currentRole={user.role}
            currentStatus={user.status}
          />
        </div>
      </section>

      <section className="rounded-xl p-6" style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-elevated)" }}>
        <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Danh sách chậu</h3>
        <div className="mt-4 space-y-3">
          {devices.map((device) => (
            <div key={String(device._id)} className="rounded-lg p-3 text-sm" style={{ border: "1px solid var(--border-subtle)" }}>
              <p className="font-medium" style={{ color: "var(--text-primary)" }}>{device.name || device.deviceId}</p>
              <p style={{ color: "var(--text-secondary)" }}>Device ID: {device.deviceId}</p>
            </div>
          ))}
          {devices.length === 0 && <p className="text-sm" style={{ color: "var(--text-muted)" }}>User chưa có thiết bị</p>}
        </div>
      </section>

      <section className="rounded-xl p-6" style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-elevated)" }}>
        <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Đơn hàng của user</h3>
        <div className="mt-4 space-y-3">
          {orders.map((order) => (
            <div key={String(order._id)} className="rounded-lg p-3 text-sm" style={{ border: "1px solid var(--border-subtle)" }}>
              <p className="font-medium" style={{ color: "var(--text-primary)" }}>Mã đơn: {order.orderCode}</p>
              <p style={{ color: "var(--text-secondary)" }}>Tổng tiền: {order.totalAmount.toLocaleString("vi-VN")}đ</p>
              <p style={{ color: "var(--text-secondary)" }}>Trạng thái: {order.orderStatus}</p>
            </div>
          ))}
          {orders.length === 0 && <p className="text-sm" style={{ color: "var(--text-muted)" }}>User chưa có đơn hàng</p>}
        </div>
      </section>
    </div>
  );
}
