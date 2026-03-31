"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutGrid, Bell, ShoppingBag, Settings2, Leaf } from "lucide-react";

const NAV_GROUPS = [
  {
    label: "Quản lý",
    items: [
      { href: "/dashboard",         icon: LayoutGrid, label: "Chậu cây",  desc: "Tất cả thiết bị", exact: true  },
      { href: "/dashboard/alerts",  icon: Bell,       label: "Cảnh báo",  desc: "Smart alerts · AI", exact: false },
    ],
  },
  {
    label: "Tài khoản",
    items: [
      { href: "/products",            icon: ShoppingBag, label: "Cửa hàng", desc: "Hạt giống · Dinh dưỡng", exact: false },
      { href: "/dashboard/settings",  icon: Settings2,   label: "Cài đặt",  desc: "Hồ sơ · Thông báo",     exact: false },
    ],
  },
];

/* Accent per route */
const ACCENT: Record<string, { text: string; bg: string; border: string }> = {
  "/dashboard":          { text: "var(--emerald-400)", bg: "rgba(16,185,129,0.10)", border: "var(--emerald-400)"  },
  "/dashboard/alerts":   { text: "var(--gold-400)",    bg: "rgba(245,158,11,0.10)", border: "var(--gold-400)"    },
  "/products":           { text: "#F97316",             bg: "rgba(249,115,22,0.10)", border: "#F97316"            },
  "/dashboard/settings": { text: "var(--blue-400)",    bg: "rgba(96,165,250,0.10)", border: "var(--blue-400)"    },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname       = usePathname();
  const [alertCount, setAlertCount] = useState(0);

  /* Fetch unread alert count */
  useEffect(() => {
    /* Tìm deviceId đầu tiên từ URL nếu đang ở device route */
    const match = pathname.match(/\/dashboard\/([^/]+)\//);
    if (!match) return;
    const deviceId = match[1];
    fetch(`/api/devices/${deviceId}/alerts?unread=true&limit=1`)
      .then((r) => r.ok ? r.json() : null)
      .then((json) => json?.count != null && setAlertCount(json.count))
      .catch(() => {});
  }, [pathname]);

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <div className="flex min-h-dvh" style={{ paddingTop: "72px" }}>

      {/* ═══════════════════════════════════
          SIDEBAR
      ═══════════════════════════════════ */}
      <aside
        className="sticky top-[72px] hidden h-[calc(100dvh-72px)] w-56 shrink-0 flex-col overflow-y-auto md:flex"
        style={{ background: "rgba(13,17,23,0.75)", backdropFilter: "blur(12px)", borderRight: "1px solid var(--border-subtle)" }}
      >
        {/* Brand strip */}
        <div
          className="flex items-center gap-2.5 px-4 py-4"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
            style={{ background: "linear-gradient(135deg, var(--emerald-500), var(--emerald-600))" }}
          >
            <Leaf size={13} color="#fff" />
          </div>
          <div>
            <p className="text-xs font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
              Smart Garden
            </p>
            <div className="mt-0.5 flex items-center gap-1">
              <span className="status-dot status-online" style={{ width: 5, height: 5 }} />
              <span className="font-mono text-[9px] font-semibold" style={{ color: "var(--emerald-400)" }}>
                ONLINE
              </span>
            </div>
          </div>
        </div>

        {/* Nav groups */}
        <nav className="flex flex-col gap-4 px-2 py-4">
          {NAV_GROUPS.map(({ label, items }) => (
            <div key={label}>
              <p className="section-label mb-1 px-2">{label}</p>
              <div className="flex flex-col gap-0.5">
                {items.map(({ href, icon: Icon, label: itemLabel, desc, exact }) => {
                  const active = isActive(href, exact);
                  const accent = ACCENT[href] ?? ACCENT["/dashboard/settings"];
                  const isAlerts = href === "/dashboard/alerts";

                  return (
                    <Link
                      key={href}
                      href={href}
                      className="sidebar-nav-link group flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-all duration-100"
                      data-active={active ? "true" : undefined}
                      style={active
                        ? { background: accent.bg, borderLeft: `2px solid ${accent.border}`, paddingLeft: "calc(0.625rem - 2px)" }
                        : { borderLeft: "2px solid transparent" }
                      }
                    >
                      {/* Icon */}
                      <div
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                        style={{ background: active ? accent.bg : "var(--bg-elevated)", color: active ? accent.text : "var(--text-muted)" }}
                      >
                        <Icon size={14} />
                      </div>

                      {/* Labels */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold leading-tight" style={{ color: active ? accent.text : "var(--text-secondary)" }}>
                          {itemLabel}
                        </p>
                        <p className="truncate text-[10px]" style={{ color: "var(--text-muted)" }}>{desc}</p>
                      </div>

                      {/* Alert badge */}
                      {isAlerts && alertCount > 0 && (
                        <span
                          className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full px-1 font-mono text-[9px] font-bold"
                          style={{ background: "var(--gold-500)", color: "#000" }}
                        >
                          {alertCount > 99 ? "99+" : alertCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="mt-auto px-4 py-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <p className="font-mono text-[9px]" style={{ color: "var(--text-muted)" }}>v2.0.0 · AIoT Platform</p>
        </div>
      </aside>

      {/* ═══════════════════════════════════
          MAIN CONTENT
      ═══════════════════════════════════ */}
      <main className="flex-1 min-w-0 overflow-x-hidden">
        <div className="w-full px-4 py-6 md:px-6">
          {children}
        </div>
      </main>
    </div>
  );
}
