"use client";

import { useState } from "react";
import { Droplets, Loader2, Clock3 } from "lucide-react";

type WateringItem = {
  time: string;
  durationMinutes: number;
  enabled: boolean;
};

interface WateringScheduleProps {
  deviceId: string;
  initialWatering: {
    autoMode: boolean;
    intervalHours?: number;
    schedule: WateringItem[];
  };
  onUpdate?: (config: { watering: { autoMode: boolean; intervalHours: number; schedule: WateringItem[] } }) => void;
}

export default function WateringSchedule({ deviceId, initialWatering, onUpdate }: WateringScheduleProps) {
  const [autoMode, setAutoMode] = useState(initialWatering.autoMode);
  const [intervalHours, setIntervalHours] = useState(initialWatering.intervalHours ?? 6);
  const [schedule, setSchedule] = useState<WateringItem[]>(initialWatering.schedule || []);
  const [saving, setSaving] = useState(false);

  const saveWatering = async (next?: {
    autoMode?: boolean;
    intervalHours?: number;
    schedule?: WateringItem[];
  }) => {
    const payload = {
      autoMode: next?.autoMode ?? autoMode,
      intervalHours: next?.intervalHours ?? intervalHours,
      schedule: next?.schedule ?? schedule,
    };

    const res = await fetch(`/api/devices/${deviceId}/config`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ watering: payload }),
    });

    if (!res.ok) {
      throw new Error("Failed to update watering config");
    }

    const data = await res.json();
    const nextWatering = data.device?.config?.watering ?? data.config?.watering;
    if (nextWatering) {
      setAutoMode(nextWatering.autoMode);
      setIntervalHours(nextWatering.intervalHours ?? payload.intervalHours);
      setSchedule(nextWatering.schedule ?? payload.schedule);
      onUpdate?.({
        watering: {
          autoMode: nextWatering.autoMode,
          intervalHours: nextWatering.intervalHours ?? payload.intervalHours,
          schedule: nextWatering.schedule ?? payload.schedule,
        },
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveWatering();
    } catch (error) {
      console.error("Failed to save watering schedule:", error);
    } finally {
      setSaving(false);
    }
  };

  const addSchedule = () => {
    setSchedule((prev) => [...prev, { time: "08:00", durationMinutes: 15, enabled: true }]);
  };

  const updateSchedule = (index: number, patch: Partial<WateringItem>) => {
    setSchedule((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const removeSchedule = (index: number) => {
    setSchedule((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="rounded-2xl p-4 space-y-4" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
      <div className="flex items-center gap-3">
        <Droplets size={18} style={{ color: "var(--blue-400)" }} />
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Watering Schedule
        </h3>
      </div>

      <div className="flex items-center justify-between rounded-lg p-2" style={{ background: "rgba(255,255,255,0.03)" }}>
        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Auto Mode</span>
        <button
          onClick={() => setAutoMode((v) => !v)}
          className="relative inline-flex items-center h-6 w-11 rounded-full transition-colors"
          style={{ background: autoMode ? "var(--emerald-400)" : "var(--border-subtle)" }}
        >
          <span
            className="inline-block h-5 w-5 transform rounded-full bg-white transition-transform"
            style={{ transform: autoMode ? "translateX(20px)" : "translateX(2px)" }}
          />
        </button>
      </div>

      <div className="space-y-2">
        <label className="text-xs flex items-center gap-1" style={{ color: "var(--text-secondary)" }}>
          <Clock3 size={12} />
          Interval (hours)
        </label>
        <input
          type="number"
          min={1}
          max={24}
          value={intervalHours}
          onChange={(e) => setIntervalHours(Math.max(1, Math.min(24, Number(e.target.value) || 1)))}
          className="w-full rounded px-2 py-2 text-xs"
          style={{ background: "var(--bg-base)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)" }}
        />
      </div>

      <div className="space-y-2 border-t pt-3" style={{ borderColor: "var(--border-subtle)" }}>
        <p className="text-[10px] font-semibold uppercase" style={{ color: "var(--text-muted)" }}>
          Watering Times ({schedule.length})
        </p>
        {schedule.map((item, idx) => (
          <div key={idx} className="grid grid-cols-12 gap-2 items-center rounded-lg p-2" style={{ background: "rgba(255,255,255,0.02)" }}>
            <input
              type="time"
              value={item.time}
              onChange={(e) => updateSchedule(idx, { time: e.target.value })}
              className="col-span-5 rounded px-2 py-1 text-xs"
              style={{ background: "var(--bg-base)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)" }}
            />
            <input
              type="number"
              min={1}
              max={120}
              value={item.durationMinutes}
              onChange={(e) => updateSchedule(idx, { durationMinutes: Math.max(1, Math.min(120, Number(e.target.value) || 1)) })}
              className="col-span-4 rounded px-2 py-1 text-xs"
              style={{ background: "var(--bg-base)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)" }}
            />
            <button
              onClick={() => removeSchedule(idx)}
              className="col-span-3 rounded px-2 py-1 text-[11px]"
              style={{ background: "rgba(239,68,68,0.2)", color: "#F87171" }}
            >
              Remove
            </button>
          </div>
        ))}

        <button
          onClick={addSchedule}
          className="w-full rounded-lg py-2 text-xs font-semibold"
          style={{ background: "rgba(59,130,246,0.1)", color: "var(--blue-400)", border: "1px solid rgba(59,130,246,0.2)" }}
        >
          + Add Watering Time
        </button>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full rounded-lg py-2 text-xs font-semibold flex items-center justify-center gap-2"
        style={{ background: "rgba(16,185,129,0.15)", color: "var(--emerald-400)", border: "1px solid rgba(16,185,129,0.25)" }}
      >
        {saving && <Loader2 size={13} className="animate-spin" />}
        Save Watering Config
      </button>
    </div>
  );
}
