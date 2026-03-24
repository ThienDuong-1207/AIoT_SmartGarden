import { Camera, Settings2, ArrowLeft, Wifi } from "lucide-react";
import Link from "next/link";
import DeviceTabsNav from "@/components/dashboard/DeviceTabsNav";

type Props = {
  children: React.ReactNode;
  params: Promise<{ deviceId: string }>;
};

export default async function DeviceLayout({ children, params }: Props) {
  const { deviceId } = await params;

  return (
    <div className="space-y-0">

      {/* ── Device header bar ── */}
      <div
        className="mb-6 overflow-hidden rounded-2xl"
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        {/* Top row */}
        <div
          className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <div className="flex items-center gap-3">
            {/* Back */}
            <Link
              href="/dashboard"
              className="link-muted-emerald flex items-center gap-1.5 font-mono text-xs"
            >
              <ArrowLeft size={13} />
              Device Grid
            </Link>

            <span style={{ color: "var(--border-subtle)" }}>·</span>

            {/* Status dot + name */}
            <div className="flex items-center gap-2">
              <span className="status-dot status-online" />
              <span className="font-bold" style={{ color: "var(--text-primary)" }}>
                Chậu Húng Quế
              </span>
            </div>

            {/* Device ID chip */}
            <span
              className="rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold"
              style={{
                background: "rgba(255,255,255,0.05)",
                color: "var(--text-muted)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              {deviceId}
            </span>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* MQTT status */}
            <div
              className="flex items-center gap-1.5 rounded-full px-3 py-1"
              style={{
                background: "rgba(16,185,129,0.06)",
                border: "1px solid rgba(16,185,129,0.15)",
              }}
            >
              <Wifi size={10} style={{ color: "var(--emerald-500)" }} />
              <span className="font-mono text-[10px] font-semibold" style={{ color: "var(--emerald-400)" }}>
                MQTT · LIVE
              </span>
            </div>

            <button className="btn-gold gap-1.5 px-3 py-1.5 text-xs">
              <Camera size={12} />
              Capture Now
            </button>

            <button className="btn-ghost gap-1.5 px-3 py-1.5 text-xs">
              <Settings2 size={12} />
              Settings
            </button>
          </div>
        </div>

        {/* Tab nav row */}
        <div className="px-3 py-2">
          <DeviceTabsNav deviceId={deviceId} />
        </div>
      </div>

      {/* ── Tab content ── */}
      {children}
    </div>
  );
}
