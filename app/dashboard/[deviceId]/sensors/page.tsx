"use client";

import { useState } from "react";
import {
  Camera, Droplets, FlaskConical, Zap, Lightbulb,
  Timer, RotateCcw, SlidersHorizontal, CheckCircle,
  WifiOff, Power,
} from "lucide-react";

/* ── Toggle switch ── */
function Toggle({
  on, onChange, color = "var(--emerald-500)",
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  color?: string;
}) {
  return (
    <button
      onClick={() => onChange(!on)}
      className="relative h-5 w-9 rounded-full transition-colors duration-200"
      style={{ background: on ? color : "rgba(255,255,255,0.10)" }}
    >
      <span
        className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200"
        style={{ left: on ? "calc(100% - 18px)" : "2px" }}
      />
    </button>
  );
}

/* ── Threshold slider ── */
function ThresholdRow({
  label, icon: Icon, color,
  min, max, minVal, maxVal,
  unit,
}: {
  label: string;
  icon: React.ElementType;
  color: string;
  min: number;
  max: number;
  minVal: number;
  maxVal: number;
  unit: string;
}) {
  const [lo, setLo] = useState(minVal);
  const [hi, setHi] = useState(maxVal);
  const pctLo = ((lo - min) / (max - min)) * 100;
  const pctHi = ((hi - min) / (max - min)) * 100;

  return (
    <div
      className="rounded-xl p-4"
      style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={13} style={{ color }} />
          <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{label}</span>
        </div>
        <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
          {lo}{unit} — {hi}{unit}
        </span>
      </div>

      {/* Track */}
      <div className="relative h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
        <div
          className="absolute h-full rounded-full"
          style={{
            left: `${pctLo}%`,
            width: `${pctHi - pctLo}%`,
            background: color,
          }}
        />
      </div>

      {/* Range inputs */}
      <div className="relative mt-1">
        <input
          type="range" min={min} max={max} value={lo}
          onChange={(e) => setLo(Math.min(Number(e.target.value), hi - 1))}
          className="absolute w-full appearance-none bg-transparent"
          style={{ height: 16, opacity: 0, cursor: "pointer" }}
        />
        <input
          type="range" min={min} max={max} value={hi}
          onChange={(e) => setHi(Math.max(Number(e.target.value), lo + 1))}
          className="absolute w-full appearance-none bg-transparent"
          style={{ height: 16, opacity: 0, cursor: "pointer" }}
        />
      </div>
      <div className="mt-3 flex justify-between text-[10px]" style={{ color: "var(--text-muted)" }}>
        <span>{min}{unit}</span>
        <span className="font-mono" style={{ color }}>Ngưỡng cảnh báo</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}

export default function SensorsPage() {
  const [pump, setPump]   = useState(false);
  const [light, setLight] = useState(true);
  const [capturing, setCapturing] = useState(false);

  function handleCapture() {
    setCapturing(true);
    setTimeout(() => setCapturing(false), 3000);
  }

  return (
    <div className="animate-fade-up space-y-5">

      {/* ── 3-col: Camera | Actuators | Calibration ── */}
      <div className="grid gap-5 lg:grid-cols-3">

        {/* Camera Control */}
        <div
          className="overflow-hidden rounded-2xl"
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
        >
          <div
            className="flex items-center gap-2 px-5 py-4"
            style={{ borderBottom: "1px solid var(--border-subtle)" }}
          >
            <Camera size={14} style={{ color: "var(--blue-400)" }} />
            <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Camera Control</span>
          </div>
          <div className="p-5 space-y-4">
            {/* Camera preview placeholder */}
            <div
              className="relative flex items-center justify-center overflow-hidden rounded-xl"
              style={{ height: 140, background: "#06080F", border: "1px solid rgba(59,130,246,0.15)" }}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-20"
                style={{
                  backgroundImage: "radial-gradient(circle, rgba(59,130,246,0.4) 1px, transparent 1px)",
                  backgroundSize: "18px 18px",
                }}
              />
              {capturing ? (
                <div className="z-10 text-center">
                  <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
                  <p className="font-mono text-[10px]" style={{ color: "#60A5FA" }}>Đang chụp...</p>
                </div>
              ) : (
                <div className="z-10 text-center">
                  <Camera size={24} style={{ color: "rgba(255,255,255,0.15)", margin: "0 auto" }} />
                  <p className="mt-2 font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>OV2640 · Ready</p>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-3 py-1.5"
                style={{ background: "rgba(0,0,0,0.6)" }}>
                <span className="font-mono text-[9px]" style={{ color: "#60A5FA" }}>CAM_01</span>
                <span className="font-mono text-[9px]" style={{ color: "var(--emerald-400)" }}>
                  {capturing ? "CAPTURING" : "STANDBY"}
                </span>
              </div>
            </div>

            <button
              onClick={handleCapture}
              disabled={capturing}
              className="btn-gold w-full gap-2 justify-center text-xs"
            >
              <Camera size={13} />
              {capturing ? "Đang xử lý..." : "Chụp & Phân tích AI"}
            </button>

            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Lịch chụp tự động
              </p>
              {["6 tiếng", "12 tiếng", "24 tiếng"].map((opt) => (
                <label
                  key={opt}
                  className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2"
                  style={{ background: opt === "6 tiếng" ? "rgba(16,185,129,0.07)" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${opt === "6 tiếng" ? "rgba(16,185,129,0.20)" : "var(--border-subtle)"}` }}
                >
                  <span className="text-xs" style={{ color: opt === "6 tiếng" ? "var(--emerald-400)" : "var(--text-secondary)" }}>
                    Mỗi {opt}
                  </span>
                  <input type="radio" name="schedule" defaultChecked={opt === "6 tiếng"}
                    className="accent-emerald-500" />
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Actuator Controls */}
        <div
          className="overflow-hidden rounded-2xl"
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
        >
          <div
            className="flex items-center gap-2 px-5 py-4"
            style={{ borderBottom: "1px solid var(--border-subtle)" }}
          >
            <Power size={14} style={{ color: "var(--gold-400)" }} />
            <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Actuator Controls</span>
          </div>
          <div className="p-5 space-y-4">

            {/* Pump toggle */}
            <div
              className="flex items-center justify-between rounded-xl p-4"
              style={{
                background: pump ? "rgba(16,185,129,0.06)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${pump ? "rgba(16,185,129,0.18)" : "var(--border-subtle)"}`,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ background: pump ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.05)" }}
                >
                  <Droplets size={16} style={{ color: pump ? "var(--emerald-400)" : "var(--text-muted)" }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Bơm nước</p>
                  <p className="text-[10px]" style={{ color: pump ? "var(--emerald-400)" : "var(--text-muted)" }}>
                    {pump ? "● Đang chạy" : "○ Tắt"}
                  </p>
                </div>
              </div>
              <Toggle on={pump} onChange={setPump} />
            </div>

            {/* Light toggle */}
            <div
              className="flex items-center justify-between rounded-xl p-4"
              style={{
                background: light ? "rgba(245,158,11,0.06)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${light ? "rgba(245,158,11,0.18)" : "var(--border-subtle)"}`,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ background: light ? "rgba(245,158,11,0.12)" : "rgba(255,255,255,0.05)" }}
                >
                  <Lightbulb size={16} style={{ color: light ? "var(--gold-400)" : "var(--text-muted)" }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Đèn grow light</p>
                  <p className="text-[10px]" style={{ color: light ? "var(--gold-400)" : "var(--text-muted)" }}>
                    {light ? "● LED 20W · Bật" : "○ Tắt"}
                  </p>
                </div>
              </div>
              <Toggle on={light} onChange={setLight} color="var(--gold-400)" />
            </div>

            {/* Schedule watering */}
            <div
              className="rounded-xl p-4"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Timer size={13} style={{ color: "var(--blue-400)" }} />
                <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>Hẹn giờ tưới</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px]" style={{ color: "var(--text-muted)" }}>Giờ bắt đầu</label>
                  <input
                    type="time" defaultValue="06:00"
                    className="dark-input mt-1 w-full text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px]" style={{ color: "var(--text-muted)" }}>Thời lượng</label>
                  <select className="dark-select mt-1 w-full text-xs">
                    <option>5 phút</option>
                    <option>10 phút</option>
                    <option>15 phút</option>
                  </select>
                </div>
              </div>
              <button className="btn-emerald mt-3 w-full justify-center gap-2 text-xs">
                <CheckCircle size={12} />
                Lưu lịch tưới
              </button>
            </div>

            {/* MQTT status */}
            <div
              className="flex items-center gap-2 rounded-xl px-3 py-2.5"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)" }}
            >
              <Zap size={11} style={{ color: "var(--emerald-500)" }} />
              <span className="font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>
                MQTT: garden/{"{deviceId}"}/commands
              </span>
            </div>
          </div>
        </div>

        {/* Sensor Calibration */}
        <div
          className="overflow-hidden rounded-2xl"
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
        >
          <div
            className="flex items-center gap-2 px-5 py-4"
            style={{ borderBottom: "1px solid var(--border-subtle)" }}
          >
            <RotateCcw size={14} style={{ color: "var(--text-muted)" }} />
            <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Hiệu Chuẩn Sensor</span>
          </div>
          <div className="p-5 space-y-4">
            {[
              {
                label: "pH Sensor", icon: FlaskConical,
                color: "var(--emerald-400)",
                current: "6.2",
                hint: "Dung dịch chuẩn pH 7.0 & 4.0",
              },
              {
                label: "TDS Sensor", icon: Droplets,
                color: "var(--blue-400)",
                current: "1150",
                hint: "Dung dịch chuẩn 1000 ppm",
              },
            ].map(({ label, icon: Icon, color, current, hint }) => (
              <div
                key={label}
                className="rounded-xl p-4"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)" }}
              >
                <div className="mb-3 flex items-center gap-2">
                  <Icon size={13} style={{ color }} />
                  <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{label}</span>
                </div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>Giá trị hiện tại:</span>
                  <span className="font-mono text-xs font-bold" style={{ color }}>{current}</span>
                </div>
                <input
                  type="number"
                  placeholder="Nhập giá trị hiệu chuẩn..."
                  className="dark-input w-full text-xs"
                />
                <p className="mt-1.5 text-[10px]" style={{ color: "var(--text-muted)" }}>{hint}</p>
                <button className="btn-ghost mt-2 w-full justify-center gap-2 text-xs">
                  <RotateCcw size={11} />
                  Hiệu chuẩn
                </button>
              </div>
            ))}

            <div
              className="flex items-start gap-2 rounded-xl px-3 py-2.5"
              style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.18)" }}
            >
              <WifiOff size={11} style={{ color: "var(--gold-400)", marginTop: 1, flexShrink: 0 }} />
              <p className="text-[10px]" style={{ color: "var(--gold-400)" }}>
                Kết nối thiết bị trực tiếp để hiệu chuẩn chính xác hơn.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Alert Thresholds ── */}
      <div
        className="overflow-hidden rounded-2xl"
        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
      >
        <div
          className="flex items-center gap-2 px-5 py-4"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <SlidersHorizontal size={14} style={{ color: "var(--text-muted)" }} />
          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Ngưỡng Cảnh Báo
          </span>
          <span
            className="ml-auto rounded-full px-2.5 py-0.5 font-mono text-[10px]"
            style={{ background: "rgba(16,185,129,0.10)", color: "var(--emerald-400)" }}
          >
            Tự động gửi FCM Push
          </span>
        </div>
        <div className="grid gap-4 p-5 md:grid-cols-2 lg:grid-cols-4">
          <ThresholdRow label="TDS"       icon={Droplets}    color="var(--blue-400)"    min={0}  max={3000} minVal={800}  maxVal={1800} unit=" ppm" />
          <ThresholdRow label="pH"        icon={FlaskConical} color="var(--emerald-400)" min={0}  max={14}   minVal={5.5}  maxVal={7.0}  unit=""    />
          <ThresholdRow label="Nhiệt độ" icon={Droplets}    color="var(--gold-400)"    min={0}  max={50}   minVal={18}   maxVal={32}   unit="°C"  />
          <ThresholdRow label="Mực nước" icon={Droplets}    color="#60A5FA"            min={0}  max={100}  minVal={20}   maxVal={100}  unit="%"   />
        </div>
        <div className="flex justify-end px-5 pb-5">
          <button className="btn-emerald gap-2 text-xs">
            <CheckCircle size={12} />
            Lưu ngưỡng cảnh báo
          </button>
        </div>
      </div>
    </div>
  );
}
