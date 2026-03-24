"use client";

import { useState } from "react";
import {
  Leaf, Bell, Wifi, Cpu, Camera, Shield,
  CheckCircle, Trash2, RefreshCw, Save,
} from "lucide-react";

type Params = Promise<{ deviceId: string }>;

export default function SettingsPage() {
  const [deviceName, setDeviceName]         = useState("Chậu Húng Quế");
  const [plantType, setPlantType]           = useState("Húng quế");
  const [camInterval, setCamInterval]       = useState("6");
  const [pushEnabled, setPushEnabled]       = useState(true);
  const [emailEnabled, setEmailEnabled]     = useState(false);
  const [saved, setSaved]                   = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
    return (
      <button
        onClick={() => onChange(!on)}
        className="relative h-5 w-9 rounded-full transition-colors duration-200"
        style={{ background: on ? "var(--emerald-500)" : "rgba(255,255,255,0.10)" }}
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
          className="flex items-center gap-2 px-5 py-4"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <Leaf size={14} style={{ color: "var(--emerald-400)" }} />
          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Thông tin thiết bị</span>
        </div>
        <div className="grid gap-4 p-5 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
              Tên chậu cây
            </label>
            <input
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              className="dark-input w-full text-sm"
              placeholder="VD: Chậu Rau Cải Nhà Bếp"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
              Loại cây trồng
            </label>
            <select
              value={plantType}
              onChange={(e) => setPlantType(e.target.value)}
              className="dark-select w-full text-sm"
            >
              {["Húng quế", "Cải xanh", "Rau muống", "Xà lách", "Dâu tây", "Cà chua bi"].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
              Ảnh chậu cây
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
                Kéo thả ảnh hoặc <span style={{ color: "var(--emerald-400)" }}>chọn file</span>
              </p>
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>PNG, JPG — tối đa 5MB</p>
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
          className="flex items-center gap-2 px-5 py-4"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <Camera size={14} style={{ color: "var(--text-muted)" }} />
          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Lịch chụp camera</span>
        </div>
        <div className="p-5">
          <p className="mb-3 text-xs" style={{ color: "var(--text-muted)" }}>
            ESP32 sẽ chụp ảnh theo lịch và gửi lên AI để phân tích tự động.
          </p>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { value: "1", label: "1 giờ" },
              { value: "6", label: "6 giờ" },
              { value: "12", label: "12 giờ" },
              { value: "24", label: "Mỗi ngày" },
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
                Mỗi {label}
              </button>
            ))}
          </div>
          <p className="mt-3 font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>
            Chụp tiếp theo: 20:30 hôm nay · Topic: garden/{"deviceId"}/camera
          </p>
        </div>
      </div>

      {/* ── Notifications ── */}
      <div
        className="overflow-hidden rounded-2xl"
        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
      >
        <div
          className="flex items-center gap-2 px-5 py-4"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <Bell size={14} style={{ color: "var(--gold-400)" }} />
          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Thông báo</span>
        </div>
        <div className="divide-y p-5 space-y-0" style={{ borderColor: "var(--border-subtle)" }}>
          {[
            {
              icon: Bell, label: "Push Notification (Firebase FCM)",
              desc: "Gửi cảnh báo tức thì đến điện thoại", on: pushEnabled, set: setPushEnabled,
              color: "var(--gold-400)",
            },
            {
              icon: Shield, label: "Email Alert",
              desc: "Gửi báo cáo hàng ngày và cảnh báo khẩn", on: emailEnabled, set: setEmailEnabled,
              color: "var(--blue-400)",
            },
          ].map(({ icon: Icon, label, desc, on, set, color }) => (
            <div
              key={label}
              className="flex items-center justify-between py-4"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: on ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)" }}
                >
                  <Icon size={15} style={{ color: on ? color : "var(--text-muted)" }} />
                </div>
                <div>
                  <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{label}</p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{desc}</p>
                </div>
              </div>
              <Toggle on={on} onChange={set} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Device Info ── */}
      <div
        className="overflow-hidden rounded-2xl"
        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
      >
        <div
          className="flex items-center gap-2 px-5 py-4"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <Cpu size={14} style={{ color: "var(--text-muted)" }} />
          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Thông tin phần cứng</span>
        </div>
        <div className="divide-y px-5" style={{ borderColor: "var(--border-subtle)" }}>
          {[
            { label: "Device ID",       value: "SGP-2024-001",        mono: true },
            { label: "MCU",             value: "ESP32-S3",             mono: true },
            { label: "Firmware",        value: "v1.2.3",               mono: true },
            { label: "WiFi MAC",        value: "AA:BB:CC:DD:EE:FF",    mono: true },
            { label: "MQTT Broker",     value: "broker.hivemq.cloud",  mono: true },
            { label: "Kết nối",         value: "Online · 2 ngày 14h",  mono: false },
          ].map(({ label, value, mono }) => (
            <div
              key={label}
              className="flex items-center justify-between py-3"
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
        <div className="flex items-center gap-3 px-5 py-4">
          <button className="btn-ghost gap-2 text-xs">
            <RefreshCw size={12} />
            OTA Update
          </button>
          <button className="btn-ghost gap-2 text-xs">
            <Wifi size={12} />
            Kết nối lại MQTT
          </button>
          <button
            className="ml-auto flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-all"
            style={{
              background: "rgba(239,68,68,0.08)",
              color: "#F87171",
              border: "1px solid rgba(239,68,68,0.20)",
            }}
          >
            <Trash2 size={12} />
            Xóa thiết bị
          </button>
        </div>
      </div>

      {/* ── Save button ── */}
      <div className="flex justify-end">
        <button onClick={handleSave} className="btn-emerald gap-2">
          {saved ? <CheckCircle size={14} /> : <Save size={14} />}
          {saved ? "Đã lưu!" : "Lưu cài đặt"}
        </button>
      </div>
    </div>
  );
}
