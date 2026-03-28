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
import GalaxyBackground from "@/components/ui/GalaxyBackground";

export default function ProfilePage() {
  const { data: session, status } = useSession();

  /* ── Loading skeleton ── */
  if (status === "loading") {
    return (
      <main className="relative flex flex-col bg-transparent min-h-dvh overflow-hidden">
        <GalaxyBackground />
        <div className="container-app py-24 relative z-10">
          <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
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
    <main className="relative flex flex-col bg-transparent min-h-dvh overflow-hidden">
      <GalaxyBackground />
      {/* ── Page header ── */}
      <div className="relative z-10 pt-24 pb-12">
        <div className="container-app">
          <p className="mb-4 font-mono text-sm font-bold uppercase tracking-[0.25em] text-teal-400">
            {"// ACCOUNT"}
          </p>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
            <span className="text-white">THÔNG TIN</span> <span className="text-emerald-400">TÀI KHOẢN</span>
          </h1>
        </div>
      </div>

      {/* ── Main content ── */}
      <section className="container-app relative z-10 flex-1 pb-24">
        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">

          {/* ── Left: Avatar card ── */}
          <div className="space-y-6">
            <div className="flex flex-col items-center rounded-[2rem] bg-white/[0.02] backdrop-blur-xl border border-white/10 p-8 text-center transition-all duration-300 hover:bg-white/[0.04] hover:border-emerald-500/20 group">

              {session.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || "avatar"}
                  width={96}
                  height={96}
                  className="rounded-full object-cover ring-2 ring-emerald-500/30 ring-offset-4 ring-offset-black/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 ring-4 ring-emerald-500/10">
                  <User size={40} />
                </div>
              )}

              {/* Name + email */}
              <h3 className="mt-6 text-2xl font-black uppercase tracking-tight text-white">
                {session.user?.name}
              </h3>
              <p className="mt-1 font-mono text-xs text-slate-400">
                {session.user?.email}
              </p>

              {/* Role badge */}
              <div className="mt-6">
                <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                  <BadgeCheck size={12} />
                  {roleLabel}
                </span>
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-white/5 my-8" />

              {/* Quick stats */}
              <div className="grid w-full grid-cols-2 gap-4">
                {[
                  { value: "1", label: "Đơn hàng" },
                  { value: "2", label: "Thiết bị" },
                ].map(({ value, label }) => (
                  <div key={label} className="rounded-2xl py-4 bg-white/5 border border-white/10 group-hover:border-emerald-500/20 transition-all">
                    <p className="text-3xl font-black text-emerald-400 mb-0.5">
                      {value}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Account status */}
            <div className="flex items-center gap-4 rounded-3xl bg-white/[0.03] border border-white/10 p-5 backdrop-blur-sm transition-all hover:bg-white/[0.05]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-emerald-400">
                  Account Active
                </p>
                <p className="text-[10px] font-medium text-slate-500 mt-0.5">
                  OAuth 2.0 Identity Protocol
                </p>
              </div>
            </div>
          </div>

          {/* ── Right: Info + actions ── */}
          <div className="space-y-6">

            {/* Info fields */}
            <div className="overflow-hidden rounded-[2.5rem] bg-white/[0.02] backdrop-blur-xl border border-white/10 shadow-2xl transition-all duration-300 hover:bg-white/[0.04]">
              <div className="px-8 py-6 border-b border-white/5">
                <h2 className="text-xl font-black uppercase tracking-tight text-white">
                  Thông tin cá nhân
                </h2>
              </div>

              <div className="divide-y divide-white/5">
                {[
                  {
                    icon: User,
                    label: "HỌ VÀ TÊN",
                    value: session.user?.name || "—",
                  },
                  {
                    icon: Mail,
                    label: "EMAIL",
                    value: session.user?.email || "—",
                  },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-6 px-8 py-6">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                        {label}
                      </p>
                      <p className="mt-1 truncate text-base font-bold text-slate-200">
                        {value}
                      </p>
                    </div>
                    <span className="shrink-0 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                      Google Account
                    </span>
                  </div>
                ))}
              </div>

              {/* Note */}
              <div className="px-8 py-6 bg-emerald-500/[0.01]">
                <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest leading-relaxed">
                  {"> "}
                  Dữ liệu được bảo vệ bởi <span className="text-emerald-400">OAuth 2.0</span>. Mọi thay đổi sẽ được đồng bộ trực tiếp từ nền tảng 
                  {" "}<a href="https://myaccount.google.com" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline underline-offset-4 hover:text-emerald-300">Google Cloud</a>.
                </p>
              </div>
            </div>

            {/* Recent Orders (Tracking UI) */}
            <div className="overflow-hidden rounded-[2.5rem] bg-white/[0.02] backdrop-blur-xl border border-white/10 shadow-2xl transition-all duration-300 hover:bg-white/[0.04]">
              <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-xl font-black uppercase tracking-tight text-white">
                  Đơn hàng gần đây
                </h2>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                  </span>
                  Đang giao hàng
                </span>
              </div>

              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                      MÃ VẬN ĐƠN: <span className="text-emerald-400">SG-88392-TC</span>
                    </p>
                    <h3 className="mt-1 text-lg font-black text-slate-200">
                      Bộ phần cứng Smart Garden AIoT (v2.0)
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Dự kiến giao
                    </p>
                    <p className="mt-1 text-sm font-bold text-emerald-400 leading-none">
                      Hôm nay, 14:00 - 16:00
                    </p>
                  </div>
                </div>

                {/* Shipping Animation Video */}
                <div className="relative mt-2 rounded-2xl overflow-hidden border border-white/5 shadow-inner">
                  <video 
                    src="/videos/shipping.webm" 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    className="w-full h-48 md:h-64 object-cover rounded-xl pointer-events-none"
                  />
                  {/* Subtle Video Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                  
                  {/* Scanning Overlay (HUD) */}
                  <div className="absolute top-4 left-4">
                    <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-lg p-2.5">
                      <p className="text-[8px] font-black text-emerald-400/80 uppercase tracking-[0.15em] mb-1">
                        GPS TRACKING
                      </p>
                      <p className="text-[10px] font-mono font-bold text-white tabular-nums">
                        10.76262° N, 106.66017° E
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress Bar (Eco-Tech Style) */}
                <div className="mt-10">
                  <div className="flex justify-between items-end mb-3">
                    <p className="font-mono text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em]">
                      {"// SHIPPING PROGRESS"}
                    </p>
                    <p className="font-mono text-[10px] font-black text-white px-2 py-0.5 rounded bg-white/10 uppercase">
                      65%
                    </p>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all duration-1000 relative shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                      style={{ width: "65%" }}
                    >
                      <div className="absolute top-0 right-0 h-full w-8 bg-gradient-to-r from-transparent to-white/30 animate-pulse" />
                    </div>
                  </div>
                  <div className="flex justify-between mt-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                    <span>Kho phân loại</span>
                    <span className="text-emerald-400">Đang giao hàng</span>
                    <span>Hoàn tất</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="rounded-[2.5rem] bg-white/[0.02] backdrop-blur-xl border border-white/10 p-8 shadow-2xl transition-all duration-300 hover:border-emerald-500/10">
              <h2 className="text-xl font-black uppercase tracking-tight text-white mb-8">
                Thao tác hệ thống
              </h2>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/dashboard"
                  className="flex-1 justify-center gap-3 py-4 rounded-2xl border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 transition-all font-black text-xs uppercase tracking-widest flex items-center lg:flex-none lg:px-10"
                >
                  <LayoutDashboard size={16} />
                  VÀO DASHBOARD
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex-1 justify-center gap-3 py-4 rounded-2xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-all font-black text-xs uppercase tracking-widest flex items-center lg:flex-none lg:px-10"
                >
                  <LogOut size={16} />
                  ĐĂNG XUẤT
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
