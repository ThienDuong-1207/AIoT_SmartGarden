import SmartAlerts from "@/components/dashboard/SmartAlerts";
import { sampleAlerts } from "@/lib/mock-data";
import {
  Droplets, Thermometer, FlaskConical, Wind,
  Camera, TrendingUp, Activity, Clock,
  CheckCircle, AlertTriangle,
} from "lucide-react";

type Params = Promise<{ deviceId: string }>;

const METRICS = [
  {
    label: "TDS",
    value: "1150", unit: "ppm",
    icon: Droplets, color: "var(--blue-400)",
    iconBg: "rgba(59,130,246,0.10)",
    trend: "+2%", trendUp: true,
    min: 800, max: 1600, current: 1150,
    status: "normal",
  },
  {
    label: "pH",
    value: "6.2", unit: "",
    icon: FlaskConical, color: "var(--emerald-400)",
    iconBg: "rgba(16,185,129,0.10)",
    trend: "Ổn định", trendUp: true,
    min: 5.5, max: 7.0, current: 6.2,
    status: "normal",
  },
  {
    label: "Nhiệt độ",
    value: "24.3", unit: "°C",
    icon: Thermometer, color: "var(--gold-400)",
    iconBg: "rgba(245,158,11,0.10)",
    trend: "+0.2°C", trendUp: true,
    min: 18, max: 32, current: 24.3,
    status: "normal",
  },
  {
    label: "Độ ẩm",
    value: "68", unit: "%",
    icon: Wind, color: "var(--blue-400)",
    iconBg: "rgba(59,130,246,0.10)",
    trend: "-1%", trendUp: false,
    min: 40, max: 90, current: 68,
    status: "normal",
  },
];

function MetricBar({ min, max, current }: { min: number; max: number; current: number }) {
  const pct     = Math.min(100, Math.max(0, ((current - min) / (max - min)) * 100));
  const inRange = pct > 15 && pct < 85;
  return (
    <div className="mt-3 h-1 w-full overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${pct}%`,
          background: inRange
            ? "linear-gradient(90deg, var(--emerald-600), var(--emerald-400))"
            : "linear-gradient(90deg, var(--gold-600), var(--gold-400))",
        }}
      />
    </div>
  );
}

/* ── Sparkline bars (24 bars) ── */
const SPARK = [62,65,70,68,72,75,71,74,78,76,80,77,82,79,83,80,85,82,79,84,87,83,86,88];

