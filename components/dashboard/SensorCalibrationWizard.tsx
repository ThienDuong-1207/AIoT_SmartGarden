"use client";

import { useMemo, useState } from "react";
import { Beaker, Loader2, FlaskConical } from "lucide-react";

type SensorType = "TDS" | "pH";

type SensorState = {
  calibrationMode: boolean;
  calibratingType?: string | null;
  lastCalibrated?: Date | string;
};

interface SensorCalibrationWizardProps {
  deviceId: string;
  initialSensor: SensorState;
  onUpdate?: (config: { sensor: SensorState }) => void;
  disabled?: boolean;
}

export default function SensorCalibrationWizard({ deviceId, initialSensor, onUpdate, disabled = false }: SensorCalibrationWizardProps) {
  const [sensorType, setSensorType] = useState<SensorType>("TDS");
  const [sensor, setSensor] = useState<SensorState>(initialSensor);
  const [loading, setLoading] = useState(false);

  const steps = useMemo(() => {
    if (sensorType === "TDS") {
      return [
        "Rinse TDS probe with clean water.",
        "Place probe in standard TDS solution.",
        "Wait 10-15 seconds until stable.",
        "Press Complete Calibration.",
      ];
    }

    return [
      "Rinse pH probe with distilled water.",
      "Place probe in pH 7.0 buffer solution.",
      "Wait until value is stable.",
      "Press Complete Calibration.",
    ];
  }, [sensorType]);

  const sendCalibrationCommand = async (action: "start" | "cancel" | "complete") => {
    if (disabled) return;
    const res = await fetch(`/api/devices/${deviceId}/config`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sensor: {
          calibrationMode: action === "start" ? true : false,
          calibratingType: action === "start" ? sensorType : null,
          command: {
            action,
            sensorType,
          },
        },
      }),
    });

    if (!res.ok) {
      throw new Error("Failed to send calibration command");
    }

    const data = await res.json();
    const nextSensor = data.device?.config?.sensor ?? data.config?.sensor;
    if (nextSensor) {
      setSensor(nextSensor);
      onUpdate?.({ sensor: nextSensor });
    }
  };

  const handleAction = async (action: "start" | "cancel" | "complete") => {
    if (disabled) return;
    setLoading(true);
    try {
      await sendCalibrationCommand(action);
    } catch (error) {
      console.error("Calibration command failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl p-4 space-y-4" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
      <div className="flex items-center gap-3">
        <FlaskConical size={18} style={{ color: "#FB923C" }} />
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Sensor Calibration Wizard
        </h3>
      </div>

      <div className="flex items-center justify-between rounded-lg p-2" style={{ background: "rgba(255,255,255,0.03)" }}>
        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Current State</span>
        <span className={`text-xs font-semibold ${sensor.calibrationMode ? "text-orange-400" : "text-emerald-400"}`}>
          {sensor.calibrationMode ? `ACTIVE (${sensor.calibratingType || "-"})` : "IDLE"}
        </span>
      </div>

      <div className="space-y-2">
        <label className="text-xs" style={{ color: "var(--text-secondary)" }}>Sensor Type</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setSensorType("TDS")}
            disabled={disabled}
            className="rounded-lg py-2 text-xs font-semibold"
            style={{
              background: sensorType === "TDS" ? "rgba(251,146,60,0.18)" : "rgba(255,255,255,0.04)",
              color: sensorType === "TDS" ? "#FB923C" : "var(--text-secondary)",
              border: sensorType === "TDS" ? "1px solid rgba(251,146,60,0.35)" : "1px solid var(--border-subtle)",
            }}
          >
            TDS
          </button>
          <button
            onClick={() => setSensorType("pH")}
            disabled={disabled}
            className="rounded-lg py-2 text-xs font-semibold"
            style={{
              background: sensorType === "pH" ? "rgba(251,146,60,0.18)" : "rgba(255,255,255,0.04)",
              color: sensorType === "pH" ? "#FB923C" : "var(--text-secondary)",
              border: sensorType === "pH" ? "1px solid rgba(251,146,60,0.35)" : "1px solid var(--border-subtle)",
            }}
          >
            pH
          </button>
        </div>
      </div>

      <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-subtle)" }}>
        <div className="flex items-center gap-2 mb-2">
          <Beaker size={14} style={{ color: "#FB923C" }} />
          <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
            Calibration Steps ({sensorType})
          </p>
        </div>
        <ol className="text-[11px] space-y-1" style={{ color: "var(--text-muted)" }}>
          {steps.map((step, index) => (
            <li key={index}>{index + 1}. {step}</li>
          ))}
        </ol>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => handleAction("start")}
          disabled={loading || disabled}
          className="rounded-lg py-2 text-[11px] font-semibold"
          style={{ background: "rgba(59,130,246,0.12)", color: "var(--blue-400)", border: "1px solid rgba(59,130,246,0.25)" }}
        >
          Start
        </button>
        <button
          onClick={() => handleAction("cancel")}
          disabled={loading || disabled}
          className="rounded-lg py-2 text-[11px] font-semibold"
          style={{ background: "rgba(239,68,68,0.12)", color: "#F87171", border: "1px solid rgba(239,68,68,0.25)" }}
        >
          Cancel
        </button>
        <button
          onClick={() => handleAction("complete")}
          disabled={loading || disabled}
          className="rounded-lg py-2 text-[11px] font-semibold"
          style={{ background: "rgba(16,185,129,0.12)", color: "var(--emerald-400)", border: "1px solid rgba(16,185,129,0.25)" }}
        >
          Complete
        </button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
          <Loader2 size={13} className="animate-spin" />
          Sending command to ESP32 via MQTT...
        </div>
      )}

      {sensor.lastCalibrated && (
        <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
          Last calibrated: {new Date(sensor.lastCalibrated).toLocaleString()}
        </p>
      )}
    </div>
  );
}
