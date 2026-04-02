"use client";

import { useSession } from "next-auth/react";
import { Bell, Menu } from "lucide-react";

interface AdminHeaderProps {
  onMenuClick?: () => void;
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const { data: session } = useSession();

  return (
    <header style={{ borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-elevated)" }}>
      <div className="flex items-center justify-between px-4 py-4 lg:justify-end lg:px-6">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden rounded-lg p-2 transition"
          style={{ color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-4">
          <button
            className="relative rounded-lg p-2 transition"
            style={{ color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full" style={{ background: "var(--danger)" }} />
          </button>

          <div className="flex items-center gap-3 pl-4" style={{ borderLeft: "1px solid var(--border-subtle)" }}>
            <div className="hidden flex-col text-right sm:flex">
              <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{session?.user?.name}</span>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>{session?.user?.email}</span>
            </div>
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white shrink-0"
              style={{ background: "linear-gradient(135deg, var(--emerald-500), var(--emerald-600))" }}
            >
              {session?.user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