export default async function OverviewPage({ params }: { params: Params }) {
  await params; // deviceId available if needed

  return (
    <div className="animate-fade-up space-y-5">

      {/* ── Metric cards 4-col ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {METRICS.map(({ label, value, unit, icon: Icon, color, iconBg, trend, trendUp, min, max, current }) => (
          <div key={label} className="dark-card p-5">
            <div className="flex items-start justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: iconBg, color }}>
                <Icon size={16} />
              </div>
              <span
                className="flex items-center gap-0.5 text-xs font-medium"
                style={{ color: trendUp ? "var(--emerald-400)" : "#F87171" }}
              >
                <TrendingUp size={11} style={{ transform: trendUp ? "none" : "scaleY(-1)" }} />
                {trend}
              </span>
            </div>
            <p className="mt-3 text-3xl font-black" style={{ color }}>
              {value}
              <span className="ml-0.5 text-base font-normal" style={{ color: "var(--text-muted)" }}>{unit}</span>
            </p>
            <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              {label}
            </p>
            <MetricBar min={min} max={max} current={current} />
          </div>
        ))}
      </div>

      {/* ── 2-col: Camera + Chart ── */}
      <div className="grid gap-5 lg:grid-cols-2">

        {/* Camera feed */}
        <div
          className="overflow-hidden rounded-2xl"
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
        >
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid var(--border-subtle)" }}
          >
            <div className="flex items-center gap-2">
              <Camera size={14} style={{ color: "var(--emerald-400)" }} />
              <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Camera Feed
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: "#EF4444" }} />
                <span className="font-mono text-[10px] font-semibold" style={{ color: "var(--text-muted)" }}>
                  LAST CAPTURE
                </span>
              </div>
              <span className="flex items-center gap-1 font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>
                <Clock size={9} />
                14:30 hôm nay
              </span>
            </div>
          </div>

          {/* Camera view area */}
          <div
            className="relative flex items-center justify-center"
            style={{ height: 220, background: "#06080F" }}
          >
            {/* Dot grid */}
            <div
              className="pointer-events-none absolute inset-0 opacity-20"
              style={{
                backgroundImage: "radial-gradient(circle, rgba(59,130,246,0.4) 1px, transparent 1px)",
                backgroundSize: "22px 22px",
              }}
            />
            {/* Corner brackets */}
            {[
              { top: 12, left: 12, bT: true, bL: true },
              { top: 12, right: 12, bT: true, bR: true },
              { bottom: 12, left: 12, bB: true, bL: true },
              { bottom: 12, right: 12, bB: true, bR: true },
            ].map((p, i) => (
              <div
                key={i}
                className="absolute h-5 w-5"
                style={{
                  top: p.top, left: p.left, right: p.right, bottom: p.bottom,
                  borderTop:    p.bT ? "1.5px solid #3B82F6" : undefined,
                  borderLeft:   p.bL ? "1.5px solid #3B82F6" : undefined,
                  borderRight:  p.bR ? "1.5px solid #3B82F6" : undefined,
                  borderBottom: p.bB ? "1.5px solid #3B82F6" : undefined,
                }}
              />
            ))}

            {/* AI Result overlay */}
            <div className="relative z-10 text-center">
              <div
                className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl"
                style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)" }}
              >
                <CheckCircle size={22} style={{ color: "var(--emerald-400)" }} />
              </div>
              <p className="text-sm font-bold" style={{ color: "var(--emerald-400)" }}>Cây đang phát triển tốt</p>
              <p className="mt-1 font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>
                YOLOv8 · confidence 94% · 14:30
              </p>
            </div>

            {/* Bottom status bar */}
            <div
              className="absolute inset-x-0 bottom-0 flex items-center justify-between px-4 py-2"
              style={{ background: "rgba(0,0,0,0.60)" }}
            >
              <span className="font-mono text-[9px]" style={{ color: "#60A5FA" }}>CAM_01 · OV2640</span>
              <span className="font-mono text-[9px]" style={{ color: "var(--emerald-400)" }}>0 alerts</span>
            </div>
          </div>

          {/* AI reasoning footer */}
          <div
            className="flex items-start gap-3 px-5 py-3.5"
            style={{ borderTop: "1px solid var(--border-subtle)", background: "rgba(16,185,129,0.03)" }}
          >
            <CheckCircle size={13} style={{ color: "var(--emerald-500)", marginTop: 1, flexShrink: 0 }} />
            <div className="min-w-0">
              <p className="text-xs font-medium" style={{ color: "var(--emerald-400)" }}>
                AI Reasoning: Màu lá xanh đậm, hình dạng bình thường. Không phát hiện bệnh.
              </p>
              <p className="mt-0.5 font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>
                Gemini Vision · TDS=1150 · pH=6.2 → trạng thái tốt
              </p>
            </div>
          </div>
        </div>

        {/* Nutrient 24h Chart */}
        <div
          className="overflow-hidden rounded-2xl"
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
        >
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid var(--border-subtle)" }}
          >
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Nutrient Stability · 24h
              </p>
              <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>TDS · pH · Nhiệt độ</p>
            </div>
            <div className="flex items-center gap-3">
              {[
                { label: "TDS",  color: "var(--blue-400)"    },
                { label: "pH",   color: "var(--emerald-400)" },
                { label: "Temp", color: "var(--gold-400)"    },
              ].map(({ label, color }) => (
                <span key={label} className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
                  <span className="h-2 w-2 rounded-full" style={{ background: color }} />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Sparkline bars */}
          <div className="px-5 pt-5">
            <div className="flex items-end gap-1" style={{ height: 120 }}>
              {SPARK.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm"
                  style={{
                    height: `${h}%`,
                    background: i >= 20
                      ? "var(--emerald-500)"
                      : i >= 14
                      ? "rgba(16,185,129,0.40)"
                      : "rgba(16,185,129,0.18)",
                    transition: "height 0.3s ease",
                  }}
                />
              ))}
            </div>
            <div className="mt-2 flex justify-between pb-4">
              <span className="font-mono text-[9px]" style={{ color: "var(--text-muted)" }}>00:00</span>
              <span className="font-mono text-[9px]" style={{ color: "var(--text-muted)" }}>06:00</span>
              <span className="font-mono text-[9px]" style={{ color: "var(--text-muted)" }}>12:00</span>
              <span className="font-mono text-[9px]" style={{ color: "var(--text-muted)" }}>18:00</span>
              <span className="font-mono text-[9px]" style={{ color: "var(--emerald-500)" }}>Now</span>
            </div>
          </div>

          {/* Summary stats */}
          <div
            className="grid grid-cols-3 divide-x px-0"
            style={{
              borderTop: "1px solid var(--border-subtle)",
              borderColor: "var(--border-subtle)",
            }}
          >
            {[
              { label: "TDS TB",    value: "1148 ppm", color: "var(--blue-400)"    },
              { label: "pH TB",     value: "6.15",     color: "var(--emerald-400)" },
              { label: "Temp TB",   value: "24.1 °C",  color: "var(--gold-400)"   },
            ].map(({ label, value, color }) => (
              <div key={label} className="px-4 py-3 text-center" style={{ borderColor: "var(--border-subtle)" }}>
                <p className="text-xs font-bold" style={{ color }}>{value}</p>
                <p className="mt-0.5 text-[10px]" style={{ color: "var(--text-muted)" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Activity strip ── */}
      <div
        className="flex flex-wrap items-center gap-6 rounded-2xl px-5 py-3.5"
        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
      >
        <div className="flex items-center gap-2">
          <Activity size={13} style={{ color: "var(--emerald-500)" }} />
          <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>Cập nhật lần cuối:</span>
          <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>30 giây trước</span>
        </div>
        <div className="h-4 w-px" style={{ background: "var(--border-subtle)" }} />
        <div className="flex items-center gap-2">
          <AlertTriangle size={13} style={{ color: "var(--gold-400)" }} />
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            <span className="font-semibold" style={{ color: "var(--text-primary)" }}>1</span> cảnh báo đang chờ xử lý
          </span>
        </div>
        <div className="h-4 w-px" style={{ background: "var(--border-subtle)" }} />
        <div className="flex items-center gap-2">
          <Camera size={13} style={{ color: "var(--text-muted)" }} />
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            Lịch chụp tiếp theo: <span className="font-mono" style={{ color: "var(--text-secondary)" }}>20:30</span>
          </span>
        </div>
      </div>

      {/* ── Smart Alerts ── */}
      <SmartAlerts alerts={sampleAlerts} />
    </div>
  );
}
