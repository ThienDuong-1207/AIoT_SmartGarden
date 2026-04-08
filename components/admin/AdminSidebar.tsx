"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Package, ShoppingCart, Zap, LogOut, X } from "lucide-react";
import { signOut } from "next-auth/react";

const navigationItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "AI Diagnostics", href: "/admin/diagnostics", icon: Zap },
];

interface AdminSidebarProps {
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ isMobile = false, isOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const sidebarContent = (
    <>
      <div className="p-6" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <div className="flex items-center justify-between gap-2">
          <Link href="/admin" className="flex items-center gap-2 flex-1">
            <div className="flex min-w-0 items-center gap-2">
              <Image
                src="/products/EcoTech_logo.png"
                alt="Eco Tech"
                width={178}
                height={56}
                className="h-11 w-auto"
                priority
              />
              <div className="flex min-w-0 flex-col">
                <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Eco Tech</span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>Admin</span>
              </div>
            </div>
          </Link>
          {isMobile && (
            <button
              type="button"
              aria-label="Close sidebar"
              onClick={onClose}
              className="rounded-lg p-1.5 transition hover:bg-white/10 shrink-0"
            >
              <X size={16} style={{ color: "var(--text-secondary)" }} />
            </button>
          )}
        </div>
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
          Sign out
        </button>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-64 max-w-[86vw] shrink-0 flex-col overflow-y-auto transition-transform duration-300 lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: "var(--bg-elevated)", borderRight: "1px solid var(--border-subtle)" }}
      >
        {sidebarContent}
      </aside>
    );
  }

  return (
    <aside
      className="sticky top-0 hidden h-screen w-64 flex-col lg:flex"
      style={{ background: "var(--bg-elevated)", borderRight: "1px solid var(--border-subtle)" }}
    >
      {sidebarContent}
    </aside>
  );
}
