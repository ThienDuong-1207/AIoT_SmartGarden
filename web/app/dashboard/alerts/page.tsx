"use client";

import { useState } from "react";
import {
  Bell, BellOff, AlertTriangle, CheckCircle2, Info,
  Wifi, WifiOff, Droplets, FlaskConical, Thermometer,
  Camera, Zap, Filter, Trash2, CheckCheck, ChevronRight,
  Leaf,
} from "lucide-react";

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
type AlertLevel = "critical" | "warning" | "info" | "success";
type AlertCategory = "sensor" | "ai" | "system" | "device";

type Alert = {
  id: string;
  level: AlertLevel;
  category: AlertCategory;
  deviceId: string;
  deviceName: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
};

/* ─────────────────────────────────────────
   Mock data
───────────────────────────────────────── */
const MOCK_ALERTS: Alert[] = [
  {
    id: "a1",
    level: "critical",
    category: "sensor",
    deviceId: "SGP-2024-001",
    deviceName: "Chậu Húng Quế",
    title: "TDS vượt ngưỡng nguy hiểm",
    message: "TDS = 2180 ppm — Nồng độ chất rắn hòa tan quá cao. Pha loãng ngay bằng nước sạch để tránh cháy rễ.",
    timestamp: "2026-03-21T08:14:00Z",
    read: false,
  },
  {
    id: "a2",
    level: "warning",
    category: "sensor",
    deviceId: "SGP-2024-002",
    deviceName: "Rau Cải Nhà Bếp",
    title: "pH ngoài khoảng lý tưởng",
    message: "pH = 7.3 — Cao hơn ngưỡng tối đa (7.0). Rễ cây khó hấp thu Fe, Mn. Thêm pH Down để điều chỉnh.",
    timestamp: "2026-03-21T07:45:00Z",
    read: false,
  },
  {
    id: "a3",
    level: "critical",
    category: "device",
    deviceId: "SGP-2024-003",
    deviceName: "Chậu Dâu Tây",
    title: "Thiết bị mất kết nối",
    message: "Không nhận được tín hiệu từ SGP-2024-003 trong 42 phút. Kiểm tra nguồn điện và kết nối WiFi.",
    timestamp: "2026-03-21T07:32:00Z",
    read: false,
  },
  {
    id: "a4",
    level: "success",
    category: "ai",
    deviceId: "SGP-2024-001",
    deviceName: "Chậu Húng Quế",
    title: "AI: Cây đang khỏe mạnh",
    message: "YOLOv8 phân tích ảnh lúc 06:30 — Không phát hiện bệnh. Confidence 94%. Cây phát triển bình thường.",
    timestamp: "2026-03-21T06:31:00Z",
    read: true,
  },
  {
    id: "a5",
    level: "warning",
    category: "sensor",
    deviceId: "SGP-2024-001",
    deviceName: "Chậu Húng Quế",
    title: "Mực nước bồn thấp",
    message: "Mực nước còn 22% — Dưới ngưỡng 25%. Bổ sung nước vào bồn dự trữ trong 24 giờ tới.",
    timestamp: "2026-03-21T06:00:00Z",
    read: true,
  },
  {
    id: "a6",
    level: "info",
    category: "system",
    deviceId: "SGP-2024-002",
    deviceName: "Rau Cải Nhà Bếp",
    title: "Firmware cập nhật thành công",
    message: "ESP32 SGP-2024-002 đã cập nhật lên firmware v1.3.1. Thêm tính năng hiệu chuẩn TDS tự động.",
    timestamp: "2026-03-20T23:10:00Z",
    read: true,
  },
  {
    id: "a7",
    level: "warning",
    category: "ai",
    deviceId: "SGP-2024-002",
    deviceName: "Rau Cải Nhà Bếp",
    title: "AI: Phát hiện dấu hiệu vàng lá",
    message: "YOLOv8 phát hiện 3 lá có dấu hiệu vàng nhạt (confidence 78%). Kết hợp TDS thấp (680 ppm) → Nghi thiếu đạm N. Đề xuất tăng dung dịch A+B.",
    timestamp: "2026-03-20T18:30:00Z",
    read: true,
  },
  {
    id: "a8",
    level: "info",
    category: "sensor",
    deviceId: "SGP-2024-001",
    deviceName: "Chậu Húng Quế",
    title: "Lịch tưới tự động hoàn thành",
    message: "Bơm nước đã hoạt động 10 phút theo lịch định sẵn (06:00). Dung dịch dinh dưỡng đã được tuần hoàn.",
    timestamp: "2026-03-20T06:11:00Z",
    read: true,
  },
  {
    id: "a9",
    level: "success",
    category: "device",
    deviceId: "SGP-2024-003",
    deviceName: "Chậu Dâu Tây",
    title: "Thiết bị kết nối lại",
    message: "SGP-2024-003 đã online trở lại sau 15 phút mất kết nối. Tất cả sensor đang hoạt động bình thường.",
    timestamp: "2026-03-19T14:22:00Z",
    read: true,
  },
];

