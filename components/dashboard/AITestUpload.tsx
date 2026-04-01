"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ScanEye, CheckCircle, AlertTriangle,
  XCircle, Loader2, ImageIcon, RefreshCw, Camera,
} from "lucide-react";

type Detection = {
  class: string;
  confidence: number;
  bbox: number[];
};

type PredictResult = {
  status: "healthy" | "warning" | "danger";
  topDisease: string | null;
  topConfidence: number;
  detections: Detection[];
  recommendation: string;
  fusedDiagnosis?: string;
  aiModel: string;
  processingMs: number;
  device: string;
  originalWidth?: number;
  originalHeight?: number;
  error?: string;
};

const STATUS_CFG = {
  healthy: { icon: CheckCircle,  color: "#10B981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.25)", label: "Healthy" },
  warning: { icon: AlertTriangle, color: "#F59E0B", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)", label: "Warning" },
  danger:  { icon: XCircle,       color: "#F87171", bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.25)",  label: "Danger"  },
};

const CLASS_COLORS: Record<string, string> = {
  healthy: "#10B981", healthy_leaf: "#10B981",
  yellow_leaf: "#F59E0B", brown_spot: "#A16207",
  powdery_mildew: "#C084FC", aphid: "#F87171",
  spider_mite: "#FB923C", whitefly: "#60A5FA",
  blight: "#EF4444", rot: "#DC2626",
  nutrient_deficiency: "#FACC15",
};

function getClassColor(cls: string): string {
  return CLASS_COLORS[cls.toLowerCase().replace(/\s+/g, "_")] ?? "#A78BFA";
}

function getContainRect(containerW: number, containerH: number, origW: number, origH: number) {
  const containerAspect = containerW / containerH;
  const imgAspect = origW / origH;
  let renderedW: number, renderedH: number;
  if (imgAspect > containerAspect) {
    renderedW = containerW;
    renderedH = containerW / imgAspect;
  } else {
    renderedH = containerH;
    renderedW = containerH * imgAspect;
  }
  return {
    renderedW, renderedH,
    offsetX: (containerW - renderedW) / 2,
    offsetY: (containerH - renderedH) / 2,
  };
}

function drawBBoxes(canvas: HTMLCanvasElement, img: HTMLImageElement, detections: Detection[], origW: number, origH: number) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const { renderedW, renderedH, offsetX, offsetY } = getContainRect(img.clientWidth, img.clientHeight, origW, origH);
  const scaleX = renderedW / origW;
  const scaleY = renderedH / origH;
  for (const det of detections) {
    const [x1, y1, x2, y2] = det.bbox;
    const rx = x1 * scaleX + offsetX;
    const ry = y1 * scaleY + offsetY;
    const rw = (x2 - x1) * scaleX;
    const rh = (y2 - y1) * scaleY;
    const color = getClassColor(det.class);
    const label = `${det.class} ${(det.confidence * 100).toFixed(0)}%`;
    ctx.strokeStyle = color; ctx.lineWidth = 2.5;
    ctx.strokeRect(rx, ry, rw, rh);
    ctx.font = "bold 12px monospace";
    const textW = ctx.measureText(label).width;
    const labelY = ry > 22 ? ry - 4 : ry + rh + 16;
    ctx.fillStyle = color; ctx.globalAlpha = 0.88;
    ctx.fillRect(rx, labelY - 14, textW + 8, 18);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#000";
    ctx.fillText(label, rx + 4, labelY);
  }
}

type SensorContext = { tds?: number | null; ph?: number | null; temperature?: number | null; humidity?: number | null };
type Props = { deviceId: string; sensorContext?: SensorContext; onSaved?: () => void };

function normalizeSensorContext(input?: SensorContext): { tds: number | null; ph: number | null; temperature: number | null; humidity: number | null } {
  return {
    tds: typeof input?.tds === "number" ? input.tds : null,
    ph: typeof input?.ph === "number" ? input.ph : null,
    temperature: typeof input?.temperature === "number" ? input.temperature : null,
    humidity: typeof input?.humidity === "number" ? input.humidity : null,
  };
}

type CapturePhase = "idle" | "sending_command" | "waiting_image" | "analyzing";

