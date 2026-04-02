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
      <main className="relative flex flex-col bg-transparent min-h-dvh overflow-hidden">
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
      {/* ── Page header ── */}
      <div className="relative z-10 pt-24 pb-12">
        <div className="container-app">
          <p className="mb-4 font-mono text-sm font-bold uppercase tracking-[0.25em] text-teal-400">
            {"// ACCOUNT"}
          </p>
          <h1 className="text-3xl font-black uppercase tracking-tighter md:text-5xl">
            <span className="text-white">ACCOUNT</span> <span className="text-emerald-400">PROFILE</span>
          </h1>
        </div>
      </div>

      {/* ── Main content ── */}
      <section className="container-app relative z-10 flex-1 pb-24">
        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">

          {/* ── Left: Avatar card ── */}
          <div className="space-y-6">
            <div className="group flex flex-col items-center rounded-3xl border border-white/10 bg-white/[0.02] p-6 text-center backdrop-blur-xl transition-all duration-300 hover:border-emerald-500/20 hover:bg-white/[0.04] sm:p-8 sm:rounded-[2rem]">

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
              <h3 className="mt-5 text-xl font-black uppercase tracking-tight text-white sm:mt-6 sm:text-2xl">
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
              <div className="grid w-full grid-cols-2 gap-3 sm:gap-4">
                {[
                  { value: "0", label: "Orders" },
                  { value: "0", label: "Devices" },
                ].map(({ value, label }) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/5 py-3 transition-all group-hover:border-emerald-500/20 sm:py-4">
                    <p className="mb-0.5 text-2xl font-black text-emerald-400 sm:text-3xl">
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
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-2xl transition-all duration-300 hover:bg-white/[0.04] sm:rounded-[2.5rem]">
              <div className="border-b border-white/5 px-5 py-5 sm:px-8 sm:py-6">
                <h2 className="text-xl font-black uppercase tracking-tight text-white">
                  Personal Information
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
                  <div key={label} className="flex flex-wrap items-center gap-4 px-5 py-5 sm:gap-6 sm:px-8 sm:py-6">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 sm:h-11 sm:w-11">
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
                    <span className="w-full rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:w-auto sm:shrink-0">
                      Google Account
                    </span>
                  </div>
                ))}
              </div>

              {/* Note */}
              <div className="bg-emerald-500/[0.01] px-5 py-5 sm:px-8 sm:py-6">
                <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest leading-relaxed">
                  {"> "}
                  Data is protected by <span className="text-emerald-400">OAuth 2.0</span>. Any changes are synchronized directly from 
                  {" "}<a href="https://myaccount.google.com" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline underline-offset-4 hover:text-emerald-300">Google Cloud</a>.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-xl shadow-2xl transition-all duration-300 hover:border-emerald-500/10 sm:rounded-[2.5rem] sm:p-8">
              <h2 className="mb-6 text-xl font-black uppercase tracking-tight text-white sm:mb-8">
                System Actions
              </h2>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
                <Link
                  href="/dashboard"
                  className="flex w-full items-center justify-center gap-3 rounded-2xl border border-emerald-500/40 py-4 text-xs font-black uppercase tracking-widest text-emerald-400 transition-all hover:bg-emerald-500/10 sm:flex-1 lg:flex-none lg:px-10"
                >
                  <LayoutDashboard size={16} />
                  OPEN DASHBOARD
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl border border-rose-500/30 py-4 text-xs font-black uppercase tracking-widest text-rose-400 transition-all hover:bg-rose-500/10 sm:flex-1 lg:flex-none lg:px-10"
                >
                  <LogOut size={16} />
                  SIGN OUT
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
