"use client";

import { useSession, signOut } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  User,
  Mail,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  BadgeCheck,
} from "lucide-react";
import SiteFooter from "@/components/marketing/SiteFooter";

export default function ProfilePage() {
  const { data: session, status } = useSession();

  /* ── Loading skeleton ── */
  if (status === "loading") {
    return (
      <main
        className="flex flex-col"
        style={{ background: "var(--bg-base)", minHeight: "100dvh" }}
      >
        <div style={{ paddingTop: "6rem" }} className="container-app py-10">
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <div className="skeleton h-64 rounded-2xl" />
            <div className="space-y-4">
              <div className="skeleton h-10 w-48 rounded-xl" />
              <div className="skeleton h-32 rounded-2xl" />
              <div className="skeleton h-16 rounded-2xl" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!session) {
    redirect("/auth/login");
  }

  const roleLabel = session.user?.role === "admin" ? "Admin" : "Customer";
  const roleClass = session.user?.role === "admin" ? "badge-gold" : "badge-emerald";

  return (
    <main
      className="flex flex-col"
      style={{ background: "var(--bg-base)", minHeight: "100dvh" }}
    >
      {/* ── Page header ── */}
      <div
        style={{
          paddingTop: "5rem",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div className="container-app py-6">
          <p
            className="mb-1 font-mono text-xs font-semibold uppercase tracking-[0.15em]"
            style={{ color: "var(--emerald-500)" }}
          >
            // ACCOUNT
          </p>
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Thông tin tài khoản
          </h1>
        </div>
      </div>

      {/* ── Main content ── */}
      <section className="container-app flex-1 py-8">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">

          {/* ── Left: Avatar card ── */}
          <div className="space-y-4">
            <div
              className="flex flex-col items-center rounded-2xl p-7 text-center"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              {/* Avatar */}
              {session.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || "avatar"}
                  width={80}
                  height={80}
                  className="rounded-full object-cover"
                  style={{ border: "2px solid var(--border-emerald)" }}
                />
              ) : (
                <div
                  className="flex h-20 w-20 items-center justify-center rounded-full"
                  style={{
                    background: "rgba(16,185,129,0.10)",
                    border: "2px solid var(--border-emerald)",
                    color: "var(--emerald-400)",
                  }}
                >
                  <User size={34} />
                </div>
              )}

              {/* Name + email */}
              <p
                className="mt-4 text-lg font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {session.user?.name}
              </p>
              <p
                className="mt-0.5 truncate text-xs"
                style={{
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {session.user?.email}
              </p>

              {/* Role badge */}
              <div className="mt-4">
                <span className={`badge ${roleClass} gap-1.5`}>
                  <BadgeCheck size={11} />
                  {roleLabel}
                </span>
              </div>

              {/* Divider */}
              <div className="divider my-5 w-full" />

              {/* Quick stats */}
              <div className="grid w-full grid-cols-2 gap-3 text-center">
                {[
                  { value: "0", label: "Đơn hàng" },
                  { value: "0", label: "Thiết bị" },
                ].map(({ value, label }) => (
                  <div
                    key={label}
                    className="rounded-xl py-3"
                    style={{
                      background: "var(--bg-overlay)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    <p
                      className="text-xl font-black"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {value}
                    </p>
                    <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Account status */}
            <div
              className="flex items-center gap-3 rounded-2xl px-5 py-4"
              style={{
                background: "rgba(16,185,129,0.06)",
                border: "1px solid rgba(16,185,129,0.16)",
              }}
            >
              <ShieldCheck size={18} style={{ color: "var(--emerald-500)" }} />
              <div>
                <p className="text-xs font-semibold" style={{ color: "var(--emerald-400)" }}>
                  Tài khoản đang hoạt động
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  OAuth 2.0 · Google
                </p>
              </div>
            </div>
          </div>

          {/* ── Right: Info + actions ── */}
          <div className="space-y-5">

            {/* Info fields */}
            <div
              className="overflow-hidden rounded-2xl"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div
                className="px-6 py-4"
                style={{ borderBottom: "1px solid var(--border-subtle)" }}
              >
                <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                  Thông tin cá nhân
                </h2>
              </div>

              <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
                {[
                  {
                    icon: User,
                    label: "Họ và tên",
                    value: session.user?.name || "—",
                  },
                  {
                    icon: Mail,
                    label: "Email",
                    value: session.user?.email || "—",
                  },
                ].map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="flex items-center gap-4 px-6 py-5"
                    style={{ borderColor: "var(--border-subtle)" }}
                  >
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                      style={{
                        background: "rgba(16,185,129,0.08)",
                        color: "var(--emerald-500)",
                      }}
                    >
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className="text-xs font-semibold uppercase tracking-wider"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {label}
                      </p>
                      <p
                        className="mt-0.5 truncate text-sm"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {value}
                      </p>
                    </div>
                    <span className="badge badge-slate shrink-0 text-xs">
                      Google
                    </span>
                  </div>
                ))}
              </div>

              {/* Note */}
              <div
                className="px-6 py-4"
                style={{ borderTop: "1px solid var(--border-subtle)" }}
              >
                <p
                  className="font-mono text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  {"> "}
                  Thông tin được đồng bộ từ Google — chỉnh sửa tại{" "}
                  <a
                    href="https://myaccount.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "var(--emerald-400)" }}
                  >
                    myaccount.google.com
                  </a>
                </p>
              </div>
            </div>

            {/* Actions */}
            <div
              className="rounded-2xl p-6"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <h2
                className="mb-4 font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Thao tác
              </h2>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/dashboard"
                  className="btn-emerald flex-1 justify-center gap-2 sm:flex-none"
                >
                  <LayoutDashboard size={15} />
                  Vào Dashboard
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="btn-danger flex-1 justify-center gap-2 sm:flex-none"
                >
                  <LogOut size={15} />
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
