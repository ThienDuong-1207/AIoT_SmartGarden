"use client";

import Link from "next/link";
import Image from "next/image";
import { Leaf, ChevronRight } from "lucide-react";

type DeviceView = {
  _id: string;
  deviceId: string;
  name: string;
  plantType: string;
  isOnline: boolean;
  image?: string;
};

export default function DeviceCard({ device, index }: { device: DeviceView; index: number }) {
  return (
    <Link
      href={`/dashboard/${device.deviceId}/overview`}
      className="group relative overflow-hidden rounded-2xl animate-fade-up"
      style={{
        height: 260,
        animationDelay: `${index * 80}ms`,
        border: "1px solid var(--border-subtle)",
        transition: "border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = device.isOnline ? "rgba(16,185,129,0.35)" : "rgba(239,68,68,0.25)";
        el.style.boxShadow   = device.isOnline ? "0 8px 40px rgba(16,185,129,0.12)" : "0 8px 32px rgba(0,0,0,0.4)";
        el.style.transform   = "translateY(-3px)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "var(--border-subtle)";
        el.style.boxShadow   = "none";
        el.style.transform   = "translateY(0)";
      }}
    >
      {/* Background image */}
      {device.image ? (
        <Image
          src={device.image}
          alt={device.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0" style={{ background: "var(--bg-elevated)" }} />
      )}

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: device.isOnline
            ? "linear-gradient(to bottom, rgba(9,9,11,0.30) 0%, rgba(9,9,11,0.20) 40%, rgba(9,9,11,0.80) 75%, rgba(9,9,11,0.96) 100%)"
            : "linear-gradient(to bottom, rgba(9,9,11,0.50) 0%, rgba(9,9,11,0.35) 40%, rgba(9,9,11,0.88) 75%, rgba(9,9,11,0.98) 100%)",
        }}
      />
      {!device.isOnline && (
        <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.30)" }} />
      )}

      {/* Content */}
      <div className="absolute inset-0 z-10 flex flex-col justify-between p-5">
        {/* Top row */}
        <div className="flex items-center justify-between">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{
              background: "rgba(9,9,11,0.55)",
              border: "1px solid rgba(255,255,255,0.12)",
              backdropFilter: "blur(8px)",
            }}
          >
            <Leaf size={16} style={{ color: device.isOnline ? "var(--emerald-400)" : "var(--text-muted)" }} />
          </div>

          <span
            className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              backdropFilter: "blur(8px)",
              ...(device.isOnline
                ? { background: "rgba(16,185,129,0.20)", color: "var(--emerald-400)", border: "1px solid rgba(16,185,129,0.35)" }
                : { background: "rgba(239,68,68,0.15)", color: "#F87171",             border: "1px solid rgba(239,68,68,0.30)" }),
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{
                background: device.isOnline ? "var(--emerald-500)" : "#EF4444",
                animation: device.isOnline ? "pulseDot 2s ease-in-out infinite" : "none",
              }}
            />
            {device.isOnline ? "Online" : "Offline"}
          </span>
        </div>

        {/* Bottom info */}
        <div>
          <p className="text-xl font-black leading-tight" style={{ color: "#fff" }}>
            {device.name}
          </p>
          <p className="mt-0.5 text-sm" style={{ color: "rgba(255,255,255,0.60)" }}>
            {device.plantType || "Thủy canh"}
          </p>
          <p className="mt-1 font-mono text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>
            {device.deviceId}
          </p>

          <div
            className="mt-4 flex items-center justify-between border-t pt-3"
            style={{ borderColor: "rgba(255,255,255,0.10)" }}
          >
            <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.50)" }}>
              Xem chi tiết
            </span>
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full transition-transform duration-150 group-hover:translate-x-0.5"
              style={{
                background: device.isOnline ? "rgba(16,185,129,0.25)" : "rgba(255,255,255,0.08)",
                border: device.isOnline ? "1px solid rgba(16,185,129,0.40)" : "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <ChevronRight size={13} style={{ color: device.isOnline ? "var(--emerald-400)" : "rgba(255,255,255,0.40)" }} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
