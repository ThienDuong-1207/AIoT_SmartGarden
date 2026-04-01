import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import DeviceTabsNav from "@/components/dashboard/DeviceTabsNav";

type Props = {
  children: React.ReactNode;
  params: Promise<{ deviceId: string }>;
};

export default async function DeviceLayout({ children, params }: Props) {
  const { deviceId } = await params;

  return (
    <div className="space-y-6">

      {/* ── Device header ── */}
      <div
        className="overflow-hidden rounded-2xl"
        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
      >
        {/* Top row */}
        <div className="flex items-center gap-3 px-5 py-3">
          <Link
            href="/dashboard"
            className="link-muted-emerald flex items-center gap-1.5 text-xs transition-colors duration-100"
          >
            <ArrowLeft size={12} />
            Plant pots
          </Link>

          <span style={{ color: "var(--border-normal)" }}>/</span>

          <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
            Basil Pot
          </span>

          <span
            className="rounded-full px-2 py-0.5 font-mono text-[10px]"
            style={{ background: "var(--bg-base)", color: "var(--text-muted)", border: "1px solid var(--border-subtle)" }}
          >
            {deviceId}
          </span>

          {/* Online indicator */}
          <div className="ml-auto flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" style={{ animation: "pulseDot 2s ease-in-out infinite" }} />
            <span className="font-mono text-[10px] font-semibold" style={{ color: "var(--emerald-400)" }}>LIVE</span>
          </div>
        </div>

        {/* Tab nav row */}
        <div
          className="px-2"
          style={{ borderTop: "1px solid var(--border-subtle)" }}
        >
          <DeviceTabsNav deviceId={deviceId} />
        </div>
      </div>

      {/* ── Tab content ── */}
      {children}
    </div>
  );
}
