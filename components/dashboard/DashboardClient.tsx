"use client";

import { useState } from "react";
import { Cpu, Wifi, WifiOff, Activity, Flower2 } from "lucide-react";
import type { ReactNode } from "react";
import AddDeviceContent from "@/components/dashboard/AddDeviceContent";

interface DashboardClientProps {
  firstName: string;
  devices: Array<{
    _id: string;
    deviceId: string;
    name: string;
    plantType: string;
    isOnline: boolean;
    image?: string;
  }>;
  children: ReactNode;
}

export default function DashboardClient({
  firstName,
  devices: initialDevices,
  children,
}: DashboardClientProps) {
  const [devices, setDevices] = useState(initialDevices);

  const handleDeviceAdded = async () => {
    try {
      const res = await fetch("/api/devices");
      if (res.ok) {
        const data = await res.json();
        const now = Date.now();
        setDevices(
          data.data.map((d: any) => ({
            _id: String(d._id),
            deviceId: d.deviceId,
            name: d.name,
            plantType: d.plantType,
            isOnline: d.lastSeenAt
              ? now - new Date(d.lastSeenAt).getTime() < 5 * 60 * 1000
              : false,
            image: d.image,
          }))
        );
      }
    } catch {
      // Silent fail
    }
  };

  const onlineCount = devices.filter((d) => d.isOnline).length;
  const offlineCount = devices.length - onlineCount;
  const uptimePct = devices.length > 0 ? Math.round((onlineCount / devices.length) * 100) : 0;

  return (
    <section className="animate-fade-up space-y-6">
      {/* ── Greeting header ── */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{ background: "linear-gradient(135deg, var(--emerald-500), var(--emerald-600))" }}
            >
              <Flower2 size={13} color="#fff" />
            </div>
            <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
              Hello,&nbsp;
              <span style={{ color: "var(--text-primary)" }}>{firstName}</span>
            </p>
          </div>
          <h1 className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>
            Your Garden
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            {onlineCount}/{devices.length} devices online
          </p>
        </div>

        <AddDeviceContent onDeviceAdded={handleDeviceAdded} />
      </div>

      {/* ── Stats row ── */}
      {devices.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { icon: Cpu, label: "Total Devices", value: devices.length, color: "var(--text-primary)", iconBg: "rgba(255,255,255,0.06)" },
            { icon: Wifi, label: "Online", value: onlineCount, color: "var(--emerald-400)", iconBg: "rgba(16,185,129,0.10)" },
            { icon: WifiOff, label: "Offline", value: offlineCount, color: offlineCount > 0 ? "#F87171" : "var(--text-muted)", iconBg: offlineCount > 0 ? "rgba(239,68,68,0.10)" : "rgba(255,255,255,0.04)" },
            { icon: Activity, label: "Uptime", value: `${uptimePct}%`, color: "var(--gold-400)", iconBg: "rgba(245,158,11,0.10)" },
          ].map(({ icon: Icon, label, value, color, iconBg }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-xl p-4"
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: iconBg }}>
                <Icon size={15} style={{ color }} />
              </div>
              <div>
                <p className="text-xl font-black leading-tight" style={{ color }}>
                  {value}
                </p>
                <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                  {label}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Devices content ── */}
      {children}
    </section>
  );
}
