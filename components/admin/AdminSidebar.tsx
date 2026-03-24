"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Package, ShoppingCart, Zap, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

const navigationItems = [
  { label: "Bảng điều khiển", href: "/admin", icon: LayoutDashboard },
  { label: "Người dùng", href: "/admin/users", icon: Users },
  { label: "Sản phẩm", href: "/admin/products", icon: Package },
  { label: "Đơn hàng", href: "/admin/orders", icon: ShoppingCart },
  { label: "Chẩn đoán AI", href: "/admin/diagnostics", icon: Zap },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="sticky top-0 hidden h-screen w-64 flex-col lg:flex"
      style={{ background: "var(--bg-elevated)", borderRight: "1px solid var(--border-subtle)" }}
    >
      <div className="p-6" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <Link href="/admin" className="flex items-center gap-2">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg"
            style={{ background: "linear-gradient(135deg, var(--emerald-500), var(--emerald-600))" }}
          >
            <span className="text-sm font-bold text-white">AG</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Smart Garden</span>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>Admin</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isRootAdminItem = item.href === "/admin";
          const isActive = isRootAdminItem
            ? pathname === "/admin"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition"
              style={{
                color: isActive ? "var(--emerald-400)" : "var(--text-secondary)",
                background: isActive ? "rgba(16,185,129,0.10)" : "transparent",
                border: `1px solid ${isActive ? "var(--border-emerald)" : "transparent"}`,
              }}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <button
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition"
          style={{ color: "var(--danger)", border: "1px solid rgba(239,68,68,0.25)" }}
        >
          <LogOut className="h-4 w-4" />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
