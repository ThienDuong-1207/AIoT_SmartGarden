import {
  ScanEye, CheckCircle, AlertTriangle, XCircle,
  Calendar, Filter, TrendingUp, Leaf,
} from "lucide-react";

const AI_RECORDS = [
  {
    id: "diag-001",
    date: "2026-03-21 14:30",
    status: "healthy",
    disease: null,
    confidence: 94,
    sensorCtx: { tds: 1150, ph: 6.2, temp: 24.3 },
    diagnosis: "Cây phát triển bình thường",
    recommendation: "Duy trì chế độ dinh dưỡng và ánh sáng hiện tại.",
    model: "YOLOv8",
  },
  {
    id: "diag-002",
    date: "2026-03-21 08:30",
    status: "warning",
    disease: "Yellow_Leaf",
    confidence: 87,
    sensorCtx: { tds: 450, ph: 7.1, temp: 25.0 },
    diagnosis: "Vàng lá — Nghi ngờ thiếu sắt (Fe) do pH cao",
    recommendation: "Điều chỉnh pH xuống 5.8–6.2, bổ sung chelate sắt.",
    model: "YOLOv8",
  },
  {
    id: "diag-003",
    date: "2026-03-20 20:30",
    status: "healthy",
    disease: null,
    confidence: 91,
    sensorCtx: { tds: 1100, ph: 6.0, temp: 23.8 },
    diagnosis: "Không phát hiện bệnh",
    recommendation: "Tiếp tục theo dõi, cây đang ổn định.",
    model: "Gemini Vision",
  },
  {
    id: "diag-004",
    date: "2026-03-20 14:30",
    status: "danger",
    disease: "Aphid",
    confidence: 71,
    sensorCtx: { tds: 980, ph: 6.4, temp: 26.5 },
    diagnosis: "Phát hiện rệp sáp (Aphid) — mật độ thấp",
    recommendation: "Phun dung dịch neem oil 0.5%, kiểm tra mặt dưới lá.",
    model: "YOLOv8",
  },
  {
    id: "diag-005",
    date: "2026-03-20 08:30",
    status: "healthy",
    disease: null,
    confidence: 96,
    sensorCtx: { tds: 1200, ph: 6.1, temp: 23.2 },
    diagnosis: "Cây khỏe mạnh, tỷ lệ tăng trưởng tốt",
    recommendation: "Không cần can thiệp.",
    model: "YOLOv8",
  },
  {
    id: "diag-006",
    date: "2026-03-19 20:30",
    status: "warning",
    disease: "Nutrient_Deficiency",
    confidence: 78,
    sensorCtx: { tds: 620, ph: 6.5, temp: 24.0 },
    diagnosis: "TDS thấp — Thiếu dinh dưỡng tổng thể",
    recommendation: "Bổ sung dung dịch A+B, tăng TDS lên 1000–1400 ppm.",
    model: "Gemini Vision",
  },
];

const STATUS_CFG = {
  healthy: { icon: CheckCircle, color: "var(--emerald-400)", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.20)", label: "Healthy" },
  warning: { icon: AlertTriangle, color: "var(--gold-400)", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.20)", label: "Cảnh báo" },
  danger:  { icon: XCircle, color: "#F87171", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.20)", label: "Nguy hiểm" },
};

/* ── Summary stats ── */
const healthy = AI_RECORDS.filter((r) => r.status === "healthy").length;
const warning = AI_RECORDS.filter((r) => r.status === "warning").length;
const danger  = AI_RECORDS.filter((r) => r.status === "danger").length;
const avgConf = Math.round(AI_RECORDS.reduce((s, r) => s + r.confidence, 0) / AI_RECORDS.length);

