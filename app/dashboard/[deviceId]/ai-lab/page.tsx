"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AITestUpload from "@/components/dashboard/AITestUpload";
import {
  ScanEye, CheckCircle, AlertTriangle, XCircle,
  Calendar, Filter, TrendingUp, X,
  Droplets, FlaskConical, Thermometer, Wind,
  Activity, BarChart2,
} from "lucide-react";

/* ── Types ── */
type DiagRecord = {
  _id: string;
  deviceId: string;
  capturedAt: string;
  imageUrl: string;
  sensorContext: { tds: number | null; ph: number | null; temperature: number | null; humidity: number | null };
  detections: { class: string; confidence: number; bbox: number[] }[];
  status: "healthy" | "warning" | "danger";
  topDisease: string | null;
  topConfidence: number;
  fusedDiagnosis: string;
  recommendation: string;
  aiModel: string;
  processingMs: number;
};

type DiagDetail = DiagRecord;

const STATUS_CFG = {
  healthy: { icon: CheckCircle,   color: "var(--emerald-400)", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.20)", label: "Healthy"   },
  warning: { icon: AlertTriangle, color: "var(--gold-400)",    bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.20)", label: "Cảnh báo"  },
  danger:  { icon: XCircle,       color: "#F87171",             bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.20)",  label: "Nguy hiểm" },
};

const FILTERS = ["Tất cả", "healthy", "warning", "danger"] as const;
const FILTER_LABELS: Record<string, string> = { "Tất cả": "Tất cả", healthy: "Healthy", warning: "Cảnh báo", danger: "Nguy hiểm" };

