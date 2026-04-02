"use client";

import Link from "next/link";
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
interface ChartReading { timestamp: string; temp?: number; tds_ppm?: number; ph?: number; light_status?: boolean; }
interface DeviceConfigView {
  pump?: {
    status?: boolean;
    lastActivated?: string;
  };
  light?: {
    status?: boolean;
    brightness?: number;
  };
  watering?: {
    autoMode?: boolean;
    intervalHours?: number;
    schedule?: Array<{ time?: string; durationMinutes?: number; enabled?: boolean }>;
  };
  sensor?: {
    calibrationMode?: boolean;
    calibratingType?: string | null;
    lastCalibrated?: string;
  };
  operationEvents?: Array<{
    type?: string;
    timestamp?: string;
    meta?: { sensorType?: string; scheduleCount?: number };
  }>;
}

type RangeOption = "6h" | "24h" | "7d";
type SeriesKey = "tds" | "ph" | "temp";

/* ── Helpers ── */
function timeAgo(dateStr?: string) {
  if (!dateStr) return "—";
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
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
            {inRange ? "●  In Range" : "⚠  Check Required"}
          </span>
          <span>{max}{unit}</span>
        </div>
      </div>
    </div>
  );
}

function clamp(num: number, min: number, max: number) {
  return Math.min(max, Math.max(min, num));
}

function normalizeByThreshold(value: number, min: number, max: number) {
  const span = Math.max(1, max - min);
  const pad = span * 0.5;
  const domainMin = min - pad;
  const domainMax = max + pad;
  return clamp(((value - domainMin) / (domainMax - domainMin)) * 100, 0, 100);
}

