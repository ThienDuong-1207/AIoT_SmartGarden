"use client";

import { useState } from "react";
import { Sun, Loader2 } from "lucide-react";

interface LightControlProps {
  deviceId: string;
  initialStatus: boolean;
  initialBrightness: number;
  initialSchedule: Array<{ startTime: string; endTime: string; brightness: number; enabled: boolean }>;
  onUpdate?: (config: any) => void;
}

export default function LightControl({
  deviceId,
  initialStatus,
  initialBrightness,
  initialSchedule,
  onUpdate,
}: LightControlProps) {
  const [status, setStatus] = useState(initialStatus);
  const [brightness, setBrightness] = useState(initialBrightness);
  const [schedule, setSchedule] = useState(initialSchedule);
  const [isLoading, setIsLoading] = useState(false);

  const saveLightConfig = async (next: {
    status?: boolean;
    brightness?: number;
    schedule?: Array<{ startTime: string; endTime: string; brightness: number; enabled: boolean }>;
  }) => {
    const res = await fetch(`/api/devices/${deviceId}/config`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        light: {
          status: next.status ?? status,
          brightness: next.brightness ?? brightness,
          schedule: next.schedule ?? schedule,
        },
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setStatus(data.config.light.status);
      setBrightness(data.config.light.brightness);
      setSchedule(data.config.light.schedule);
      onUpdate?.(data.config);
      return true;
    }

    return false;
  };

  const handleToggleLight = async () => {
    setIsLoading(true);
    try {
      await saveLightConfig({ status: !status });
    } catch (error) {
      console.error("Failed to update light:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBrightnessChange = async (value: number) => {
    setBrightness(value);
    try {
      await saveLightConfig({ brightness: value });
    } catch (error) {
      console.error("Failed to update brightness:", error);
    }
  };

  const handlePreset = async (preset: "12h" | "16h" | "custom") => {
    const presetMap = {
      "12h": [{ startTime: "06:00", endTime: "18:00", brightness: 100, enabled: true }],
      "16h": [{ startTime: "06:00", endTime: "22:00", brightness: 100, enabled: true }],
      custom: [
        ...schedule,
        { startTime: "07:00", endTime: "19:00", brightness: brightness || 100, enabled: true },
      ],
    };

    setIsLoading(true);
    try {
      await saveLightConfig({ schedule: presetMap[preset], status: true });
    } catch (error) {
      console.error("Failed to apply light preset:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl p-4 space-y-4" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
      <div className="flex items-center gap-3">
        <Sun size={18} style={{ color: "var(--gold-400)" }} />
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          💡 Grow Light Control
        </h3>
      </div>

      {/* Main Toggle */}
      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Light Status</span>
        <button
          onClick={handleToggleLight}
          disabled={isLoading}
          className="relative inline-flex items-center h-6 w-11 rounded-full transition-colors"
          style={{
            background: status ? "var(--gold-400)" : "var(--border-subtle)",
          }}
        >
          <span
            className="inline-block h-5 w-5 transform rounded-full bg-white transition-transform"
            style={{
              transform: status ? "translateX(20px)" : "translateX(2px)",
            }}
          />
          {isLoading && <Loader2 size={14} className="absolute animate-spin" style={{ color: "var(--text-primary)" }} />}
        </button>
      </div>

      {/* Brightness Control */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Brightness</span>
          <span className="font-mono text-xs font-bold" style={{ color: "var(--gold-400)" }}>
            {brightness}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={brightness}
          onChange={(e) => handleBrightnessChange(parseInt(e.target.value))}
          disabled={!status}
          className="w-full h-2 rounded-lg"
          style={{
            background: `linear-gradient(to right, var(--border-subtle) 0%, var(--gold-400) ${brightness}%, var(--border-subtle) ${brightness}%, var(--border-subtle) 100%)`,
            opacity: status ? 1 : 0.5,
          }}
        />
      </div>

      {/* Status Indicator */}
      <div className="rounded-lg p-2 text-center" style={{ background: "rgba(255,255,255,0.03)" }}>
        <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
          {status ? `🟡 Light ON (${brightness}% brightness)` : "⚫ Light OFF"}
        </p>
      </div>

      {/* Schedule Info */}
      <div className="rounded-lg p-2 text-center border" style={{ background: "rgba(255,255,255,0.02)", borderColor: "var(--border-subtle)" }}>
        <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
          {schedule.length > 0
            ? `⏱️ ${schedule.length} light schedule(s) active`
            : "No lighting schedules defined"}
        </p>
      </div>

      <div className="space-y-2 border-t pt-3" style={{ borderColor: "var(--border-subtle)" }}>
        <p className="text-[10px] font-semibold uppercase" style={{ color: "var(--text-muted)" }}>
          Schedule Presets
        </p>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handlePreset("12h")}
            disabled={isLoading}
            className="rounded-lg px-2 py-2 text-[11px] font-semibold transition-all"
            style={{
              background: "rgba(250,204,21,0.12)",
              color: "var(--gold-400)",
              border: "1px solid rgba(250,204,21,0.22)",
            }}
          >
            12h
          </button>
          <button
            onClick={() => handlePreset("16h")}
            disabled={isLoading}
            className="rounded-lg px-2 py-2 text-[11px] font-semibold transition-all"
            style={{
              background: "rgba(250,204,21,0.12)",
              color: "var(--gold-400)",
              border: "1px solid rgba(250,204,21,0.22)",
            }}
          >
            16h
          </button>
          <button
            onClick={() => handlePreset("custom")}
            disabled={isLoading}
            className="rounded-lg px-2 py-2 text-[11px] font-semibold transition-all"
            style={{
              background: "rgba(250,204,21,0.12)",
              color: "var(--gold-400)",
              border: "1px solid rgba(250,204,21,0.22)",
            }}
          >
            Custom
          </button>
        </div>
      </div>
    </div>
  );
}
