"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid, Bell, ShoppingBag, Settings2, Leaf, ChevronRight,
} from "lucide-react";

const NAV_GROUPS = [
  {
    label: "Quản lý",
    items: [
      {
        href: "/dashboard",
        icon: LayoutGrid,
        label: "Chậu cây",
        desc: "Tất cả thiết bị",
        exact: true,
      },
      {
        href: "/dashboard/alerts",
        icon: Bell,
        label: "Cảnh báo",
        desc: "Smart alerts · AI",
        exact: false,
      },
    ],
  },
  {
    label: "Tài khoản",
    items: [
      {
        href: "/products",
        icon: ShoppingBag,
        label: "Cửa hàng",
        desc: "Hạt giống · Dinh dưỡng",
        exact: false,
      },
      {
        href: "/dashboard/settings",
        icon: Settings2,
        label: "Cài đặt",
        desc: "Hồ sơ · Thông báo",
        exact: false,
      },
    ],
  },
];

/* accent colours per route */
const ACCENT: Record<string, { text: string; bg: string; border: string }> = {
  "/dashboard":          { text: "var(--emerald-400)", bg: "rgba(34,197,94,0.10)",  border: "rgba(74,222,128,0.22)"   },
  "/dashboard/alerts":   { text: "#FBBF24",            bg: "rgba(251,191,36,0.10)", border: "rgba(251,191,36,0.25)"   },
  "/products":           { text: "#F97316",            bg: "rgba(249,115,22,0.10)", border: "rgba(249,115,22,0.25)"   },
  "/dashboard/settings": { text: "#60A5FA",            bg: "rgba(96,165,250,0.10)", border: "rgba(96,165,250,0.25)"   },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <div
      className="flex min-h-dvh"
      style={{ background: "var(--bg-base)", paddingTop: "72px" }}
    >
      {/* ══════════════════════════════════
          SIDEBAR
      ══════════════════════════════════ */}
      <aside
        className="sticky top-[72px] hidden h-[calc(100dvh-72px)] w-64 shrink-0 flex-col overflow-y-auto md:flex"
        style={{
          background: "var(--bg-subtle)",
          borderRight: "1px solid var(--border-subtle)",
        }}
      >
        {/* Brand strip */}
        <div
          className="flex items-center gap-3 px-5 py-5"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
            style={{
              background: "linear-gradient(135deg, var(--emerald-500), var(--emerald-600))",
              boxShadow: "0 0 16px rgba(34,197,94,0.30)",
            }}
          >
            <Leaf size={15} color="#fff" />
          </div>
          <div>
            <p
              className="text-xs font-black uppercase tracking-[0.15em]"
              style={{ color: "var(--text-primary)" }}
            >
              Smart Garden
            </p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="status-dot status-online" style={{ width: 5, height: 5 }} />
              <span className="font-mono text-[9px] font-semibold" style={{ color: "var(--emerald-400)" }}>
                SYSTEM ONLINE
              </span>
            </div>
          </div>
        </div>

        {/* Nav groups */}
        <nav className="flex flex-col gap-5 px-3 py-5">
          {NAV_GROUPS.map(({ label, items }) => (
            <div key={label}>
              {/* Group label */}
              <p
                className="mb-1.5 px-3 font-mono text-[9px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: "var(--text-muted)" }}
              >
                {label}
              </p>

              {/* Items */}
              <div className="flex flex-col gap-0.5">
                {items.map(({ href, icon: Icon, label: itemLabel, desc, exact }) => {
                  const active = isActive(href, exact);
                  const accent = ACCENT[href] ?? ACCENT["/dashboard/settings"];

                  return (
                    <Link
                      key={href}
                      href={href}
                      className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-150"
                      style={
                        active
                          ? {
                              background: accent.bg,
                              border: `1px solid ${accent.border}`,
                            }
                          : {
                              background: "transparent",
                              border: "1px solid transparent",
                            }
                      }
                    >
                      {/* Icon box */}
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-150"
                        style={{
                          background: active ? accent.bg : "rgba(255,255,255,0.04)",
                          color: active ? accent.text : "var(--text-muted)",
                        }}
                      >
                        <Icon size={15} />
                      </div>

                      {/* Labels */}
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-xs font-semibold leading-tight"
                          style={{ color: active ? accent.text : "var(--text-secondary)" }}
                        >
                          {itemLabel}
                        </p>
                        <p
                          className="mt-0.5 truncate text-[10px]"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {desc}
                        </p>
                      </div>

                      <ChevronRight
                        size={11}
                        className="shrink-0 transition-all duration-150"
                        style={{
                          color: active ? accent.text : "transparent",
                          opacity: active ? 0.7 : 0,
                        }}
                      />
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div
          className="mt-auto p-5"
          style={{ borderTop: "1px solid var(--border-subtle)" }}
        >
          <p className="font-mono text-[9px]" style={{ color: "var(--text-muted)" }}>
            v2.0.0 · AIoT Platform
          </p>
        </div>
      </aside>

      {/* ══════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════ */}
      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6">
          {children}
        </div>
      </main>
    </div>
  );
}
