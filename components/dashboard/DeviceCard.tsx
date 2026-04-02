"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type MouseEvent } from "react";
import { ChevronRight, Droplets, FlaskConical, Leaf, Thermometer } from "lucide-react";

type DeviceView = {
  _id: string;
  deviceId: string;
  name: string;
  plantType: string;
  isOnline: boolean;
  lastSeenAt?: string | null;
  image?: string;
};

type LiveData = {
  tds: number | null;
  ph: number | null;
  temp: number | null;
  isOnline: boolean | null;
};

function useLiveData(deviceId: string, enabled = true) {
  const [data, setData] = useState<LiveData>({ tds: null, ph: null, temp: null, isOnline: null });

  useEffect(() => {
    if (!enabled) return;

    const fetchLatest = () => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;

      fetch(`/api/devices/${deviceId}/latest`)
        .then((response) => (response.ok ? response.json() : null))
        .then((json) => {
          setData({
            tds: json?.reading?.tds_ppm ?? null,
            ph: json?.reading?.ph ?? null,
            temp: json?.reading?.temp ?? null,
            isOnline: typeof json?.device?.isOnline === "boolean" ? json.device.isOnline : null,
          });
        })
        .catch(() => {});
    };

    fetchLatest();

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchLatest();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    const interval = setInterval(fetchLatest, 30_000);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [deviceId, enabled]);

  return data;
}

function CardBody({ device, index }: { device: DeviceView; index: number }) {
  const isDemo = device.deviceId.startsWith("SG-DEMO-");
  const live = useLiveData(device.deviceId, !isDemo);
  const isOnline = isDemo ? false : live.isOnline ?? device.isOnline;

  const metrics = [
    { icon: Droplets, value: live.tds !== null ? `${live.tds} ppm` : "—", label: "TDS", color: "#60A5FA" },
    { icon: FlaskConical, value: live.ph !== null ? `${live.ph}` : "—", label: "pH", color: "var(--emerald-400)" },
    { icon: Thermometer, value: live.temp !== null ? `${live.temp}°C` : "—", label: "Temp", color: "var(--gold-400)" },
  ];

  return (
    <>
      <div className="relative overflow-hidden" style={{ height: 180 }}>
        {device.image ? (
          <Image
            src={device.image}
            alt={device.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0" style={{ background: "var(--bg-base)" }}>
            <div className="flex h-full items-center justify-center">
              <Leaf size={40} style={{ color: "var(--border-normal)" }} />
            </div>
          </div>
        )}

        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 100%)",
          }}
        />

        <div className="absolute right-3 top-3">
          <span
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
            style={{
              backdropFilter: "blur(8px)",
              ...(isOnline
                ? {
                    background: "rgba(16,185,129,0.20)",
                    color: "var(--emerald-400)",
                    border: "1px solid rgba(16,185,129,0.35)",
                  }
                : {
                    background: "rgba(0,0,0,0.40)",
                    color: "rgba(255,255,255,0.50)",
                    border: "1px solid rgba(255,255,255,0.10)",
                  }),
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{
                background: isOnline ? "var(--emerald-500)" : "rgba(255,255,255,0.25)",
                animation: isOnline ? "pulseDot 2s ease-in-out infinite" : "none",
              }}
            />
            {isOnline ? "Online" : "Offline"}
          </span>
        </div>

        {isDemo && (
          <div className="absolute left-3 top-3">
            <span
              className="rounded-full px-2.5 py-1 text-[10px] font-semibold"
              style={{ background: "rgba(249,115,22,0.18)", color: "#FDBA74", border: "1px solid rgba(249,115,22,0.25)" }}
            >
              Demo
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-bold leading-tight" style={{ color: "var(--text-primary)" }}>
              {device.name}
            </p>
            <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
              {device.plantType || "Hydroponics"} · <span className="font-mono text-[10px] truncate" title={device.deviceId}>{device.deviceId}</span>
            </p>
          </div>
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-transform duration-150 group-hover:translate-x-0.5"
            style={{
              background: isOnline ? "rgba(16,185,129,0.12)" : "var(--bg-base)",
              border: isOnline ? "1px solid rgba(16,185,129,0.25)" : "1px solid var(--border-subtle)",
            }}
          >
            <ChevronRight size={13} style={{ color: isOnline ? "var(--emerald-400)" : "var(--text-muted)" }} />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl p-3" style={{ background: "var(--bg-base)", border: "1px solid var(--border-subtle)" }}>
          {metrics.map(({ icon: Icon, value, label, color }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <Icon size={12} style={{ color: isOnline ? color : "var(--text-muted)" }} />
              <span className="font-mono text-[11px] font-bold" style={{ color: isOnline ? color : "var(--text-muted)" }}>
                {value}
              </span>
              <span className="text-[10px] sm:text-[9px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default function DeviceCard({ device, index }: { device: DeviceView; index: number }) {
  const isDemo = device.deviceId.startsWith("SG-DEMO-");
  const cardStyle = {
    animationDelay: `${index * 80}ms`,
    border: "1px solid var(--border-subtle)",
    background: "var(--bg-elevated)",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease",
  } as const;

  const body = (
    <div
      className="group relative flex flex-col overflow-hidden rounded-2xl animate-fade-up"
      style={cardStyle}
      onMouseEnter={(event: MouseEvent<HTMLDivElement>) => {
        if (isDemo) return;
        const element = event.currentTarget;
        element.style.borderColor = "rgba(16,185,129,0.35)";
        element.style.boxShadow = "0 8px 32px rgba(16,185,129,0.10)";
        element.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(event: MouseEvent<HTMLDivElement>) => {
        if (isDemo) return;
        const element = event.currentTarget;
        element.style.borderColor = "var(--border-subtle)";
        element.style.boxShadow = "none";
        element.style.transform = "translateY(0)";
      }}
    >
      <CardBody device={device} index={index} />
    </div>
  );

  if (isDemo) {
    return body;
  }

  return (
    <Link href={`/dashboard/${device.deviceId}/overview`} className="block">
      {body}
    </Link>
  );
}
