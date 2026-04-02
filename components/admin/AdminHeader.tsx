"use client";

import { useSession } from "next-auth/react";
import { Bell, Menu } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

interface AdminHeaderProps {
  onMenuClick?: () => void;
}

const INITIAL_NOTIFICATIONS = [
  {
    id: "n1",
    title: "New order received",
    message: "Order #EC-24031 has been placed.",
    time: "2m ago",
    unread: true,
  },
  {
    id: "n2",
    title: "Low inventory alert",
    message: "Nutrient A is below threshold.",
    time: "14m ago",
    unread: true,
  },
  {
    id: "n3",
    title: "System diagnostics complete",
    message: "All gateway services are healthy.",
    time: "1h ago",
    unread: false,
  },
];

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const { data: session } = useSession();
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const notifyRef = useRef<HTMLDivElement>(null);
  const unreadCount = useMemo(() => notifications.filter((item) => item.unread).length, [notifications]);

  const markAsRead = (notificationId: string) => {
    setNotifications((current) =>
      current.map((item) => (item.id === notificationId ? { ...item, unread: false } : item)),
    );
  };

  const markAllAsRead = () => {
    setNotifications((current) => current.map((item) => ({ ...item, unread: false })));
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (notifyRef.current && !notifyRef.current.contains(event.target as Node)) {
        setIsNotifyOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsNotifyOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

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
          <ThemeToggle />

          <div className="relative" ref={notifyRef}>
            <button
              type="button"
              onClick={() => setIsNotifyOpen((prev) => !prev)}
              className="relative rounded-lg p-2 transition"
              style={{ color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}
              aria-label="Open notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white" style={{ background: "var(--danger)" }}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {isNotifyOpen && (
              <div
                className="absolute right-0 z-50 mt-2 w-[min(92vw,22rem)] overflow-hidden rounded-2xl"
                style={{
                  background: "var(--bg-overlay)",
                  border: "1px solid var(--border-subtle)",
                  boxShadow: "var(--shadow-elevated)",
                }}
              >
                <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    Notifications
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ background: "rgba(16,185,129,0.14)", color: "var(--emerald-400)" }}>
                      {unreadCount} new
                    </span>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllAsRead}
                        className="rounded-full px-2 py-0.5 text-[11px] font-semibold transition"
                        style={{ background: "rgba(255,255,255,0.04)", color: "var(--text-secondary)" }}
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                </div>

                <div className="max-h-80 overflow-auto p-2">
                  {notifications.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl px-3 py-2"
                      style={{ background: item.unread ? "rgba(16,185,129,0.08)" : "transparent" }}
                    >
                      <div className="flex items-start gap-2">
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: item.unread ? "var(--emerald-400)" : "var(--border-normal)" }} />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                            {item.title}
                          </p>
                          <p className="mt-0.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                            {item.message}
                          </p>
                        </div>
                        <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                          {item.time}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-end gap-2">
                        {item.unread ? (
                          <button
                            type="button"
                            onClick={() => markAsRead(item.id)}
                            className="rounded-full px-2 py-1 text-[10px] font-semibold transition"
                            style={{ background: "rgba(16,185,129,0.12)", color: "var(--emerald-400)" }}
                          >
                            Mark as read
                          </button>
                        ) : (
                          <span className="rounded-full px-2 py-1 text-[10px] font-semibold" style={{ background: "rgba(255,255,255,0.04)", color: "var(--text-muted)" }}>
                            Read
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="px-3 py-2" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                  <Link
                    href="/admin/diagnostics"
                    onClick={() => setIsNotifyOpen(false)}
                    className="block rounded-lg px-3 py-2 text-center text-xs font-semibold transition"
                    style={{ color: "var(--text-secondary)", background: "var(--bg-elevated)" }}
                  >
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

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