/* ─────────────────────────────────────────
   Config maps
───────────────────────────────────────── */
const LEVEL_CONFIG: Record<AlertLevel, {
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  label: string;
}> = {
  critical: { icon: AlertTriangle, color: "#F87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.22)", label: "Nguy hiểm" },
  warning:  { icon: AlertTriangle, color: "#FBBF24", bg: "rgba(251,191,36,0.08)",  border: "rgba(251,191,36,0.22)",  label: "Cảnh báo"  },
  info:     { icon: Info,          color: "#60A5FA", bg: "rgba(96,165,250,0.08)",  border: "rgba(96,165,250,0.22)",  label: "Thông tin" },
  success:  { icon: CheckCircle2,  color: "var(--emerald-400)", bg: "rgba(34,197,94,0.08)", border: "rgba(74,222,128,0.20)", label: "Tốt" },
};

const CATEGORY_ICON: Record<AlertCategory, React.ElementType> = {
  sensor: Droplets,
  ai:     Camera,
  system: Zap,
  device: Wifi,
};

const CATEGORY_LABEL: Record<AlertCategory, string> = {
  sensor: "Sensor",
  ai:     "AI",
  system: "Hệ thống",
  device: "Thiết bị",
};

type FilterType = "all" | AlertLevel | AlertCategory;

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */
function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH} giờ trước`;
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

/* ─────────────────────────────────────────
   AlertItem component
───────────────────────────────────────── */
function AlertItem({
  alert,
  onMarkRead,
  onDelete,
}: {
  alert: Alert;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const cfg = LEVEL_CONFIG[alert.level];
  const LevelIcon = cfg.icon;
  const CatIcon = CATEGORY_ICON[alert.category];

  return (
    <div
      className="group relative flex gap-4 rounded-2xl p-4 transition-all duration-200"
      style={{
        background: alert.read ? "rgba(255,255,255,0.02)" : cfg.bg,
        border: `1px solid ${alert.read ? "var(--border-subtle)" : cfg.border}`,
      }}
    >
      {/* Unread dot */}
      {!alert.read && (
        <span
          className="absolute right-4 top-4 h-2 w-2 rounded-full"
          style={{ background: cfg.color }}
        />
      )}

      {/* Level icon */}
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
      >
        <LevelIcon size={16} style={{ color: cfg.color }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Top row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category badge */}
          <span
            className="flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[9px] font-semibold"
            style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-muted)" }}
          >
            <CatIcon size={9} />
            {CATEGORY_LABEL[alert.category]}
          </span>
          {/* Device badge */}
          <span
            className="flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[9px] font-semibold"
            style={{ background: "rgba(34,197,94,0.08)", color: "var(--emerald-400)" }}
          >
            <Leaf size={9} />
            {alert.deviceName}
          </span>
          <span className="ml-auto text-[10px]" style={{ color: "var(--text-muted)" }}>
            {formatTime(alert.timestamp)}
          </span>
        </div>

        {/* Title */}
        <p
          className="mt-2 text-sm font-semibold"
          style={{ color: alert.read ? "var(--text-secondary)" : "var(--text-primary)" }}
        >
          {alert.title}
        </p>

        {/* Message */}
        <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
          {alert.message}
        </p>

        {/* Actions */}
        <div className="mt-3 flex items-center gap-2">
          {!alert.read && (
            <button
              onClick={() => onMarkRead(alert.id)}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-semibold transition-all"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-secondary)",
              }}
            >
              <CheckCheck size={10} />
              Đánh dấu đã đọc
            </button>
          )}
          {alert.category === "device" && (
            <button
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-semibold transition-all"
              style={{
                background: "rgba(34,197,94,0.06)",
                border: "1px solid rgba(74,222,128,0.18)",
                color: "var(--emerald-400)",
              }}
            >
              Xem thiết bị
              <ChevronRight size={10} />
            </button>
          )}
          <button
            onClick={() => onDelete(alert.id)}
            className="ml-auto flex items-center gap-1 rounded-lg p-1.5 opacity-0 transition-all group-hover:opacity-100"
            style={{ color: "var(--text-muted)" }}
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Main page
───────────────────────────────────────── */
export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [filter, setFilter] = useState<FilterType>("all");

  const unreadCount = alerts.filter((a) => !a.read).length;

  function markRead(id: string) {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));
  }

  function markAllRead() {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  }

  function deleteAlert(id: string) {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }

  function clearAll() {
    setAlerts((prev) => prev.filter((a) => !a.read));
  }

  const filtered = alerts.filter((a) => {
    if (filter === "all") return true;
    if (["critical", "warning", "info", "success"].includes(filter)) return a.level === filter;
    return a.category === filter;
  });

  /* stats */
  const stats = [
    { label: "Chưa đọc",   value: unreadCount,                                    color: "#F87171",            icon: BellOff      },
    { label: "Nguy hiểm",  value: alerts.filter((a) => a.level === "critical").length, color: "#F87171",        icon: AlertTriangle },
    { label: "Cảnh báo",   value: alerts.filter((a) => a.level === "warning").length,  color: "#FBBF24",        icon: AlertTriangle },
    { label: "AI Alerts",  value: alerts.filter((a) => a.category === "ai").length,    color: "#60A5FA",        icon: Camera        },
  ];

  const FILTER_OPTIONS: { key: FilterType; label: string }[] = [
    { key: "all",      label: "Tất cả" },
    { key: "critical", label: "Nguy hiểm" },
    { key: "warning",  label: "Cảnh báo" },
    { key: "info",     label: "Thông tin" },
    { key: "success",  label: "Tốt" },
    { key: "sensor",   label: "Sensor" },
    { key: "ai",       label: "AI" },
    { key: "device",   label: "Thiết bị" },
    { key: "system",   label: "Hệ thống" },
  ];

  return (
    <div className="animate-fade-up space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p
            className="mb-1.5 font-mono text-xs font-semibold uppercase tracking-[0.15em]"
            style={{ color: "var(--emerald-500)" }}
          >
            // ALERTS
          </p>
          <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
            Cảnh báo hệ thống
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            Thông báo từ chậu cây, sensor và AI phân tích.
            {unreadCount > 0 && (
              <span style={{ color: "#F87171" }}> · {unreadCount} chưa đọc</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all"
              style={{
                background: "rgba(34,197,94,0.08)",
                border: "1px solid rgba(74,222,128,0.20)",
                color: "var(--emerald-400)",
              }}
            >
              <CheckCheck size={13} />
              Đọc tất cả
            </button>
          )}
          <button
            onClick={clearAll}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-muted)",
            }}
          >
            <Trash2 size={13} />
            Xoá đã đọc
          </button>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="stat-card flex items-center gap-3">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{ background: "rgba(255,255,255,0.04)", color }}
            >
              <Icon size={16} />
            </div>
            <div>
              <p className="text-xl font-black" style={{ color }}>
                {value}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter chips ── */}
      <div className="flex flex-wrap gap-2">
        <span className="flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
          <Filter size={11} />
          <span className="text-[10px] font-semibold uppercase tracking-wider">Lọc</span>
        </span>
        {FILTER_OPTIONS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className="rounded-full px-3 py-1 text-xs font-semibold transition-all"
            style={
              filter === key
                ? {
                    background:
                      key === "critical" ? "rgba(248,113,113,0.15)" :
                      key === "warning"  ? "rgba(251,191,36,0.15)"  :
                      key === "success"  ? "rgba(34,197,94,0.12)"   :
                      key === "info"     ? "rgba(96,165,250,0.15)"  :
                      "rgba(34,197,94,0.10)",
                    color:
                      key === "critical" ? "#F87171" :
                      key === "warning"  ? "#FBBF24" :
                      key === "success"  ? "var(--emerald-400)" :
                      key === "info"     ? "#60A5FA" :
                      "var(--emerald-400)",
                    border:
                      key === "critical" ? "1px solid rgba(248,113,113,0.30)" :
                      key === "warning"  ? "1px solid rgba(251,191,36,0.30)"  :
                      key === "success"  ? "1px solid rgba(74,222,128,0.25)"  :
                      key === "info"     ? "1px solid rgba(96,165,250,0.30)"  :
                      "1px solid rgba(74,222,128,0.22)",
                  }
                : {
                    background: "rgba(255,255,255,0.03)",
                    color: "var(--text-muted)",
                    border: "1px solid var(--border-subtle)",
                  }
            }
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Alert list ── */}
      {filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center rounded-2xl py-20 text-center"
          style={{ background: "var(--bg-elevated)", border: "1px dashed var(--border-normal)" }}
        >
          <div
            className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ background: "rgba(34,197,94,0.08)", color: "var(--emerald-400)" }}
          >
            <Bell size={24} />
          </div>
          <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
            Không có thông báo nào
          </p>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            {filter === "all" ? "Tất cả hệ thống đang hoạt động bình thường." : "Không có thông báo cho bộ lọc này."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Unread group */}
          {filtered.some((a) => !a.read) && (
            <div className="space-y-2">
              <p className="px-1 font-mono text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}>
                Chưa đọc
              </p>
              {filtered.filter((a) => !a.read).map((alert) => (
                <AlertItem
                  key={alert.id}
                  alert={alert}
                  onMarkRead={markRead}
                  onDelete={deleteAlert}
                />
              ))}
            </div>
          )}

          {/* Read group */}
          {filtered.some((a) => a.read) && (
            <div className="space-y-2">
              <p className="px-1 font-mono text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}>
                Đã đọc
              </p>
              {filtered.filter((a) => a.read).map((alert) => (
                <AlertItem
                  key={alert.id}
                  alert={alert}
                  onMarkRead={markRead}
                  onDelete={deleteAlert}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