export default function AITestUpload({ deviceId, sensorContext, onSaved }: Props) {
  const inputRef     = useRef<HTMLInputElement>(null);
  const imgRef       = useRef<HTMLImageElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pollRef      = useRef<ReturnType<typeof setInterval> | null>(null);

  const [preview,      setPreview]      = useState<string | null>(null);
  const [loading,      setLoading]      = useState(false);
  const [result,       setResult]       = useState<PredictResult | null>(null);
  const [error,        setError]        = useState<string | null>(null);
  const [dragging,     setDragging]     = useState(false);
  const [origSize,     setOrigSize]     = useState<{ w: number; h: number } | null>(null);
  const [capturePhase, setCapturePhase] = useState<CapturePhase>("idle");
  const [captureMsg,   setCaptureMsg]   = useState("");

  /* ── Redraw bounding boxes ── */
  const redrawBoxes = useCallback(() => {
    if (!result || !imgRef.current || !canvasRef.current || !origSize) return;
    const img = imgRef.current;
    const canvas = canvasRef.current;
    canvas.width  = img.clientWidth;
    canvas.height = img.clientHeight;
    canvas.style.width  = `${img.clientWidth}px`;
    canvas.style.height = `${img.clientHeight}px`;
    drawBBoxes(canvas, img, result.detections, origSize.w, origSize.h);
  }, [result, origSize]);

  useEffect(() => { redrawBoxes(); }, [redrawBoxes, preview]);
  useEffect(() => {
    const obs = new ResizeObserver(redrawBoxes);
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [redrawBoxes]);

  /* ── Run AI predict + save ── */
  async function runPredict(imageDataUrl: string, snapshotId?: string) {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      // Convert dataURL → File blob
      const res0  = await fetch(imageDataUrl);
      const blob  = await res0.blob();
      const form  = new FormData();
      form.append("file", blob, "capture.jpg");

      const res  = await fetch("/api/ai/predict", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unknown error");

      if (data.originalWidth && data.originalHeight) {
        setOrigSize({ w: data.originalWidth, h: data.originalHeight });
      }

      let finalSensorContext = normalizeSensorContext(sensorContext);
      try {
        const latestRes = await fetch(`/api/devices/${deviceId}/latest`);
        if (latestRes.ok) {
          const latestData = await latestRes.json() as {
            reading?: { tds_ppm?: number; ph?: number; temp?: number; humi?: number } | null;
          };
          const reading = latestData.reading;
          if (reading) {
            finalSensorContext = {
              tds: typeof reading.tds_ppm === "number" ? reading.tds_ppm : finalSensorContext.tds,
              ph: typeof reading.ph === "number" ? reading.ph : finalSensorContext.ph,
              temperature: typeof reading.temp === "number" ? reading.temp : finalSensorContext.temperature,
              humidity: typeof reading.humi === "number" ? reading.humi : finalSensorContext.humidity,
            };
          }
        }
      } catch {
        // Non-critical: keep fallback sensorContext from props
      }

      // Lưu vào MongoDB
      const saveRes = await fetch(`/api/devices/${deviceId}/diagnostics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          snapshotId,
          imageBase64:    imageDataUrl,
          sensorContext:  finalSensorContext,
          detections:     data.detections,
          status:         data.status,
          topDisease:     data.topDisease,
          topConfidence:  data.topConfidence,
          fusedDiagnosis: data.fusedDiagnosis ?? "",
          recommendation: data.recommendation,
          aiModel:        data.aiModel,
          processingMs:   data.processingMs,
        }),
      });
      if (!saveRes.ok) {
        const saveData = await saveRes.json().catch(() => ({}));
        throw new Error(saveData.error ?? "Failed to save diagnostic record");
      }

      const savedData = await saveRes.json().catch(() => ({})) as {
        recommendation?: string;
        fusedDiagnosis?: string;
      };

      setResult({
        ...data,
        recommendation: savedData.recommendation ?? data.recommendation,
        fusedDiagnosis: savedData.fusedDiagnosis ?? data.fusedDiagnosis,
      });

      onSaved?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
      setCapturePhase("idle");
    }
  }

  /* ── Handle file select / drop ── */
  function handleFile(f: File) {
    if (!f.type.startsWith("image/")) return;
    setResult(null);
    setError(null);
    setOrigSize(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setPreview(src);
      // Auto-analyze ngay khi có ảnh
      const tmp = new Image();
      tmp.onload = () => setOrigSize({ w: tmp.naturalWidth, h: tmp.naturalHeight });
      tmp.src = src;
      runPredict(src);
    };
    reader.readAsDataURL(f);
  }

  /* ── Capture from device camera ── */
  async function handleCapture() {
    if (capturePhase !== "idle") return;
    setError(null);
    setResult(null);

    const startedAt = new Date().toISOString();

    // 1. Send capture_now command to ESP32
    setCapturePhase("sending_command");
    setCaptureMsg("Sending capture command to ESP32…");
    try {
      const cmdRes = await fetch(`/api/devices/${deviceId}/command`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: "capture_now", suppressPushMs: 90_000 }),
      });
      if (!cmdRes.ok) throw new Error("Failed to send command to device");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setCapturePhase("idle");
      return;
    }

    // 2. Poll snapshot API waiting for image (max 30s)
    setCapturePhase("waiting_image");
    setCaptureMsg("Waiting for ESP32 to capture and send image…");

    let elapsed = 0;
    const POLL_INTERVAL = 1500;
    const MAX_WAIT = 30_000;

    await new Promise<void>((resolve) => {
      pollRef.current = setInterval(async () => {
        elapsed += POLL_INTERVAL;
        if (elapsed > MAX_WAIT) {
          clearInterval(pollRef.current!);
          setError("Device did not respond within 30 seconds. Check camera connection.");
          setCapturePhase("idle");
          resolve();
          return;
        }
        try {
          const snapRes = await fetch(`/api/devices/${deviceId}/snapshot?after=${encodeURIComponent(startedAt)}`);
          const snap    = await snapRes.json();
          if (snap.image) {
            clearInterval(pollRef.current!);
            const src = snap.image as string;
            setPreview(src);
            const tmp = new Image();
            tmp.onload = () => setOrigSize({ w: tmp.naturalWidth, h: tmp.naturalHeight });
            tmp.src = src;
            // 3. Auto-analyze
            setCapturePhase("analyzing");
            setCaptureMsg("Analyzing image with plantAI.pt…");
            resolve();
            runPredict(src, snap.snapshotId);
          }
        } catch { /* tiếp tục poll */ }
      }, POLL_INTERVAL);
    });
  }

  /* Cleanup poll khi unmount */
  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const cfg = result ? STATUS_CFG[result.status] : null;
  const isBusy = loading || capturePhase !== "idle";

  const captureLabel = {
    idle:           <>Capture</>,
    sending_command: <><Loader2 size={13} className="animate-spin" /> Sending…</>,
    waiting_image:   <><Loader2 size={13} className="animate-spin" /> Waiting…</>,
    analyzing:       <><Loader2 size={13} className="animate-spin" /> Analyzing…</>,
  }[capturePhase];

  return (
    <div
      className="overflow-hidden rounded-2xl"
      style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
      suppressHydrationWarning
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-5 py-4"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <ScanEye size={14} style={{ color: "var(--emerald-400)" }} />
        <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          AI Test — Analyze Plant
        </span>
        <span
          className="ml-auto rounded-full px-2.5 py-0.5 font-mono text-[10px]"
          style={{ background: "rgba(16,185,129,0.10)", color: "var(--emerald-400)" }}
        >
          plantAI.pt · YOLOv8
        </span>
      </div>

      <div className="p-5 space-y-4">

        {/* ── Upload zone ── */}
        <div
          ref={containerRef}
          className="relative w-full overflow-hidden rounded-xl cursor-pointer"
          style={{
            minHeight: 300,
            border: `2px dashed ${dragging ? "#10B981" : preview ? "transparent" : "rgba(255,255,255,0.12)"}`,
            background: preview ? "#000" : dragging ? "rgba(16,185,129,0.05)" : "#06080F",
          }}
          onClick={() => !preview && !isBusy && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (!isBusy) { const f = e.dataTransfer.files[0]; if (f) handleFile(f); }
          }}
        >
          {preview ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imgRef}
                src={preview}
                alt="preview"
                className="w-full rounded-xl"
                style={{ display: "block", maxHeight: 460, objectFit: "contain" }}
                onLoad={redrawBoxes}
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 pointer-events-none"
                style={{ top: 0, left: 0 }}
              />
              {!isBusy && (
                <button
                  className="absolute top-3 right-3 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold"
                  style={{ background: "rgba(0,0,0,0.65)", color: "#fff", border: "1px solid rgba(255,255,255,0.15)" }}
                  onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                >
                  <RefreshCw size={11} /> Change Image
                </button>
              )}
              {origSize && (
                <span
                  className="absolute bottom-3 left-3 font-mono text-[10px] rounded px-2 py-0.5"
                  style={{ background: "rgba(0,0,0,0.6)", color: "rgba(255,255,255,0.4)" }}
                >
                  {origSize.w} × {origSize.h}px
                </span>
              )}
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center py-14 gap-3">
              {capturePhase !== "idle" ? (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                    <Camera size={24} style={{ color: "var(--emerald-400)" }} />
                  </div>
                  <p className="text-sm font-semibold" style={{ color: "var(--emerald-400)" }}>{captureMsg}</p>
                  <div className="flex gap-1">
                    {[0,1,2].map(i => (
                      <span key={i} className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "var(--emerald-400)", animationDelay: `${i * 200}ms` }} />
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <ImageIcon size={36} style={{ color: "rgba(255,255,255,0.10)" }} />
                  <div className="text-center">
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>Drag & drop or click to upload image</p>
                    <p className="mt-0.5 font-mono text-[10px]" style={{ color: "rgba(255,255,255,0.08)" }}>Auto-analyzed on upload · JPG · PNG · WEBP</p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Loading overlay khi đang analyze */}
          {loading && preview && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-xl" style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}>
              <Loader2 size={28} className="animate-spin" style={{ color: "var(--emerald-400)" }} />
              <p className="text-sm font-semibold" style={{ color: "var(--emerald-400)" }}>Running YOLOv8…</p>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
          />
        </div>

        {/* ── Capture button ── */}
        <button
          onClick={handleCapture}
          disabled={isBusy}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all duration-150"
          style={{
            background: isBusy ? "rgba(16,185,129,0.05)" : "rgba(16,185,129,0.12)",
            border: `1px solid ${isBusy ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.30)"}`,
            color: isBusy ? "var(--text-muted)" : "var(--emerald-400)",
            cursor: isBusy ? "not-allowed" : "pointer",
          }}
        >
          <Camera size={15} />
          {captureLabel}
        </button>

        {/* ── Error ── */}
        {error && (
          <div className="rounded-xl p-3" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}>
            <p className="text-xs" style={{ color: "#F87171" }}>{error}</p>
          </div>
        )}

        {/* ── Result ── */}
        {result && cfg && (
          <div className="space-y-3">

            {/* Status banner */}
            <div
              className="flex items-center justify-between rounded-xl px-4 py-3"
              style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
            >
              <div className="flex items-center gap-2">
                <cfg.icon size={18} style={{ color: cfg.color }} />
                <span className="text-sm font-bold" style={{ color: cfg.color }}>{cfg.label}</span>
                {result.topDisease && (
                  <span className="rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold" style={{ background: "rgba(0,0,0,0.3)", color: cfg.color }}>
                    {result.topDisease}
                  </span>
                )}
              </div>
              <span className="font-mono text-lg font-black" style={{ color: cfg.color }}>
                {(result.topConfidence * 100).toFixed(0)}%
              </span>
            </div>

            {/* Recommendation */}
            <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)" }}>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Recommendation</p>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-primary)" }}>{result.recommendation}</p>
            </div>

            {/* Detections */}
            {result.detections.length > 0 && (
              <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)" }}>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  Detections ({result.detections.length})
                </p>
                <div className="space-y-2">
                  {result.detections.map((d, i) => {
                    const boxColor = getClassColor(d.class);
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: boxColor }} />
                        <span className="flex-1 font-mono text-xs" style={{ color: "var(--text-secondary)" }}>{d.class}</span>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                            <div className="h-full rounded-full transition-all" style={{ width: `${d.confidence * 100}%`, background: boxColor }} />
                          </div>
                          <span className="w-10 text-right font-mono text-[11px]" style={{ color: "var(--text-muted)" }}>
                            {(d.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Meta */}
            <div className="flex items-center justify-between px-1">
              <span className="font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>
                {result.aiModel} · {result.device?.toUpperCase()}
              </span>
              <span className="font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>
                {result.processingMs} ms
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