function fmt(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

/* ── Detail Modal ── */
function DetailModal({ id, deviceId, onClose }: { id: string; deviceId: string; onClose: () => void }) {
  const [detail, setDetail] = useState<DiagDetail | null>(null);

  useEffect(() => {
    fetch(`/api/devices/${deviceId}/diagnostics/${id}`)
      .then(r => r.json())
      .then(setDetail);
  }, [id, deviceId]);

  if (!detail) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)" }}>
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
    </div>
  );

  const cfg = STATUS_CFG[detail.status];
  const s   = detail.sensorContext;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl"
        style={{ background: "var(--bg-elevated)", border: `1px solid ${cfg.border}`, maxHeight: "90vh", overflowY: "auto" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border-subtle)", background: cfg.bg }}>
          <div className="flex items-center gap-2">
            <cfg.icon size={16} style={{ color: cfg.color }} />
            <span className="font-bold" style={{ color: cfg.color }}>{cfg.label}</span>
            {detail.topDisease && (
              <span className="rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold" style={{ background: "rgba(0,0,0,0.25)", color: cfg.color }}>
                {detail.topDisease}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-lg font-black" style={{ color: cfg.color }}>
              {(detail.topConfidence * 100).toFixed(0)}%
            </span>
            <button onClick={onClose} className="rounded-lg p-1.5" style={{ background: "rgba(255,255,255,0.06)" }}>
              <X size={14} style={{ color: "var(--text-muted)" }} />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {detail.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={detail.imageUrl} alt="capture" className="w-full rounded-xl object-contain" style={{ maxHeight: 320, background: "#06080F" }} />
          )}

          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "TDS",   value: s.tds,         unit: "ppm", icon: Droplets,     color: "var(--blue-400)"    },
              { label: "pH",    value: s.ph,           unit: "",    icon: FlaskConical,  color: "var(--emerald-400)" },
              { label: "Nhiệt", value: s.temperature,  unit: "°C",  icon: Thermometer,  color: "var(--gold-400)"    },
              { label: "Ẩm",    value: s.humidity,     unit: "%",   icon: Wind,         color: "#60A5FA"            },
            ].map(({ label, value, unit, icon: Icon, color }) => (
              <div key={label} className="rounded-xl p-3 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-subtle)" }}>
                <Icon size={13} style={{ color, margin: "0 auto" }} />
                <p className="mt-1.5 font-mono text-sm font-bold" style={{ color }}>
                  {value !== null && value !== undefined ? `${value}${unit}` : "—"}
                </p>
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{label}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl p-4 space-y-2" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: cfg.color }}>Chẩn đoán (AI + Sensor)</p>
            <p className="text-sm font-semibold leading-relaxed" style={{ color: "var(--text-primary)" }}>
              {detail.fusedDiagnosis || detail.topDisease || "Không phát hiện bệnh"}
            </p>
          </div>

          <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)" }}>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Khuyến nghị</p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>{detail.recommendation}</p>
          </div>

          {detail.detections.length > 0 && (
            <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)" }}>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Detections ({detail.detections.length})
              </p>
              <div className="space-y-2">
                {detail.detections.map((d, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="flex-1 font-mono text-xs" style={{ color: "var(--text-secondary)" }}>{d.class}</span>
                    <div className="h-1.5 w-24 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                      <div className="h-full rounded-full" style={{ width: `${d.confidence * 100}%`, background: cfg.color }} />
                    </div>
                    <span className="w-10 text-right font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                      {(d.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between px-1">
            <span className="font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>{detail.aiModel} · {detail.processingMs}ms</span>
            <span className="font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>{fmt(detail.capturedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function AILabPage() {
  const { deviceId } = useParams<{ deviceId: string }>();
  const [records,    setRecords]    = useState<DiagRecord[]>([]);
  const [stats,      setStats]      = useState({ healthy: 0, warning: 0, danger: 0 });
  const [total,      setTotal]      = useState(0);
  const [filter,     setFilter]     = useState<string>("Tất cả");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    const status = filter === "Tất cả" ? "" : `&status=${filter}`;
    const res = await fetch(`/api/devices/${deviceId}/diagnostics?limit=20${status}`);
    const data = await res.json();
    setRecords(data.records ?? []);
    setStats(data.stats   ?? { healthy: 0, warning: 0, danger: 0 });
    setTotal(data.total   ?? 0);
  }, [deviceId, filter]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const avgConf = records.length > 0
    ? Math.round(records.reduce((s, r) => s + r.topConfidence * 100, 0) / records.length)
    : 0;

  const latestRecord = records[0] ?? null;
  const latestCfg    = latestRecord ? STATUS_CFG[latestRecord.status] : null;

  return (
    <div className="animate-fade-up space-y-6">

      {/* Modal */}
      {selectedId && (
        <DetailModal id={selectedId} deviceId={deviceId} onClose={() => setSelectedId(null)} />
      )}

      {/* ══════════════════════════════════════════════
          ROW 1 — Upload (50%) | Thông số phân tích (50%)
      ══════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 gap-6 items-start">

        {/* ── LEFT 50%: AI Test Upload ── */}
        <div className="space-y-0">
          <AITestUpload deviceId={deviceId} onSaved={fetchRecords} />
        </div>

        {/* ── RIGHT 50%: Thông số phân tích ── */}
        <div className="space-y-4">

          {/* Header */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
          >
            <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <BarChart2 size={13} style={{ color: "var(--emerald-400)" }} />
              <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Thông số phân tích</span>
              <span className="ml-auto font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>{total} lần quét</span>
            </div>

            {/* 4 stat cards */}
            <div className="grid grid-cols-2 divide-x divide-y" style={{ borderColor: "var(--border-subtle)" }}>
              {[
                { label: "Tổng phân tích", value: total,                     icon: ScanEye,      color: "var(--text-primary)",  bg: "rgba(255,255,255,0.04)" },
                { label: "Khỏe mạnh",      value: stats.healthy,             icon: CheckCircle,  color: "var(--emerald-400)",   bg: "rgba(16,185,129,0.10)"  },
                { label: "Cần xử lý",      value: stats.warning + stats.danger, icon: AlertTriangle, color: "var(--gold-400)", bg: "rgba(245,158,11,0.10)"  },
                { label: "Độ chính xác TB",value: `${avgConf}%`,             icon: TrendingUp,   color: "#60A5FA",               bg: "rgba(59,130,246,0.10)"  },
              ].map(({ label, value, icon: Icon, color, bg }, i) => (
                <div key={label} className="flex items-center gap-3 px-4 py-3" style={{ borderColor: "var(--border-subtle)", borderWidth: i > 0 ? undefined : 0 }}>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: bg }}>
                    <Icon size={14} style={{ color }} />
                  </div>
                  <div>
                    <p className="text-xl font-black leading-tight" style={{ color }}>{value}</p>
                    <p className="text-[10px] leading-tight" style={{ color: "var(--text-muted)" }}>{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tỉ lệ trạng thái */}
          <div
            className="rounded-2xl p-4 space-y-3"
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
          >
            <div className="flex items-center gap-2">
              <Activity size={12} style={{ color: "var(--text-muted)" }} />
              <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Tỉ lệ trạng thái</span>
            </div>
            {total > 0 ? (
              <div className="space-y-2.5">
                {[
                  { label: "Healthy",    value: stats.healthy,              color: "var(--emerald-400)", bg: "rgba(16,185,129,0.12)" },
                  { label: "Cảnh báo",   value: stats.warning,              color: "var(--gold-400)",    bg: "rgba(245,158,11,0.12)" },
                  { label: "Nguy hiểm",  value: stats.danger,               color: "#F87171",             bg: "rgba(239,68,68,0.12)"  },
                ].map(({ label, value, color, bg }) => {
                  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
                  return (
                    <div key={label}>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-[11px] font-medium" style={{ color: "var(--text-secondary)" }}>{label}</span>
                        <span className="font-mono text-[11px] font-bold" style={{ color }}>{value} <span style={{ color: "var(--text-muted)" }}>({pct}%)</span></span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: "var(--border-subtle)" }}>
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Chưa có dữ liệu phân tích.</p>
            )}
          </div>

          {/* Kết quả gần nhất */}
          {latestRecord && latestCfg && (
            <div
              className="rounded-2xl overflow-hidden cursor-pointer"
              style={{ background: "var(--bg-elevated)", border: `1px solid ${latestCfg.border}` }}
              onClick={() => setSelectedId(latestRecord._id)}
            >
              <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: latestCfg.bg, borderBottom: `1px solid ${latestCfg.border}` }}>
                <latestCfg.icon size={12} style={{ color: latestCfg.color }} />
                <span className="text-xs font-semibold" style={{ color: latestCfg.color }}>Kết quả gần nhất</span>
                <span className="ml-auto font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>{fmt(latestRecord.capturedAt)}</span>
              </div>
              <div className="px-4 py-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                    {latestRecord.topDisease || "Không phát hiện bệnh"}
                  </span>
                  <span className="font-mono text-sm font-black" style={{ color: latestCfg.color }}>
                    {(latestRecord.topConfidence * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="line-clamp-2 text-[11px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {latestRecord.fusedDiagnosis || "—"}
                </p>
                {/* Sensor pills */}
                <div className="flex items-center gap-1.5 pt-0.5">
                  {[
                    { v: latestRecord.sensorContext.tds,         u: "ppm", icon: Droplets,   color: "#60A5FA"            },
                    { v: latestRecord.sensorContext.ph,          u: "pH",  icon: FlaskConical, color: "var(--emerald-400)" },
                    { v: latestRecord.sensorContext.temperature, u: "°C",  icon: Thermometer, color: "var(--gold-400)"    },
                    { v: latestRecord.sensorContext.humidity,    u: "%",   icon: Wind,        color: "var(--cyan-400)"    },
                  ].filter(x => x.v !== null).map(({ v, u, icon: Icon, color }, i) => (
                    <span key={i} className="flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px]" style={{ background: "var(--bg-base)", border: "1px solid var(--border-subtle)", color }}>
                      <Icon size={9} />
                      {v}{u}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          ROW 2 — Lịch sử phân tích (full width)
      ══════════════════════════════════════════════ */}
      <div>
        {/* Section header + filter bar */}
        <div
          className="mb-4 flex flex-wrap items-center gap-2 rounded-xl px-4 py-2.5"
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
        >
          <ScanEye size={12} style={{ color: "var(--emerald-400)" }} />
          <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Lịch sử phân tích</span>
          <div className="mx-2 h-3 w-px" style={{ background: "var(--border-subtle)" }} />
          <Filter size={11} style={{ color: "var(--text-muted)" }} />
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="rounded-full px-3 py-1 text-xs font-semibold transition-all"
              style={
                filter === f
                  ? { background: "rgba(16,185,129,0.12)", color: "var(--emerald-400)", border: "1px solid rgba(16,185,129,0.25)" }
                  : { background: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }
              }
            >
              {FILTER_LABELS[f]}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-1.5">
            <Calendar size={11} style={{ color: "var(--text-muted)" }} />
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>{total} kết quả</span>
          </div>
        </div>

        {/* Cards grid */}
        {records.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl py-20" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
            <ScanEye size={28} style={{ color: "var(--border-normal)" }} />
            <p className="mt-3 text-sm" style={{ color: "var(--text-muted)" }}>
              Chưa có kết quả. Upload ảnh ở trên để bắt đầu.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {records.map((record) => {
              const cfg = STATUS_CFG[record.status];
              const s   = record.sensorContext;
              return (
                <button
                  key={record._id}
                  className="group relative overflow-hidden rounded-2xl text-left transition-all duration-200 hover:scale-[1.01]"
                  style={{ border: `1px solid ${cfg.border}`, height: 220 }}
                  onClick={() => setSelectedId(record._id)}
                >
                  {record.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={record.imageUrl} alt="capture" className="absolute inset-0 h-full w-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 bg-[#06080F]" />
                  )}
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.90) 35%, rgba(0,0,0,0.20) 70%, rgba(0,0,0,0.10) 100%)" }} />

                  {/* Top badges */}
                  <div className="absolute left-3 right-3 top-3 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1" style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, backdropFilter: "blur(8px)" }}>
                      <cfg.icon size={11} style={{ color: cfg.color }} />
                      <span className="text-xs font-bold" style={{ color: cfg.color }}>{cfg.label}</span>
                    </div>
                    <span className="rounded-full px-2.5 py-1 font-mono text-xs font-black" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", color: record.topConfidence >= 0.9 ? "var(--emerald-400)" : record.topConfidence >= 0.75 ? "var(--gold-400)" : "#F87171" }}>
                      {(record.topConfidence * 100).toFixed(0)}%
                    </span>
                  </div>

                  {/* Bottom content */}
                  <div className="absolute inset-x-0 bottom-0 p-3 space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      {[
                        { value: s.tds,        unit: "ppm", color: "#60A5FA"            },
                        { value: s.ph,         unit: "pH",  color: "var(--emerald-400)" },
                        { value: s.temperature, unit: "°C", color: "var(--gold-400)"    },
                      ].map(({ value, unit, color }, i) =>
                        value !== null && value !== undefined ? (
                          <span key={i} className="rounded-full px-1.5 py-0.5 font-mono text-[10px] font-semibold" style={{ background: "rgba(0,0,0,0.55)", color, backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.08)" }}>
                            {value}{unit}
                          </span>
                        ) : null
                      )}
                    </div>
                    <p className="line-clamp-2 text-xs font-semibold leading-snug" style={{ color: "#fff" }}>
                      {record.fusedDiagnosis || (record.topDisease ? `Phát hiện: ${record.topDisease}` : "Không phát hiện bệnh")}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9px]" style={{ color: "rgba(255,255,255,0.35)" }}>{fmt(record.capturedAt)}</span>
                      <span className="text-[10px] font-semibold" style={{ color: cfg.color }}>Xem →</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