export default function AILabPage() {
  return (
    <div className="animate-fade-up space-y-5">

      {/* ── Header + Stats ── */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Tổng phân tích", value: AI_RECORDS.length, icon: ScanEye, color: "var(--text-primary)", bg: "rgba(255,255,255,0.05)" },
          { label: "Khỏe mạnh",      value: healthy,           icon: CheckCircle, color: "var(--emerald-400)", bg: "rgba(16,185,129,0.08)" },
          { label: "Cảnh báo",       value: warning,           icon: AlertTriangle, color: "var(--gold-400)", bg: "rgba(245,158,11,0.08)" },
          { label: "Độ chính xác TB",value: `${avgConf}%`,     icon: TrendingUp, color: "#60A5FA", bg: "rgba(59,130,246,0.08)" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="dark-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: bg }}>
                <Icon size={15} style={{ color }} />
              </div>
              <div>
                <p className="text-xl font-black" style={{ color }}>{value}</p>
                <p className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter bar ── */}
      <div
        className="flex flex-wrap items-center gap-2 rounded-xl px-4 py-3"
        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
      >
        <Filter size={13} style={{ color: "var(--text-muted)" }} />
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>Lọc:</span>
        {["Tất cả", "Healthy", "Cảnh báo", "Nguy hiểm"].map((f, i) => (
          <button
            key={f}
            className="rounded-full px-3 py-1 text-xs font-semibold transition-all"
            style={
              i === 0
                ? { background: "rgba(16,185,129,0.12)", color: "var(--emerald-400)", border: "1px solid rgba(16,185,129,0.25)" }
                : { background: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }
            }
          >
            {f}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <Calendar size={12} style={{ color: "var(--text-muted)" }} />
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>7 ngày gần nhất</span>
        </div>
      </div>

      {/* ── Diagnostic cards grid ── */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {AI_RECORDS.map((record) => {
          const cfg = STATUS_CFG[record.status as keyof typeof STATUS_CFG];
          const Icon = cfg.icon;
          return (
            <div
              key={record.id}
              className="overflow-hidden rounded-2xl"
              style={{ background: "var(--bg-elevated)", border: `1px solid ${cfg.border}` }}
            >
              {/* Card header */}
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{ background: cfg.bg, borderBottom: `1px solid ${cfg.border}` }}
              >
                <div className="flex items-center gap-2">
                  <Icon size={14} style={{ color: cfg.color }} />
                  <span className="text-xs font-bold" style={{ color: cfg.color }}>{cfg.label}</span>
                  {record.disease && (
                    <span
                      className="rounded-full px-2 py-0.5 font-mono text-[9px] font-semibold"
                      style={{ background: "rgba(0,0,0,0.25)", color: cfg.color }}
                    >
                      {record.disease}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className="font-mono text-xs font-black"
                    style={{ color: record.confidence >= 90 ? "var(--emerald-400)" : record.confidence >= 75 ? "var(--gold-400)" : "#F87171" }}
                  >
                    {record.confidence}%
                  </span>
                  <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>conf.</span>
                </div>
              </div>

              {/* Image placeholder */}
              <div
                className="relative flex items-center justify-center"
                style={{ height: 120, background: "#06080F" }}
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-15"
                  style={{
                    backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)",
                    backgroundSize: "18px 18px",
                  }}
                />
                {record.disease ? (
                  <div className="z-10 text-center">
                    <AlertTriangle size={20} style={{ color: cfg.color, margin: "0 auto" }} />
                    <p className="mt-1 font-mono text-[9px]" style={{ color: cfg.color }}>
                      {record.disease} detected
                    </p>
                  </div>
                ) : (
                  <div className="z-10 text-center">
                    <Leaf size={20} style={{ color: "var(--emerald-400)", margin: "0 auto" }} />
                    <p className="mt-1 font-mono text-[9px]" style={{ color: "var(--emerald-400)" }}>No disease</p>
                  </div>
                )}
                <div className="absolute right-2 top-2">
                  <span
                    className="rounded-full px-1.5 py-0.5 font-mono text-[8px] font-bold"
                    style={{ background: "rgba(0,0,0,0.6)", color: "var(--text-muted)" }}
                  >
                    {record.model}
                  </span>
                </div>
              </div>

              {/* Sensor context */}
              <div
                className="flex items-center justify-around py-2"
                style={{ borderBottom: "1px solid var(--border-subtle)", borderTop: "1px solid var(--border-subtle)" }}
              >
                {[
                  { label: "TDS", value: `${record.sensorCtx.tds}`, unit: "ppm", color: "var(--blue-400)"    },
                  { label: "pH",  value: `${record.sensorCtx.ph}`,  unit: "",    color: "var(--emerald-400)" },
                  { label: "°C",  value: `${record.sensorCtx.temp}`,unit: "°C",  color: "var(--gold-400)"    },
                ].map(({ label, value, unit, color }) => (
                  <div key={label} className="text-center">
                    <p className="font-mono text-xs font-bold" style={{ color }}>{value}<span className="text-[9px] font-normal">{unit}</span></p>
                    <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>{label}</p>
                  </div>
                ))}
              </div>

              {/* Diagnosis + recommendation */}
              <div className="p-4 space-y-2">
                <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                  {record.diagnosis}
                </p>
                <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  → {record.recommendation}
                </p>
                <p className="font-mono text-[9px]" style={{ color: "var(--text-muted)" }}>{record.date}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
