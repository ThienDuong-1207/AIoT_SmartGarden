"use client";

import { useState } from "react";
import { Power, Loader2, Droplets } from "lucide-react";

interface PumpControlProps {
  deviceId: string;
  initialStatus: boolean;
  initialSchedule: Array<{ time: string; durationMinutes: number; enabled: boolean }>;
  onUpdate?: (config: any) => void;
  disabled?: boolean;
}

export default function PumpControl({ deviceId, initialStatus, initialSchedule, onUpdate, disabled = false }: PumpControlProps) {
  const [status, setStatus] = useState(initialStatus);
  const [schedule, setSchedule] = useState(initialSchedule);
  const [isLoading, setIsLoading] = useState(false);

  const handleTogglePump = async () => {
    if (disabled) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/devices/${deviceId}/config`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pump: {
            status: !status,
            schedule,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setStatus(data.config.pump.status);
        onUpdate?.(data.config);
      }
    } catch (error) {
      console.error("Failed to update pump:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSchedule = () => {
    if (disabled) return;
    const newSchedule = [
      ...schedule,
      { time: "08:00", durationMinutes: 15, enabled: true },
    ];
    setSchedule(newSchedule);
  };

  const handleRemoveSchedule = (index: number) => {
    if (disabled) return;
    setSchedule(schedule.filter((_, i) => i !== index));
  };

  const handleUpdateScheduleTime = (index: number, time: string) => {
    if (disabled) return;
    const updated = [...schedule];
    updated[index].time = time;
    setSchedule(updated);
  };

  return (
    <div className="rounded-2xl p-4 space-y-4" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
      <div className="flex items-center gap-3">
        <Droplets size={18} style={{ color: "var(--blue-400)" }} />
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          💧 Water Pump Control
        </h3>
      </div>

      {/* Main Toggle */}
      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Pump Status</span>
        <button
          onClick={handleTogglePump}
          disabled={isLoading || disabled}
          className="relative inline-flex items-center h-6 w-11 rounded-full transition-colors"
          style={{
            background: status ? "var(--emerald-400)" : "var(--border-subtle)",
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

      {/* Status Indicator */}
      <div className="rounded-lg p-2 text-center" style={{ background: "rgba(255,255,255,0.03)" }}>
        <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
          {status ? "🟢 Pump is ON" : "⚫ Pump is OFF"}
        </p>
      </div>

      {/* Schedule List */}
      <div className="space-y-2 border-t pt-3" style={{ borderColor: "var(--border-subtle)" }}>
        <p className="text-[10px] font-semibold uppercase" style={{ color: "var(--text-muted)" }}>
          Auto-Watering Schedule ({schedule.length})
        </p>
        {schedule.length === 0 ? (
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>No scheduled watering times</p>
        ) : (
          schedule.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 rounded-lg p-2" style={{ background: "rgba(255,255,255,0.02)" }}>
              <input
                type="time"
                value={item.time}
                onChange={(e) => handleUpdateScheduleTime(idx, e.target.value)}
                disabled={disabled}
                className="text-xs flex-1 rounded px-2 py-1"
                style={{ background: "var(--bg-base)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)" }}
              />
              <span className="text-[10px]" style={{ color: "var(--text-secondary)" }}>
                {item.durationMinutes}min
              </span>
              <button
                onClick={() => handleRemoveSchedule(idx)}
                disabled={disabled}
                className="rounded px-2 py-1 text-[10px]"
                style={{ background: "rgba(239,68,68,0.2)", color: "#F87171" }}
              >
                ✕
              </button>
            </div>
          ))
        )}
        <button
          onClick={handleAddSchedule}
          disabled={disabled}
          className="w-full rounded-lg py-2 text-xs font-semibold transition-all"
          style={{
            background: "rgba(16,185,129,0.1)",
            color: "var(--emerald-400)",
            border: "1px solid rgba(16,185,129,0.2)",
          }}
        >
          + Add Schedule
        </button>
      </div>
    </div>
  );
}
