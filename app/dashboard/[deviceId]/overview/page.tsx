"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Droplets, Thermometer, FlaskConical, Wind, Camera,
  Activity, AlertTriangle, Wifi, WifiOff, TrendingUp, TrendingDown,
} from "lucide-react";

/* ── Types ── */
interface SensorReading {
  temp?: number; humi?: number; tds_ppm?: number; ph?: number;
  water_level?: number; light_status?: boolean; timestamp?: string;
}
interface LatestData {
  reading: SensorReading | null;
  device: {
    isOnline: boolean; lastSeenAt?: string;
    name: string; plantType: string;
    thresholds?: { tds?: { min: number; max: number }; ph?: { min: number; max: number }; temp?: { min: number; max: number }; };
  };
  unreadAlerts: number;
}
interface ChartReading { timestamp: string; temp?: number; tds_ppm?: number; ph?: number; }

/* ── Helpers ── */
function timeAgo(dateStr?: string) {
  if (!dateStr) return "—";
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60)    return `${diff}s trước`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h trước`;
  return `${Math.floor(diff / 86400)}d trước`;
}

function statusOf(value: number | undefined, min: number, max: number): "ok" | "warn" | "none" {
  if (value == null) return "none";
  if (value < min || value > max) return "warn";
  return "ok";
}

/* ── Mini sparkline ── */
function Spark({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const h = 36;
  const w = 96;
  const step = w / (values.length - 1);
  const pts = values.map((v, i) => `${i * step},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <polyline points={pts} stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" opacity={0.8} />
    </svg>
  );
}

/* ── Single metric card ── */
function MetricCard({ label, value, unit, icon: Icon, color, iconBg, min, max, trend, sparkVals }: {
  label: string; value: string; unit: string; icon: React.ElementType;
  color: string; iconBg: string; min: number; max: number;
  trend?: number; sparkVals: number[];
}) {
  const numVal = parseFloat(value);
  const status = statusOf(isNaN(numVal) ? undefined : numVal, min, max);
  const pct = isNaN(numVal) ? 50 : Math.min(100, Math.max(0, ((numVal - min) / (max - min)) * 100));
  const inRange = pct > 10 && pct < 90;

  return (
    <div className="dark-card p-4 flex flex-col gap-3">
      {/* Top row */}
      <div className="flex items-center justify-between">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: iconBg }}>
          <Icon size={14} style={{ color }} />
        </div>
        <div className="flex items-center gap-1">
          {trend != null && (
            <span className="flex items-center gap-0.5 text-[10px] font-medium"
              style={{ color: trend >= 0 ? "var(--emerald-400)" : "#F87171" }}>
              {trend >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {Math.abs(trend).toFixed(1)}
            </span>
          )}
          {status === "warn" && (
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--gold-500)" }} />
          )}
        </div>
      </div>

      {/* Value */}
      <div>
        <div className="metric-value" style={{ color }}>
          {value}
          <span className="ml-1 text-base font-normal" style={{ color: "var(--text-muted)" }}>{unit}</span>
        </div>
        <p className="section-label mt-0.5">{label}</p>
      </div>

      {/* Sparkline + bar */}
      <div className="space-y-2">
        {sparkVals.length > 1 && <Spark values={sparkVals} color={inRange ? "var(--emerald-400)" : "var(--gold-400)"} />}
        <div className="h-[3px] w-full overflow-hidden rounded-full" style={{ background: "var(--border-subtle)" }}>
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: inRange ? "var(--emerald-500)" : "var(--gold-500)" }} />
        </div>
        <div className="flex justify-between text-[9px] font-mono" style={{ color: "var(--text-muted)" }}>
          <span>{min}{unit}</span>
          <span style={{ color: inRange ? "var(--emerald-400)" : "var(--gold-400)" }}>
            {inRange ? "●  Trong ngưỡng" : "⚠  Cần kiểm tra"}
          </span>
          <span>{max}{unit}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Chart bar column ── */
function BarChart({ readings }: { readings: ChartReading[] }) {
  const bars = readings.slice(-24);
  const vals = bars.map((r) => r.tds_ppm ?? 0);
  const maxVal = Math.max(...vals, 1);

  return (
    <div className="flex items-end gap-[3px]" style={{ height: 80 }}>
      {bars.length === 0
        ? Array.from({ length: 24 }, (_, i) => (
            <div key={i} className="flex-1 rounded-sm"
              style={{ height: `${30 + Math.sin(i * 0.8) * 20 + 20}%`, background: "var(--border-subtle)" }} />
          ))
        : bars.map((r, i) => {
            const h = Math.max(8, Math.round(((r.tds_ppm ?? 0) / maxVal) * 100));
            const isRecent = i >= bars.length - 4;
            return (
              <div key={i} className="flex-1 rounded-sm transition-all duration-300"
                style={{ height: `${h}%`, background: isRecent ? "var(--emerald-500)" : "rgba(16,185,129,0.22)" }} />
            );
          })
      }
    </div>
  );
}

