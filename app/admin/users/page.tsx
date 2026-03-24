import Link from "next/link";
import { dbConnect } from "@/lib/mongodb";
import UserModel from "@/models/User";
import { requireAdminSession } from "@/lib/require-admin";

export default async function AdminUsersPage() {
  await requireAdminSession();
  await dbConnect();

  const users = await UserModel.find({})
    .select("name email role status provider createdAt")
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Quản lý người dùng</h2>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Danh sách user, role, trạng thái tài khoản</p>
      </div>

      <div className="overflow-hidden rounded-xl" style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-elevated)" }}>
        <table className="min-w-full text-sm">
          <thead style={{ background: "var(--bg-overlay)", borderBottom: "1px solid var(--border-subtle)" }}>
            <tr>
              <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-secondary)" }}>Họ tên</th>
              <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-secondary)" }}>Email</th>
              <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-secondary)" }}>Role</th>
              <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-secondary)" }}>Status</th>
              <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-secondary)" }}>Provider</th>
              <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-secondary)" }}>Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const id = String(user._id);
              return (
                <tr key={id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td className="px-4 py-3 font-medium" style={{ color: "var(--text-primary)" }}>{user.name}</td>
                  <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{user.email}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full px-2 py-1 text-xs font-semibold" style={{
                      background: user.role === "admin" ? "rgba(245,158,11,0.12)" : "rgba(255,255,255,0.06)",
                      color: user.role === "admin" ? "var(--gold-400)" : "var(--text-secondary)",
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full px-2 py-1 text-xs font-semibold" style={{
                      background: user.status === "active" ? "rgba(16,185,129,0.10)" : "rgba(239,68,68,0.10)",
                      color: user.status === "active" ? "var(--emerald-400)" : "var(--danger)",
                    }}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{user.provider || "google"}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/users/${id}`} className="text-sm font-medium" style={{ color: "var(--emerald-400)" }}>
                      Xem hồ sơ
                    </Link>
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center" style={{ color: "var(--text-muted)" }} colSpan={6}>
                  Chưa có user nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