function MultiLineTrendChart({
  readings,
  thresholds,
  visible,
  markers,
}: {
  readings: ChartReading[];
  thresholds: { tds: { min: number; max: number }; ph: { min: number; max: number }; temp: { min: number; max: number } };
  visible: Record<SeriesKey, boolean>;
  markers: Array<{ type: string; timestamp: string; label: string; color: string }>;
}) {
  const width = 760;
  const chartHeight = 210;
  const chartReadings = readings.slice(-180);

  const points = chartReadings.map((r, index) => {
    const x = chartReadings.length <= 1 ? 0 : (index / (chartReadings.length - 1)) * width;
    return {
      x,
      tds: typeof r.tds_ppm === "number" && Number.isFinite(r.tds_ppm)
        ? normalizeByThreshold(r.tds_ppm, thresholds.tds.min, thresholds.tds.max)
        : null,
      ph: typeof r.ph === "number" && Number.isFinite(r.ph)
        ? normalizeByThreshold(r.ph, thresholds.ph.min, thresholds.ph.max)
        : null,
      temp: typeof r.temp === "number" && Number.isFinite(r.temp)
        ? normalizeByThreshold(r.temp, thresholds.temp.min, thresholds.temp.max)
        : null,
    };
  });

  const toPolyline = (key: SeriesKey) =>
    points
      .filter((p) => p[key] != null)
      .map((p) => `${p.x},${chartHeight - ((p[key] as number) / 100) * chartHeight}`)
      .join(" ");

  const hasAnySeries = points.some((p) => p.tds != null || p.ph != null || p.temp != null);

  const safeTopY = chartHeight - 75 / 100 * chartHeight;
  const safeBottomY = chartHeight - 25 / 100 * chartHeight;

  const firstTs = chartReadings[0]?.timestamp ? new Date(chartReadings[0].timestamp).getTime() : undefined;
  const lastTs = chartReadings[chartReadings.length - 1]?.timestamp ? new Date(chartReadings[chartReadings.length - 1].timestamp).getTime() : undefined;
  const markerItems = markers
    .filter((m) => {
      const ts = new Date(m.timestamp).getTime();
      return Number.isFinite(ts) && firstTs != null && lastTs != null && ts >= firstTs && ts <= lastTs;
    })
    .slice(-12)
    .map((m) => {
      const ts = new Date(m.timestamp).getTime();
      const x = firstTs === lastTs ? width : ((ts - (firstTs as number)) / ((lastTs as number) - (firstTs as number))) * width;
      return { ...m, x };
    });

  return (
    <div className="space-y-3">
      <div className="rounded-lg p-3" style={{ background: "var(--bg-base)", border: "1px solid var(--border-subtle)" }}>
        <div>
          <svg className="w-full" height={chartHeight} viewBox={`0 0 ${width} ${chartHeight}`} fill="none" preserveAspectRatio="none">
            <rect x="0" y="0" width={width} height={chartHeight} rx="4" fill="rgba(255,255,255,0.02)" />
            <rect x="0" y={safeTopY} width={width} height={Math.max(1, safeBottomY - safeTopY)} fill="rgba(16,185,129,0.12)" />
            <line x1={0} x2={width} y1={safeTopY} y2={safeTopY} stroke="rgba(16,185,129,0.7)" strokeDasharray="4 4" />
            <line x1={0} x2={width} y1={safeBottomY} y2={safeBottomY} stroke="rgba(16,185,129,0.7)" strokeDasharray="4 4" />

            {[0.25, 0.5, 0.75].map((f, idx) => {
              const y = chartHeight * f;
              return <line key={idx} x1={0} x2={width} y1={y} y2={y} stroke="rgba(255,255,255,0.10)" strokeDasharray="3 4" />;
            })}

            {visible.tds && <polyline points={toPolyline("tds")} stroke="var(--blue-400)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
            {visible.ph && <polyline points={toPolyline("ph")} stroke="var(--emerald-400)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
            {visible.temp && <polyline points={toPolyline("temp")} stroke="var(--gold-400)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
          </svg>
        </div>

        {!hasAnySeries && (
          <p className="mt-2 text-[11px]" style={{ color: "var(--text-muted)" }}>
            No valid sensor points in selected range
          </p>
        )}

        <div className="mt-2 flex justify-between text-[10px]" style={{ color: "var(--text-muted)" }}>
          <span>TDS: {thresholds.tds.min}-{thresholds.tds.max}ppm</span>
          <span>pH: {thresholds.ph.min}-{thresholds.ph.max}</span>
          <span>Temp: {thresholds.temp.min}-{thresholds.temp.max}°C</span>
        </div>
      </div>

      <div className="rounded-lg p-3" style={{ background: "var(--bg-base)", border: "1px solid var(--border-subtle)" }}>
        <p className="mb-2 text-xs font-semibold" style={{ color: "var(--text-primary)" }}>Operation Timeline</p>
        {markerItems.length === 0 ? (
          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>No operation events in selected range</p>
        ) : (
          <>
            <div className="relative h-10">
              <div className="absolute left-0 right-0 top-4 h-[2px]" style={{ background: "var(--border-subtle)" }} />
              {markerItems.map((m, idx) => (
                <div key={`${m.type}-${idx}`} className="absolute -translate-x-1/2" style={{ left: `${(m.x / width) * 100}%`, top: 0 }}>
                  <div className="h-3 w-3 rounded-full" style={{ background: m.color }} />
                    <div className="mt-1 whitespace-nowrap text-[10px] sm:text-[9px]" style={{ color: "var(--text-muted)" }}>{m.label}</div>
                  </div>
                ))}
              </div>

              <div className="mt-1 flex justify-between text-[10px] sm:text-[9px]" style={{ color: "var(--text-muted)" }}>
                <span>{chartReadings[0]?.timestamp ? new Date(chartReadings[0].timestamp).toLocaleTimeString("en-US") : "—"}</span>
                <span>{chartReadings[chartReadings.length - 1]?.timestamp ? new Date(chartReadings[chartReadings.length - 1].timestamp).toLocaleTimeString("en-US") : "—"}</span>
              </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function OverviewPage() {
  const params   = useParams();
  const deviceId = params.deviceId as string;

  const [data, setData]     = useState<LatestData | null>(null);
  const [charts, setCharts] = useState<ChartReading[]>([]);
  const [config, setConfig] = useState<DeviceConfigView | null>(null);
  const [range, setRange] = useState<RangeOption>("24h");
  const [visibleSeries, setVisibleSeries] = useState<Record<SeriesKey, boolean>>({ tds: true, ph: true, temp: true });
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const safeTimeAgo = (dateStr?: string) => (isClient ? timeAgo(dateStr) : "—");
  const safeLocaleDateTime = (dateStr?: string) => (isClient && dateStr ? new Date(dateStr).toLocaleString("en-US") : "—");
  const safeLocaleTime = (dateStr?: string) => (isClient && dateStr ? new Date(dateStr).toLocaleTimeString("en-US") : "—");

  const normalizeReadings = (items: unknown[]): ChartReading[] => {
    return items
      .map((item) => {
        const r = item as Record<string, unknown>;
        const toFiniteOrUndefined = (v: unknown) => {
          const n = typeof v === "number" ? v : Number(v);
          return Number.isFinite(n) ? n : undefined;
        };
        return {
          timestamp: String(r.timestamp ?? ""),
          tds_ppm: toFiniteOrUndefined(r.tds_ppm),
          ph: toFiniteOrUndefined(r.ph),
          temp: toFiniteOrUndefined(r.temp),
          light_status: typeof r.light_status === "boolean" ? r.light_status : undefined,
        };
      })
      .filter((r) => !!r.timestamp && (r.tds_ppm != null || r.ph != null || r.temp != null));
  };

  const toggleSeries = (key: SeriesKey) => {
    setVisibleSeries((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (!next.tds && !next.ph && !next.temp) {
        return prev; // keep at least one line visible
      }
      return next;
    });
  };

  useEffect(() => {
    async function load() {
      try {
        const limits: Record<RangeOption, number> = { "6h": 120, "24h": 320, "7d": 500 };
        const [lRes, cRes, cfgRes] = await Promise.all([
          fetch(`/api/devices/${deviceId}/latest`),
          fetch(`/api/devices/${deviceId}/readings?range=${range}&limit=${limits[range]}`),
          fetch(`/api/devices/${deviceId}/config`),
        ]);
        const latestJson = lRes.ok ? await lRes.json() : null;
        if (latestJson) setData(latestJson);

        if (cRes.ok) {
          const chartJson = await cRes.json();
          setCharts(normalizeReadings(chartJson.readings ?? []));
        } else if (latestJson?.reading?.timestamp) {
          setCharts(normalizeReadings([latestJson.reading]));
        } else {
          setCharts([]);
        }

        if (cfgRes.ok) {
          const cfgJson = await cfgRes.json();
          setConfig(cfgJson.config ?? null);
        }
      } catch { /* fallback to empty */ }
      finally    { setLoading(false); }
    }
    load();
    const t = setInterval(load, 30_000);
    return () => clearInterval(t);
  }, [deviceId, range]);

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
      label: "Temperature", value: r?.temp != null ? r.temp.toFixed(1) : "—", unit: "°C",
      icon: Thermometer, color: "var(--gold-400)", iconBg: "rgba(245,158,11,0.12)",
      min: thr?.temp?.min ?? 18, max: thr?.temp?.max ?? 32,
      sparkVals: sparkOf("temp"),
    },
    {
      label: "Humidity", value: r?.humi != null ? r.humi.toFixed(0) : "—", unit: "%",
      icon: Wind, color: "var(--cyan-400)", iconBg: "rgba(6,182,212,0.12)",
      min: 40, max: 90,
      sparkVals: charts.slice(-12).map((c) => (c as unknown as { humi?: number }).humi ?? 0).filter(Boolean),
    },
  ];

  function avg(key: keyof ChartReading) {
    const vals = charts.map((c) => c[key] as number).filter((v) => v != null && v > 0);
    return vals.length ? (vals.reduce((s, v) => s + v, 0) / vals.length) : null;
  }

  const thresholdSet = {
    tds: { min: thr?.tds?.min ?? 800, max: thr?.tds?.max ?? 1800 },
    ph: { min: thr?.ph?.min ?? 5.5, max: thr?.ph?.max ?? 7.0 },
    temp: { min: thr?.temp?.min ?? 18, max: thr?.temp?.max ?? 32 },
  };

  const chartStartTs = charts[0]?.timestamp;
  const chartEndTs = charts[charts.length - 1]?.timestamp;
  const validCounts = {
    tds: charts.filter((c) => typeof c.tds_ppm === "number" && Number.isFinite(c.tds_ppm)).length,
    ph: charts.filter((c) => typeof c.ph === "number" && Number.isFinite(c.ph)).length,
    temp: charts.filter((c) => typeof c.temp === "number" && Number.isFinite(c.temp)).length,
  };

  const lightTransitionMarkers = charts
    .filter((_, idx, arr) => idx > 0 && arr[idx - 1].light_status !== arr[idx].light_status)
    .map((r) => ({
      type: r.light_status ? "light_on" : "light_off",
      timestamp: r.timestamp,
      label: r.light_status ? "Light ON" : "Light OFF",
      color: "#FBBF24",
    }));

  const configMarkers = (config?.operationEvents ?? [])
    .filter((e) => e.type && e.timestamp)
    .map((e) => {
      const type = e.type as string;
      const labelMap: Record<string, string> = {
        pump_on: "Pump ON",
        pump_off: "Pump OFF",
        light_on: "Light ON",
        light_off: "Light OFF",
        light_preset_changed: "Light preset",
        calibration_start: `Calib start ${e.meta?.sensorType ?? ""}`.trim(),
        calibration_complete: `Calib done ${e.meta?.sensorType ?? ""}`.trim(),
      };
      const colorMap: Record<string, string> = {
        pump_on: "#22C55E",
        pump_off: "#94A3B8",
        light_on: "#FBBF24",
        light_off: "#94A3B8",
        light_preset_changed: "#60A5FA",
        calibration_start: "#FB923C",
        calibration_complete: "#10B981",
      };

      return {
        type,
        timestamp: e.timestamp as string,
        label: labelMap[type] ?? type,
        color: colorMap[type] ?? "#CBD5E1",
      };
    });

  const eventMarkers = [...configMarkers, ...lightTransitionMarkers]
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  if (!isClient) {
    return (
      <div className="animate-fade-up space-y-4">
        <div
          className="flex items-center justify-between rounded-xl px-4 py-2.5"
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
        >
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>Preparing overview…</span>
          <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>Syncing client view</span>
        </div>
      </div>
    );
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
            Updated: <span className="font-mono" style={{ color: "var(--text-secondary)" }}>{safeTimeAgo(r?.timestamp)}</span>
          </span>
        </div>
        {(data?.unreadAlerts ?? 0) > 0 && (
          <>
            <div className="h-3 w-px" style={{ background: "var(--border-subtle)" }} />
            <div className="flex items-center gap-1.5">
              <AlertTriangle size={11} style={{ color: "var(--gold-400)" }} />
              <span className="text-xs font-semibold" style={{ color: "var(--gold-400)" }}>
                {data?.unreadAlerts} alerts
              </span>
            </div>
          </>
        )}
        {loading && (
          <div className="ml-auto flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: "var(--emerald-400)" }} />
            <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>Loading…</span>
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
          <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Sensor Trends · {range.toUpperCase()} · {deviceId}
              </p>
              <p className="section-label mt-0.5">
                {charts.length > 0
                  ? `${charts.length} data points from DB · ${safeLocaleDateTime(chartStartTs)} → ${safeLocaleDateTime(chartEndTs)}`
                  : "No data"}
              </p>
              <p className="mt-1 text-[11px] sm:text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
                Valid points · TDS: {validCounts.tds} · pH: {validCounts.ph} · Temp: {validCounts.temp}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {(["6h", "24h", "7d"] as RangeOption[]).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setRange(opt)}
                  className="rounded-md px-2 py-1 text-[11px] sm:text-[10px] font-semibold"
                  style={{
                    color: range === opt ? "var(--emerald-400)" : "var(--text-muted)",
                    background: range === opt ? "rgba(16,185,129,0.10)" : "var(--bg-base)",
                    border: range === opt ? "1px solid rgba(16,185,129,0.25)" : "1px solid var(--border-subtle)",
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="px-4 pt-4 pb-2">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {([
                { key: "tds", label: "TDS", color: "var(--blue-400)" },
                { key: "ph", label: "pH", color: "var(--emerald-400)" },
                { key: "temp", label: "Temp", color: "var(--gold-400)" },
              ] as Array<{ key: SeriesKey; label: string; color: string }>).map((s) => (
                <button
                  key={s.key}
                  onClick={() => toggleSeries(s.key)}
                  className="rounded-full px-2.5 py-1 text-[11px] sm:text-[10px]"
                  style={{
                    color: visibleSeries[s.key] ? s.color : "var(--text-muted)",
                    background: visibleSeries[s.key] ? "rgba(255,255,255,0.06)" : "var(--bg-base)",
                    border: `1px solid ${visibleSeries[s.key] ? "rgba(255,255,255,0.14)" : "var(--border-subtle)"}`,
                  }}
                >
                  <span style={{ color: s.color }}>●</span> {s.label}
                </button>
              ))}
            </div>

            <MultiLineTrendChart
              readings={charts}
              thresholds={thresholdSet}
              visible={visibleSeries}
              markers={eventMarkers}
            />

            <div className="mt-2 flex justify-between text-[10px] sm:text-[9px] font-mono" style={{ color: "var(--text-muted)" }}>
              <span>{range} ago</span>
              <span>Safe zone highlighted</span>
              <span style={{ color: "var(--emerald-400)" }}>Now</span>
            </div>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-1 divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0" style={{ borderTop: "1px solid var(--border-subtle)", borderColor: "var(--border-subtle)" }}>
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

      {/* ── Operation Snapshot ── */}
      <div className="dark-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Operation Snapshot
          </p>
          <Link
            href={`/dashboard/${deviceId}/controls`}
            className="rounded-md px-2.5 py-1 text-[11px] font-semibold"
            style={{
              color: "var(--emerald-400)",
              background: "rgba(16,185,129,0.12)",
              border: "1px solid rgba(16,185,129,0.22)",
            }}
          >
            Go to Full Controls
          </Link>
        </div>

        <div className="grid gap-3 p-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg p-3" style={{ background: "var(--bg-base)", border: "1px solid var(--border-subtle)" }}>
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Pump</p>
            <p className="text-xs font-semibold" style={{ color: config?.pump?.status ? "var(--emerald-400)" : "var(--text-secondary)" }}>
              {config?.pump?.status ? "ON" : "OFF"}
            </p>
            <p className="mt-1 text-[10px]" style={{ color: "var(--text-muted)" }}>
              Last activated: {safeTimeAgo(config?.pump?.lastActivated)}
            </p>
          </div>

          <div className="rounded-lg p-3" style={{ background: "var(--bg-base)", border: "1px solid var(--border-subtle)" }}>
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Light</p>
            <p className="text-xs font-semibold" style={{ color: config?.light?.status ? "var(--gold-400)" : "var(--text-secondary)" }}>
              {config?.light?.status ? "ON" : "OFF"} · {config?.light?.brightness ?? 0}%
            </p>
            <p className="mt-1 text-[10px]" style={{ color: "var(--text-muted)" }}>
              Adjust from controls tab
            </p>
          </div>

          <div className="rounded-lg p-3" style={{ background: "var(--bg-base)", border: "1px solid var(--border-subtle)" }}>
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Watering</p>
            <p className="text-xs font-semibold" style={{ color: config?.watering?.autoMode ? "var(--blue-400)" : "var(--text-secondary)" }}>
              {config?.watering?.autoMode ? "AUTO" : "MANUAL"} · Every {config?.watering?.intervalHours ?? 6}h
            </p>
            <p className="mt-1 text-[10px]" style={{ color: "var(--text-muted)" }}>
              Slots: {config?.watering?.schedule?.length ?? 0}
            </p>
          </div>

          <div className="rounded-lg p-3" style={{ background: "var(--bg-base)", border: "1px solid var(--border-subtle)" }}>
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Calibration</p>
            <p className="text-xs font-semibold" style={{ color: config?.sensor?.calibrationMode ? "#FB923C" : "var(--emerald-400)" }}>
              {config?.sensor?.calibrationMode ? `ACTIVE (${config?.sensor?.calibratingType ?? "-"})` : "IDLE"}
            </p>
            <p className="mt-1 text-[10px]" style={{ color: "var(--text-muted)" }}>
              Last: {safeTimeAgo(config?.sensor?.lastCalibrated)}
            </p>
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
            <span className="font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>{safeTimeAgo(r?.timestamp)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-4 p-4 sm:flex-row">
          {/* Camera preview */}
          <div className="relative flex h-40 w-full shrink-0 items-center justify-center overflow-hidden rounded-lg sm:w-56"
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
                  : "No data received. Make sure your ESP32 is connected."
                }
              </p>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1.5 text-[10px]" style={{ color: "var(--text-muted)" }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--emerald-400)" }} />
                Last: {safeTimeAgo(r?.timestamp)}
              </div>
              <div className="flex items-center gap-1.5 text-[10px]" style={{ color: "var(--text-muted)" }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: r?.light_status ? "var(--gold-400)" : "var(--border-subtle)" }} />
                Light: {r?.light_status ? "On" : "Off"}
              </div>
              {r?.water_level != null && (
                <div className="flex items-center gap-1.5 text-[10px]" style={{ color: r.water_level < 20 ? "var(--gold-400)" : "var(--text-muted)" }}>
                  <span className="h-1.5 w-1.5 rounded-full"
                    style={{ background: r.water_level < 20 ? "var(--gold-500)" : "var(--blue-400)" }} />
                  Water level: {r.water_level}%
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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const safeAlertTime = (dateStr?: string) => (isClient && dateStr ? new Date(dateStr).toLocaleString("en-US") : "—");

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
          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Unread Alerts</span>
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
                {safeAlertTime(a.triggeredAt)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
