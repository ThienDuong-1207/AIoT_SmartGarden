"use client";

import { useEffect, useState } from "react";
import {
  Leaf, Bell, Wifi, Cpu, Camera, Shield,
  CheckCircle, Trash2, RefreshCw, Save, AlertCircle,
} from "lucide-react";
import { requestFcmToken } from "@/lib/firebaseClient";

type Params = Promise<{ deviceId: string }>;

export default function SettingsPage() {
  const [deviceName, setDeviceName]         = useState("Basil Pot");
  const [plantType, setPlantType]           = useState("Basil");
  const [camInterval, setCamInterval]       = useState("6");
  const [pushEnabled, setPushEnabled]       = useState(false);
  const [pushLoading, setPushLoading]       = useState(false);
  const [pushError, setPushError]           = useState<string | null>(null);
  const [emailEnabled, setEmailEnabled]     = useState(false);
  const [saved, setSaved]                   = useState(false);

  // Initialize push state based on notification permission
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    setPushEnabled(Notification.permission === "granted");
  }, []);

  async function handlePushToggle(newValue: boolean) {
    setPushLoading(true);
    setPushError(null);

    if (newValue) {
      // Enable push notifications
      const token = await requestFcmToken();
      if (!token) {
        setPushError("Could not enable push notifications");
        setPushLoading(false);
        return;
      }
      setPushEnabled(true);
    } else {
      // Disable push notifications
      try {
        await fetch("/api/users/fcm-token", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: null }),
        });
        setPushEnabled(false);
      } catch (err) {
        setPushError("Failed to disable notifications");
      }
    }
    setPushLoading(false);
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function Toggle({ on, onChange, disabled }: { on: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
    return (
      <button
        onClick={() => !disabled && onChange(!on)}
        disabled={disabled}
        className="relative h-5 w-9 rounded-full transition-colors duration-200"
        style={{
          background: on ? "var(--emerald-500)" : "rgba(255,255,255,0.10)",
          opacity: disabled ? 0.6 : 1,
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        <span
          className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200"
          style={{ left: on ? "calc(100% - 18px)" : "2px" }}
        />
      </button>
    );
  }

  return (
    <div className="animate-fade-up mx-auto max-w-3xl space-y-5">

      {/* ── Device Identity ── */}
      <div
        className="overflow-hidden rounded-2xl"
        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
      >
        <div
          className="flex items-center gap-2 px-4 py-4 sm:px-5"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <Leaf size={14} style={{ color: "var(--emerald-400)" }} />
          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Device Info</span>
        </div>
        <div className="grid gap-4 p-4 sm:p-5 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
              Pot name
            </label>
            <input
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              className="dark-input w-full text-sm"
              placeholder="e.g. Kitchen Greens Pot"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
              Plant type
            </label>
            <select
              value={plantType}
              onChange={(e) => setPlantType(e.target.value)}
              className="dark-select w-full text-sm"
            >
              {["Basil", "Bok choy", "Water spinach", "Lettuce", "Strawberry", "Cherry tomato"].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
              Pot photo
            </label>
            <div
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl py-8 transition-colors"
              style={{
                border: "2px dashed var(--border-subtle)",
                background: "rgba(255,255,255,0.01)",
              }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.18)" }}
              >
                <Camera size={18} style={{ color: "var(--emerald-400)" }} />
              </div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Drag and drop or <span style={{ color: "var(--emerald-400)" }}>choose a file</span>
              </p>
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>PNG, JPG — max 5MB</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Camera Schedule ── */}
      <div
        className="overflow-hidden rounded-2xl"
        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
      >
        <div
          className="flex items-center gap-2 px-4 py-4 sm:px-5"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <Camera size={14} style={{ color: "var(--text-muted)" }} />
          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Camera schedule</span>
        </div>
        <div className="p-4 sm:p-5">
          <p className="mb-3 text-xs" style={{ color: "var(--text-muted)" }}>
            The ESP32 will capture photos on schedule and send them to AI for automatic analysis.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
            {[
              { value: "1", label: "1 hour" },
              { value: "6", label: "6 hours" },
              { value: "12", label: "12 hours" },
              { value: "24", label: "Daily" },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setCamInterval(value)}
                className="rounded-xl py-3 text-xs font-semibold transition-all"
                style={
                  camInterval === value
                    ? { background: "rgba(16,185,129,0.12)", color: "var(--emerald-400)", border: "1px solid rgba(16,185,129,0.28)" }
                    : { background: "rgba(255,255,255,0.02)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }
                }
              >
                Every {label}
              </button>
            ))}
          </div>
          <p className="mt-3 font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>
            Next capture: 20:30 today · Topic: garden/{"deviceId"}/camera
          </p>
        </div>
      </div>

      {/* ── Notifications ── */}
      <div
        className="overflow-hidden rounded-2xl"
        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
      >
        <div
          className="flex items-center gap-2 px-4 py-4 sm:px-5"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <Bell size={14} style={{ color: "var(--gold-400)" }} />
          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Notifications</span>
        </div>
        <div className="divide-y p-4 space-y-0 sm:p-5" style={{ borderColor: "var(--border-subtle)" }}>
          {/* Push Notification */}
          <div
            className="flex flex-col items-start gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
            style={{ borderBottom: "1px solid var(--border-subtle)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{ background: pushEnabled ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)" }}
              >
                <Bell size={15} style={{ color: pushEnabled ? "var(--gold-400)" : "var(--text-muted)" }} />
              </div>
              <div>
                <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>Push Notification (Firebase FCM)</p>
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Send instant alerts to your phone</p>
              </div>
            </div>
            <Toggle on={pushEnabled} onChange={handlePushToggle} disabled={pushLoading} />
          </div>
          
          {/* Push error message */}
          {pushError && (
            <div
              className="flex items-start gap-2 py-3 px-3 rounded-lg"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.20)" }}
            >
              <AlertCircle size={14} style={{ color: "#F87171", marginTop: "1px", flexShrink: 0 }} />
              <p className="text-xs" style={{ color: "#F87171" }}>{pushError}</p>
            </div>
          )}

          {/* Email Alert */}
          <div
            className="flex flex-col items-start gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{ background: emailEnabled ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)" }}
              >
                <Shield size={15} style={{ color: emailEnabled ? "var(--blue-400)" : "var(--text-muted)" }} />
              </div>
              <div>
                <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>Email Alert</p>
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Send daily reports and urgent alerts</p>
              </div>
            </div>
            <Toggle on={emailEnabled} onChange={setEmailEnabled} />
          </div>
        </div>
      </div>

      {/* ── Device Info ── */}
      <div
        className="overflow-hidden rounded-2xl"
        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
      >
        <div
          className="flex items-center gap-2 px-4 py-4 sm:px-5"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <Cpu size={14} style={{ color: "var(--text-muted)" }} />
          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Hardware Info</span>
        </div>
        <div className="divide-y px-4 sm:px-5" style={{ borderColor: "var(--border-subtle)" }}>
          {[
            { label: "Device ID",       value: "SGP-2024-001",        mono: true },
            { label: "MCU",             value: "ESP32-S3",             mono: true },
            { label: "Firmware",        value: "v1.2.3",               mono: true },
            { label: "WiFi MAC",        value: "AA:BB:CC:DD:EE:FF",    mono: true },
            { label: "MQTT Broker",     value: "broker.hivemq.cloud",  mono: true },
            { label: "Connection",      value: "Online · 2d 14h",      mono: false },
          ].map(({ label, value, mono }) => (
            <div
              key={label}
              className="flex flex-col items-start gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}
            >
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</span>
              <span
                className={`text-xs ${mono ? "font-mono" : "font-medium"}`}
                style={{ color: "var(--text-secondary)" }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
        <div className="flex flex-col items-stretch gap-2 px-4 py-4 sm:flex-row sm:items-center sm:gap-3 sm:px-5">
          <button className="btn-ghost w-full gap-2 text-xs sm:w-auto">
            <RefreshCw size={12} />
            OTA Update
          </button>
          <button className="btn-ghost w-full gap-2 text-xs sm:w-auto">
            <Wifi size={12} />
            Reconnect MQTT
          </button>
          <button
            className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-all sm:ml-auto sm:w-auto"
            style={{
              background: "rgba(239,68,68,0.08)",
              color: "#F87171",
              border: "1px solid rgba(239,68,68,0.20)",
            }}
          >
            <Trash2 size={12} />
            Delete device
          </button>
        </div>
      </div>

      {/* ── Save button ── */}
      <div className="flex justify-stretch sm:justify-end">
        <button onClick={handleSave} className="btn-emerald w-full gap-2 sm:w-auto">
          {saved ? <CheckCircle size={14} /> : <Save size={14} />}
          {saved ? "Saved!" : "Save settings"}
        </button>
      </div>
    </div>
  );
}