export default function OverviewPage() {
  const params   = useParams();
  const deviceId = params.deviceId as string;

  const [data, setData]     = useState<LatestData | null>(null);
  const [charts, setCharts] = useState<ChartReading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [lRes, cRes] = await Promise.all([
          fetch(`/api/devices/${deviceId}/latest`),
          fetch(`/api/devices/${deviceId}/readings?range=24h&limit=48`),
        ]);
        if (lRes.ok)  setData(await lRes.json());
        if (cRes.ok)  setCharts((await cRes.json()).readings ?? []);
      } catch { /* fallback to empty */ }
      finally    { setLoading(false); }
    }
    load();
    const t = setInterval(load, 30_000);
    return () => clearInterval(t);
  }, [deviceId]);

  const r = data?.reading;
  const d = data?.device;
  const thr = d?.thresholds;

  /* Spark arrays from chart history */
  function sparkOf(key: "tds_ppm" | "ph" | "temp") {
    return charts.slice(-12).map((c) => c[key] ?? 0).filter(Boolean);
  }

  const METRICS = [
    {
      label: "TDS", value: r?.tds_ppm != null ? r.tds_ppm.toFixed(0) : "—", unit: "ppm",
      icon: Droplets, color: "var(--blue-400)", iconBg: "rgba(59,130,246,0.12)",
      min: thr?.tds?.min ?? 800, max: thr?.tds?.max ?? 1800,
      sparkVals: sparkOf("tds_ppm"),
    },
    {
      label: "pH", value: r?.ph != null ? r.ph.toFixed(1) : "—", unit: "",
      icon: FlaskConical, color: "var(--emerald-400)", iconBg: "rgba(16,185,129,0.12)",
      min: thr?.ph?.min ?? 5.5, max: thr?.ph?.max ?? 7.0,
      sparkVals: sparkOf("ph"),
    },
    {
      label: "Nhiệt độ", value: r?.temp != null ? r.temp.toFixed(1) : "—", unit: "°C",
      icon: Thermometer, color: "var(--gold-400)", iconBg: "rgba(245,158,11,0.12)",
      min: thr?.temp?.min ?? 18, max: thr?.temp?.max ?? 32,
      sparkVals: sparkOf("temp"),
    },
    {
      label: "Độ ẩm", value: r?.humi != null ? r.humi.toFixed(0) : "—", unit: "%",
      icon: Wind, color: "var(--cyan-400)", iconBg: "rgba(6,182,212,0.12)",
      min: 40, max: 90,
      sparkVals: charts.slice(-12).map((c) => (c as unknown as { humi?: number }).humi ?? 0).filter(Boolean),
    },
  ];

  function avg(key: keyof ChartReading) {
    const vals = charts.map((c) => c[key] as number).filter((v) => v != null && v > 0);
    return vals.length ? (vals.reduce((s, v) => s + v, 0) / vals.length) : null;
  }

  return (
    <div className="animate-fade-up space-y-4">

      {/* ── Live status bar ── */}
      <div
        className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl px-4 py-2.5"
        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
      >
        <div className="flex items-center gap-2">
          {d?.isOnline
            ? <><span className="status-dot status-online" style={{ width: 6, height: 6 }} /><span className="text-xs font-semibold" style={{ color: "var(--emerald-400)" }}>Online</span></>
            : <><WifiOff size={12} style={{ color: "var(--text-muted)" }} /><span className="text-xs" style={{ color: "var(--text-muted)" }}>Offline</span></>
          }
        </div>
        <div className="h-3 w-px" style={{ background: "var(--border-subtle)" }} />
        <div className="flex items-center gap-1.5">
          <Activity size={11} style={{ color: "var(--text-muted)" }} />
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            Cập nhật: <span className="font-mono" style={{ color: "var(--text-secondary)" }}>{timeAgo(r?.timestamp)}</span>
          </span>
        </div>
        {(data?.unreadAlerts ?? 0) > 0 && (
          <>
            <div className="h-3 w-px" style={{ background: "var(--border-subtle)" }} />
            <div className="flex items-center gap-1.5">
              <AlertTriangle size={11} style={{ color: "var(--gold-400)" }} />
              <span className="text-xs font-semibold" style={{ color: "var(--gold-400)" }}>
                {data?.unreadAlerts} cảnh báo
              </span>
            </div>
          </>
        )}
        {loading && (
          <div className="ml-auto flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: "var(--emerald-400)" }} />
            <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>Đang tải…</span>
          </div>
        )}
      </div>

      {/* ── Metric cards + Chart: 5-col layout ── */}
      <div className="grid gap-4 lg:grid-cols-5">

        {/* 4 metric cards (2x2) */}
        <div className="grid grid-cols-2 gap-4 lg:col-span-2 lg:grid-cols-2 content-start">
          {METRICS.map((m) => (
            <MetricCard key={m.label} {...m} />
          ))}
        </div>

        {/* Chart — takes 3/5 width */}
        <div className="dark-card overflow-hidden lg:col-span-3">
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                TDS · 24h
              </p>
              <p className="section-label mt-0.5">
                {charts.length > 0 ? `${charts.length} điểm dữ liệu` : "Chưa có dữ liệu"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {[
                { label: "TDS",  color: "var(--blue-400)"    },
                { label: "pH",   color: "var(--emerald-400)" },
                { label: "Temp", color: "var(--gold-400)"    },
              ].map(({ label, color }) => (
                <span key={label} className="flex items-center gap-1 text-[10px]" style={{ color: "var(--text-muted)" }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />{label}
                </span>
              ))}
            </div>
          </div>

          <div className="px-4 pt-4 pb-2">
            <BarChart readings={charts} />
            <div className="mt-2 flex justify-between text-[9px] font-mono" style={{ color: "var(--text-muted)" }}>
              <span>24h trước</span><span>18h</span><span>12h</span><span>6h</span>
              <span style={{ color: "var(--emerald-400)" }}>Now</span>
            </div>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-3 divide-x" style={{ borderTop: "1px solid var(--border-subtle)", borderColor: "var(--border-subtle)" }}>
            {[
              { label: "TDS TB",  value: avg("tds_ppm") != null ? `${avg("tds_ppm")!.toFixed(0)} ppm` : "—", color: "var(--blue-400)"    },
              { label: "pH TB",   value: avg("ph")      != null ? avg("ph")!.toFixed(2)                 : "—", color: "var(--emerald-400)" },
              { label: "Temp TB", value: avg("temp")    != null ? `${avg("temp")!.toFixed(1)} °C`       : "—", color: "var(--gold-400)"   },
            ].map(({ label, value, color }) => (
              <div key={label} className="px-3 py-2.5 text-center" style={{ borderColor: "var(--border-subtle)" }}>
                <p className="text-xs font-bold" style={{ color }}>{value}</p>
                <p className="section-label mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Camera + Latest AI ── */}
      <div className="dark-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <div className="flex items-center gap-2">
            <Camera size={13} style={{ color: "var(--emerald-400)" }} />
            <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Camera Feed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-mono font-semibold"
              style={{ background: d?.isOnline ? "rgba(16,185,129,0.10)" : "var(--bg-base)", color: d?.isOnline ? "var(--emerald-400)" : "var(--text-muted)", border: `1px solid ${d?.isOnline ? "rgba(16,185,129,0.20)" : "var(--border-subtle)"}` }}>
              {d?.isOnline ? <><span className="mr-1 h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 inline-block" />LIVE</> : "OFFLINE"}
            </div>
            <span className="font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>{timeAgo(r?.timestamp)}</span>
          </div>
        </div>

        <div className="flex gap-4 p-4">
          {/* Camera preview */}
          <div className="relative flex h-40 w-56 shrink-0 items-center justify-center overflow-hidden rounded-lg"
            style={{ background: "#080D14", border: "1px solid var(--border-subtle)" }}>
            <div className="pointer-events-none absolute inset-0 opacity-10"
              style={{ backgroundImage: "radial-gradient(rgba(59,130,246,0.5) 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
            {[{ top: 8, left: 8, bT: true, bL: true }, { top: 8, right: 8, bT: true, bR: true },
              { bottom: 8, left: 8, bB: true, bL: true }, { bottom: 8, right: 8, bB: true, bR: true }
            ].map((p, i) => (
              <div key={i} className="absolute h-4 w-4"
                style={{ top: p.top, left: (p as {left?: number}).left, right: (p as {right?: number}).right, bottom: (p as {bottom?: number}).bottom,
                  borderTop: p.bT ? "1.5px solid #3B82F6" : undefined, borderLeft: p.bL ? "1.5px solid #3B82F6" : undefined,
                  borderRight: (p as {bR?: boolean}).bR ? "1.5px solid #3B82F6" : undefined, borderBottom: (p as {bB?: boolean}).bB ? "1.5px solid #3B82F6" : undefined }} />
            ))}
            <div className="z-10 text-center">
              <Camera size={20} style={{ color: "rgba(255,255,255,0.12)", margin: "0 auto" }} />
              <p className="mt-1.5 font-mono text-[9px]" style={{ color: "var(--text-muted)" }}>OV2640 · CAM_01</p>
            </div>
            <div className="absolute inset-x-0 bottom-0 flex justify-between px-3 py-1"
              style={{ background: "rgba(0,0,0,0.55)" }}>
              <span className="font-mono text-[8px]" style={{ color: "#60A5FA" }}>CAM_01</span>
              <span className="font-mono text-[8px]" style={{ color: d?.isOnline ? "var(--emerald-400)" : "var(--text-muted)" }}>
                {d?.isOnline ? "● ONLINE" : "○ OFFLINE"}
              </span>
            </div>
          </div>

          {/* AI summary */}
          <div className="flex flex-1 flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Wifi size={12} style={{ color: d?.isOnline ? "var(--emerald-400)" : "var(--text-muted)" }} />
                <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                  {d?.name ?? deviceId}
                </span>
                <span className="rounded-full px-2 py-0.5 text-[10px]"
                  style={{ background: "var(--bg-base)", color: "var(--text-muted)", border: "1px solid var(--border-subtle)" }}>
                  {d?.plantType ?? "—"}
                </span>
              </div>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                {r
                  ? `TDS ${r.tds_ppm ?? "—"} ppm · pH ${r.ph ?? "—"} · Temp ${r.temp ?? "—"}°C · Humi ${r.humi ?? "—"}%`
                  : "Chưa nhận được dữ liệu. Hãy chắc chắn ESP32 đã kết nối."
                }
              </p>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1.5 text-[10px]" style={{ color: "var(--text-muted)" }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--emerald-400)" }} />
                Lần cuối: {timeAgo(r?.timestamp)}
              </div>
              <div className="flex items-center gap-1.5 text-[10px]" style={{ color: "var(--text-muted)" }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: r?.light_status ? "var(--gold-400)" : "var(--border-subtle)" }} />
                Đèn: {r?.light_status ? "Bật" : "Tắt"}
              </div>
              {r?.water_level != null && (
                <div className="flex items-center gap-1.5 text-[10px]" style={{ color: r.water_level < 20 ? "var(--gold-400)" : "var(--text-muted)" }}>
                  <span className="h-1.5 w-1.5 rounded-full"
                    style={{ background: r.water_level < 20 ? "var(--gold-500)" : "var(--blue-400)" }} />
                  Nước: {r.water_level}%
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Alerts nếu có ── */}
      <AlertsSection deviceId={deviceId} />
    </div>
  );
}

/* ── Alerts ── */
function AlertsSection({ deviceId }: { deviceId: string }) {
  const [alerts, setAlerts] = useState<Array<{ _id: string; type: string; severity: string; message: string; triggeredAt: string }>>([]);

  useEffect(() => {
    fetch(`/api/devices/${deviceId}/alerts?limit=5&unread=true`)
      .then((r) => r.ok ? r.json() : null)
      .then((json) => json?.alerts && setAlerts(json.alerts))
      .catch(() => {});
  }, [deviceId]);

  if (alerts.length === 0) return null;

  return (
    <div className="dark-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <div className="flex items-center gap-2">
          <AlertTriangle size={13} style={{ color: "var(--gold-400)" }} />
          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Cảnh báo chưa đọc</span>
        </div>
        <span className="rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold"
          style={{ background: "rgba(245,158,11,0.12)", color: "var(--gold-400)", border: "1px solid rgba(245,158,11,0.20)" }}>
          {alerts.length}
        </span>
      </div>
      <div>
        {alerts.map((a, i) => (
          <div key={a._id} className={`flex items-start gap-3 px-4 py-3 ${i < alerts.length - 1 ? "border-b" : ""}`}
            style={{ borderColor: "var(--border-subtle)" }}>
            <div className="mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0"
              style={{ background: a.severity === "danger" ? "var(--danger)" : "var(--gold-500)" }} />
            <div className="flex-1 min-w-0">
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{a.message}</p>
              <p className="mt-0.5 font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>
                {new Date(a.triggeredAt).toLocaleString("vi-VN")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
