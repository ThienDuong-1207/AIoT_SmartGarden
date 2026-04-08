"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AITestUpload from "@/components/dashboard/AITestUpload";
import {
  ScanEye, CheckCircle, AlertTriangle, XCircle,
  Calendar, Filter, TrendingUp, X,
  Droplets, FlaskConical, Thermometer, Wind,
  Activity, BarChart2, Loader2,
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
  warning: { icon: AlertTriangle, color: "var(--gold-400)",    bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.20)", label: "Warning"   },
  danger:  { icon: XCircle,       color: "#F87171",             bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.20)",  label: "Danger"    },
};

const FILTERS = ["All", "healthy", "warning", "danger"] as const;
const FILTER_LABELS: Record<string, string> = { "All": "All", healthy: "Healthy", warning: "Warning", danger: "Danger" };

// Ollama 7-day treatment plan - single mode, no goal tabs

function riskLabel(score: number) {
  if (score >= 70) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}

function riskColor(score: number) {
  if (score >= 70) return "#F87171";
  if (score >= 40) return "var(--gold-400)";
  return "var(--emerald-400)";
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function getCriticalMetric(tds: number | null, ph: number | null, temp: number | null, humidity: number | null) {
  const metrics: Array<{ name: string; value: number; min: number; max: number; unit: string; status: string }> = [];
  
  if (tds != null) {
    const status = tds < 600 || tds > 2000 ? "danger" : tds < 800 || tds > 1800 ? "warning" : "normal";
    metrics.push({ name: "TDS", value: tds, min: 800, max: 1400, unit: "ppm", status });
  }
  if (ph != null) {
    const status = ph < 5.5 || ph > 6.8 ? "danger" : ph < 5.8 || ph > 6.5 ? "warning" : "normal";
    metrics.push({ name: "pH", value: ph, min: 5.8, max: 6.5, unit: "", status });
  }
  if (temp != null) {
    const status = temp > 31 || temp < 16 ? "danger" : temp > 28 || temp < 18 ? "warning" : "normal";
    metrics.push({ name: "Temp", value: temp, min: 18, max: 26, unit: "°C", status });
  }
  if (humidity != null) {
    const status = humidity > 82 ? "danger" : humidity > 70 ? "warning" : "normal";
    metrics.push({ name: "Humidity", value: humidity, min: 60, max: 80, unit: "%", status });
  }
  
  // Return the most critical metric (danger > warning > normal)
  const dangerous = metrics.find(m => m.status === "danger");
  const warning = metrics.find(m => m.status === "warning");
  return dangerous || warning || metrics[0] || null;
}

function getImmediateAction(
  dominantFactor: string,
  tds: number | null,
  ph: number | null,
  temp: number | null,
  humidity: number | null,
  featureImportance: Record<string, number>
) {
  // If dominant factor has no data (importance 0), show generic action
  if (featureImportance[dominantFactor] === 0) {
    return "⏳ Waiting for sensor data. Complete readings to enable targeted recommendations.";
  }

  if (dominantFactor === "temperature") {
    if (temp != null && temp > 28) return "🔥 Reduce grow light intensity by 15% to lower temperature to 24-26°C";
    if (temp != null && temp < 18) return "❄️ Increase temperature using heater or reduce ventilation";
  }
  if (dominantFactor === "tds") {
    if (tds != null && tds > 1800) return "⚗️ Water change recommended: TDS too high. Replace 30-50% of nutrient solution";
    if (tds != null && tds < 800) return "⚗️ Add nutrients: Increase TDS to 1000-1400 ppm using A+B solution";
  }
  if (dominantFactor === "ph") {
    if (ph != null && ph > 6.5) return "⚖️ Adjust pH down to 5.8-6.2 using pH Down";
    if (ph != null && ph < 5.8) return "⚖️ Raise pH to 6.0-6.3 using pH Up";
  }
  if (dominantFactor === "humidity") {
    if (humidity != null && humidity > 75) return "💧 Increase ventilation/air circulation to reduce humidity";
    if (humidity != null && humidity < 60) return "💧 Reduce ventilation or add humidifier";
  }
  return "📋 Continue monitoring and recording data";
}

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

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "TDS",   value: s.tds,         unit: "ppm", icon: Droplets,     color: "var(--blue-400)"    },
              { label: "pH",    value: s.ph,           unit: "",    icon: FlaskConical,  color: "var(--emerald-400)" },
              { label: "Temp",  value: s.temperature,  unit: "°C",  icon: Thermometer,  color: "var(--gold-400)"    },
              { label: "Hum",   value: s.humidity,     unit: "%",   icon: Wind,         color: "#60A5FA"            },
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
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: cfg.color }}>Diagnosis (AI + Sensor)</p>
            <p className="text-sm font-semibold leading-relaxed" style={{ color: "var(--text-primary)" }}>
              {detail.fusedDiagnosis || detail.topDisease || "No disease detected"}
            </p>
          </div>

          <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)" }}>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Recommendation</p>
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
  const [mounted, setMounted] = useState(false);
  const [hasAnalysisInSession, setHasAnalysisInSession] = useState(false);
  const [records,    setRecords]    = useState<DiagRecord[]>([]);
  const [latestRecord, setLatestRecord] = useState<DiagRecord | null>(null);
  const [stats,      setStats]      = useState({ healthy: 0, warning: 0, danger: 0 });
  const [total,      setTotal]      = useState(0);
  const [filter,     setFilter]     = useState<string>("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [ollamaPlan, setOllamaPlan] = useState<string[]>([]);
  const [ollamaLoading, setOllamaLoading] = useState(false);
  const [ollamaError, setOllamaError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchRecords = useCallback(async () => {
    const status = filter === "All" ? "" : `&status=${filter}`;
    const res = await fetch(`/api/devices/${deviceId}/diagnostics?limit=20${status}`);
    const data = await res.json();
    setRecords(data.records ?? []);
    setStats(data.stats   ?? { healthy: 0, warning: 0, danger: 0 });
    setTotal(data.total   ?? 0);
  }, [deviceId, filter]);

  const fetchLatestRecord = useCallback(async () => {
    const res = await fetch(`/api/devices/${deviceId}/diagnostics?limit=1`);
    const data = await res.json();
    const latest = (data.records?.[0] ?? null) as DiagRecord | null;
    setLatestRecord(latest);
  }, [deviceId]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);
  useEffect(() => { fetchLatestRecord(); }, [fetchLatestRecord]);

  const avgConf = records.length > 0
    ? Math.round(records.reduce((s, r) => s + r.topConfidence * 100, 0) / records.length)
    : 0;

  const latestCfg    = latestRecord ? STATUS_CFG[latestRecord.status] : null;

  const tds = latestRecord?.sensorContext?.tds ?? null;
  const ph = latestRecord?.sensorContext?.ph ?? null;
  const temp = latestRecord?.sensorContext?.temperature ?? null;
  const humidity = latestRecord?.sensorContext?.humidity ?? null;
  const light = null; // Placeholder until lux sensor is integrated into AI Lab sensorContext

  const nutrientRiskScore = tds == null ? 35 : (tds < 600 || tds > 2000 ? 82 : tds < 800 || tds > 1800 ? 55 : 22);
  const phRiskScore = ph == null ? 35 : (ph < 5.5 || ph > 6.8 ? 82 : ph < 5.8 || ph > 6.5 ? 55 : 22);
  const heatLightRiskScore = temp == null ? 30 : (temp > 31 ? 85 : temp > 28 ? 58 : temp < 16 ? 64 : 20);
  const fungalRiskScore = humidity == null ? 35 : (humidity > 82 ? 78 : humidity > 70 ? 52 : 24);

  const statusBoost = latestRecord?.status === "danger" ? 1.25 : latestRecord?.status === "warning" ? 1.1 : 1;

  const featureImportance = {
    tds: tds == null ? 0 : Math.round(clamp01((Math.abs(tds - 1200) / 600) * 0.65 + 0.2) * 100),
    ph: ph == null ? 0 : Math.round(clamp01((Math.abs(ph - 6.2) / 1.2) * 0.65 + 0.2) * 100),
    temperature: temp == null ? 0 : Math.round(clamp01(((temp - 24) / 10) * 0.6 + 0.25) * 100),
    light: light == null ? 0 : 28,
    humidity: humidity == null ? 0 : Math.round(clamp01(((humidity - 60) / 30) * 0.55 + 0.2) * 100),
  };

  const dominantFactor = (Object.entries(featureImportance).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "tds") as "tds" | "ph" | "temperature" | "light" | "humidity";
  const overallRisk = Math.round(Math.max(nutrientRiskScore, phRiskScore, heatLightRiskScore, fungalRiskScore) * statusBoost);
  const overallLabel = overallRisk >= 75 ? "At Risk" : overallRisk >= 45 ? "Watch" : "Healthy";
  const overallColor = riskColor(overallRisk);

  const ollamaSuggestions = [
    "Day 1-2: Stabilize pH & nutrient levels based on detected issues. Recalibrate sensors and run daily monitoring scans.",
    "Day 3-5: Implement corrective actions targeting the dominant risk factor. Adjust grow conditions (light, temp, humidity) incrementally.",
    "Day 6-7: Validate improvements through repeat camera scans and sensor trending. Consolidate successful interventions into routine schedule.",
  ];

  useEffect(() => {
    if (!latestRecord) {
      setOllamaPlan([]);
      setOllamaError(null);
      return;
    }

    const record = latestRecord;

    const controller = new AbortController();

    async function fetchOllamaPlan() {
      setOllamaLoading(true);
      setOllamaError(null);

      const prompt = [
        "You are an expert agronomy AI assistant for hydroponic smart garden systems.",
        "Create a detailed 7-day treatment and monitoring plan based on this plant health data:",
        `Plant status: ${record.status.toUpperCase()}`,
        `Detected disease/condition: ${record.topDisease || "No specific disease detected"}`,
        `Detection confidence: ${((record.topConfidence ?? 0) * 100).toFixed(1)}%`,
        `Complete diagnosis: ${record.fusedDiagnosis || "Plant health status appears normal"}`,
        `Current sensor readings: TDS=${tds ?? "unavailable"} ppm, pH=${ph ?? "unavailable"}, temp=${temp ?? "unavailable"}°C, humidity=${humidity ?? "unavailable"}%`,
        `Risk scores: Nutrient=${nutrientRiskScore}%, pH=${phRiskScore}%, Heat/Light=${heatLightRiskScore}%, Fungal=${fungalRiskScore}%`,
        `Dominant risk factor: ${dominantFactor}`,
        "",
        "Provide a structured 7-day plan (Days 1-2, Days 3-5, Days 6-7) with specific actionable steps.",
        "Focus on addressing the detected issues and identified risk factors.",
        "Format: Return exactly 3 concise points for each phase, one per line, no markdown or bullet symbols.",
      ].join("\n");

      try {
        const res = await fetch("/api/ai/ollama", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Failed to get Ollama response");
        }

        const data = await res.json() as { text?: string };
        const lines = (data.text ?? "")
          .split("\n")
          .map((line) => line.replace(/^[-*\d.)\s]+/, "").trim())
          .filter(Boolean)
          .slice(0, 3);

        setOllamaPlan(lines.length > 0 ? lines : ollamaSuggestions);
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") return;
        setOllamaError(err instanceof Error ? err.message : "Ollama unavailable");
        setOllamaPlan(ollamaSuggestions);
      } finally {
        setOllamaLoading(false);
      }
    }

    fetchOllamaPlan();
    return () => controller.abort();
  }, [
    latestRecord?._id,
    latestRecord?.status,
    latestRecord?.topDisease,
    latestRecord?.topConfidence,
    latestRecord?.fusedDiagnosis,
    tds,
    ph,
    temp,
    humidity,
    light,
    nutrientRiskScore,
    phRiskScore,
    heatLightRiskScore,
    fungalRiskScore,
  ]);

  if (!mounted) {
    return (
      <div className="space-y-6" suppressHydrationWarning>
        <div
          className="rounded-2xl p-5"
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
        >
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Initializing AI Lab...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up space-y-6" suppressHydrationWarning>

      {/* Modal */}
      {selectedId && (
        <DetailModal id={selectedId} deviceId={deviceId} onClose={() => setSelectedId(null)} />
      )}

      {/* ══════════════════════════════════════════════
          ROW 1 — Upload (50%) | Thông số phân tích (50%)
      ══════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 gap-4 items-start lg:grid-cols-2 lg:gap-6">

        {/* ── LEFT 50%: AI Test Upload ── */}
        <div className="space-y-0">
          <AITestUpload
            deviceId={deviceId}
            onSaved={() => {
              setHasAnalysisInSession(true);
              fetchRecords();
              fetchLatestRecord();
            }}
          />
        </div>

        {/* ── RIGHT 50%: Option 3 — appears after first YOLO result ── */}
        <div className="space-y-4">
          {!hasAnalysisInSession || !latestRecord ? (
            <div className="rounded-2xl p-6" style={{ background: "var(--bg-elevated)", border: "1px dashed var(--border-normal)" }}>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Environmental Risk Intelligence is waiting for analysis data.
              </p>
              <p className="mt-2 text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Upload an image or use Capture. After YOLOv8 returns a result, this panel will render Random Forest risk assessment and Ollama action plan.
              </p>
            </div>
          ) : (
            <>

          {/* Traffic-light Risk Header */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
          >
            <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <BarChart2 size={13} style={{ color: "var(--emerald-400)" }} />
              <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Environmental Risk Intelligence</span>
              <span className="ml-auto font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>RF v1.0 · {total} scans</span>
            </div>

            <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
              {[
                { label: "Overall Health", value: overallLabel, icon: Activity, color: overallColor, bg: "rgba(255,255,255,0.04)" },
                { label: "Risk Score", value: `${overallRisk}%`, icon: TrendingUp, color: overallColor, bg: "rgba(59,130,246,0.10)" },
                { label: "Dominant Factor", value: dominantFactor, icon: Filter, color: "var(--gold-400)", bg: "rgba(245,158,11,0.10)" },
                { label: "Model Confidence", value: `${avgConf}%`, icon: ScanEye, color: "var(--emerald-400)", bg: "rgba(16,185,129,0.10)" },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className="flex items-center gap-3 rounded-xl px-3 py-3" style={{ background: "var(--bg-base)", border: "1px solid var(--border-subtle)" }}>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: bg }}>
                    <Icon size={14} style={{ color }} />
                  </div>
                  <div>
                    <p className="text-sm font-black leading-tight" style={{ color }}>{value}</p>
                    <p className="text-[10px] leading-tight" style={{ color: "var(--text-muted)" }}>{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Critical Metric Alert */}
          {(() => {
            const critical = getCriticalMetric(tds, ph, temp, humidity);
            if (!critical) return null;
            const criticalColor = critical.status === "danger" ? "#F87171" : critical.status === "warning" ? "var(--gold-400)" : "var(--emerald-400)";
            const criticalBg = critical.status === "danger" ? "rgba(239,68,68,0.10)" : critical.status === "warning" ? "rgba(245,158,11,0.10)" : "rgba(16,185,129,0.10)";
            return (
              <div className="rounded-2xl p-4" style={{ background: criticalBg, border: `1px solid ${criticalColor}40` }}>
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Critical Metric</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs" style={{ color: "var(--text-primary)" }}>
                    <strong>{critical.name}</strong>: {critical.value}{critical.unit} (Normal: {critical.min}-{critical.max}{critical.unit})
                  </span>
                  <span className="font-bold text-xs" style={{ color: criticalColor }}>
                    {critical.status === "danger" ? "🔴 Danger" : critical.status === "warning" ? "🟡 Warning" : "🟢 Normal"}
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Risk Dials */}
          <div
            className="rounded-2xl p-4 space-y-3"
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
          >
            <div className="flex items-center gap-2">
              <Activity size={12} style={{ color: "var(--text-muted)" }} />
              <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Traffic-Light Risk Panel</span>
            </div>
            <div className="space-y-2.5">
              {[
                { label: "Nutrient Imbalance Risk", score: nutrientRiskScore },
                { label: "pH Imbalance Risk", score: phRiskScore },
                { label: "Heat/Light Stress Risk", score: heatLightRiskScore },
                { label: "Fungal Infection Risk", score: fungalRiskScore },
              ].map(({ label, score }) => {
                const color = riskColor(score);
                return (
                  <div key={label}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-[11px] font-medium" style={{ color: "var(--text-secondary)" }}>{label}</span>
                      <span className="font-mono text-[11px] font-bold" style={{ color }}>
                        {riskLabel(score)} <span style={{ color: "var(--text-muted)" }}>({score}%)</span>
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: "var(--border-subtle)" }}>
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, background: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Feature Importance + Sensor strip */}
          <div className="rounded-2xl p-4 space-y-3" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Feature Importance (Top-3)</span>
              <span className="font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>Primary: <strong style={{ color: "var(--gold-400)" }}>{dominantFactor}</strong></span>
            </div>
            {Object.entries(featureImportance)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3)
              .map(([k, v], idx) => (
              <div key={k}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[11px] capitalize font-medium" style={{ color: "var(--text-primary)" }}>#{idx + 1} {k}</span>
                  <span className="font-mono text-[11px] font-bold" style={{ color: k === dominantFactor ? "var(--gold-400)" : "var(--text-muted)" }}>{v}%</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full" style={{ background: "var(--border-subtle)" }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${v}%`, background: k === dominantFactor ? "var(--gold-400)" : "rgba(96,165,250,0.9)" }} />
                </div>
              </div>
            ))}

            <div className="pt-2 space-y-2 border-t" style={{ borderColor: "var(--border-subtle)" }}>
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Sensor Status Summary</p>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { label: "TDS", value: tds, min: 800, max: 1400, unit: "ppm" },
                  { label: "pH", value: ph, min: 5.8, max: 6.5, unit: "" },
                  { label: "Temp", value: temp, min: 18, max: 26, unit: "°C" },
                  { label: "Humidity", value: humidity, min: 60, max: 80, unit: "%" },
                ]
                  .filter(({ value }) => value != null) // Only show sensors with data
                  .map(({ label, value, min, max, unit }) => {
                    let status = "🟢"; // normal
                    if (value! < min || value! > max * 1.1) status = "🔴"; // danger
                    else if (value! < min * 1.05 || value! > max) status = "🟡"; // warning
                    return (
                      <span key={label} className="rounded-lg px-2.5 py-1.5 text-[10px] font-mono" style={{ background: "var(--bg-base)", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)" }}>
                        {status} {label}: {value}{unit}
                      </span>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Immediate Action */}
          <div className="rounded-2xl p-4" style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)" }}>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Immediate Action Required</p>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>
              {getImmediateAction(dominantFactor, tds, ph, temp, humidity, featureImportance)}
            </p>
          </div>

          {/* Ollama Action Planner */}
          <div className="rounded-2xl p-4 space-y-3" style={{ background: "var(--bg-elevated)", border: `1px solid ${latestCfg?.border ?? "var(--border-subtle)"}` }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>Ollama Action Planner</span>
              <span className="font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>Local LLM · Live</span>
            </div>

            <div className="rounded-xl p-3" style={{ background: "var(--bg-base)", border: "1px solid var(--border-subtle)" }}>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                7-Day Treatment & Monitoring Plan
              </p>
              {ollamaLoading && (
                <div className="mb-2 flex items-center gap-2 text-[11px]" style={{ color: "var(--text-muted)" }}>
                  <Loader2 size={12} className="animate-spin" />
                  Generating suggestion with Ollama...
                </div>
              )}
              {ollamaError && (
                <p className="mb-2 text-[11px]" style={{ color: "#F87171" }}>
                  {ollamaError}
                </p>
              )}
              <div className="space-y-1.5">
                {(ollamaPlan.length ? ollamaPlan : ollamaSuggestions).map((line) => (
                  <p key={line} className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </div>
            </>
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
          <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Analysis History</span>
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
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>{total} results</span>
          </div>
        </div>

        {/* Cards grid */}
        {records.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl py-20" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
            <ScanEye size={28} style={{ color: "var(--border-normal)" }} />
            <p className="mt-3 text-sm" style={{ color: "var(--text-muted)" }}>
              No results yet. Upload an image above to get started.
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
                  style={{
                    border: `1px solid ${cfg.border}`,
                    height: 220,
                    backgroundImage: record.imageUrl
                      ? `url(${record.imageUrl})`
                      : "linear-gradient(160deg, #06080F 0%, #0D1117 100%)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                  }}
                  onClick={() => setSelectedId(record._id)}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      background: "linear-gradient(to top, rgba(0,0,0,0.90) 35%, rgba(0,0,0,0.24) 70%, rgba(0,0,0,0.14) 100%)",
                    }}
                  />

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
                      {record.fusedDiagnosis || (record.topDisease ? `Detected: ${record.topDisease}` : "No disease detected")}
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
