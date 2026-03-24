"use client";

import { useRef, useState } from "react";
import { useSession } from "next-auth/react";
import {
  User, Mail, Phone, MapPin, Camera, Save, CheckCircle,
  Bell, Shield, Smartphone, Globe, Key,
  Eye, EyeOff,
} from "lucide-react";

/* ─────────────────────────────────────────
   Section wrapper
───────────────────────────────────────── */
function Section({
  icon: Icon,
  iconColor = "var(--text-muted)",
  title,
  children,
}: {
  icon: React.ElementType;
  iconColor?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="overflow-hidden rounded-2xl"
      style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
    >
      <div
        className="flex items-center gap-2.5 px-5 py-4"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <Icon size={13} style={{ color: iconColor }} />
        </div>
        <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          {title}
        </span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

/* Toggle switch */
function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className="relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200"
      style={{ background: on ? "var(--emerald-500)" : "rgba(255,255,255,0.10)" }}
    >
      <span
        className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200"
        style={{ left: on ? "calc(100% - 18px)" : "2px" }}
      />
    </button>
  );
}

/* Input field */
function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  icon: Icon,
  readOnly,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  type?: string;
  icon?: React.ElementType;
  readOnly?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
        {label}
      </label>
      <div
        className="flex items-center gap-3 rounded-xl px-4 py-2.5"
        style={{
          background: readOnly ? "rgba(255,255,255,0.02)" : "var(--bg-overlay)",
          border: `1px solid ${readOnly ? "var(--border-subtle)" : "var(--border-normal)"}`,
        }}
      >
        {Icon && <Icon size={13} style={{ color: "var(--text-muted)", flexShrink: 0 }} />}
        <input
          type={type}
          value={value}
          readOnly={readOnly}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-xs focus:outline-none"
          style={{
            color: readOnly ? "var(--text-muted)" : "var(--text-primary)",
            cursor: readOnly ? "default" : "text",
          }}
        />
        {readOnly && (
          <span
            className="rounded-full px-2 py-0.5 font-mono text-[9px] font-semibold"
            style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-muted)" }}
          >
            Tự động
          </span>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Main
───────────────────────────────────────── */
export default function UserSettingsPage() {
  const { data: session } = useSession();

  /* Profile */
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [phone, setPhone]             = useState("");
  const [location, setLocation]       = useState("");
  const [bio, setBio]                 = useState("");
  const avatarRef                     = useRef<HTMLInputElement>(null);

  /* Notifications */
  const [pushOn, setPushOn]           = useState(true);
  const [emailOn, setEmailOn]         = useState(true);
  const [smsOn, setSmsOn]             = useState(false);
  const [aiAlertOn, setAiAlertOn]     = useState(true);
  const [sensorAlertOn, setSensorAlertOn] = useState(true);
  const [weeklyReport, setWeeklyReport]   = useState(false);

  /* Security */
  const [showPass, setShowPass]       = useState(false);
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass]         = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  void confirmPass;

  /* Save feedback */
  const [saved, setSaved]             = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const sessionDisplayName = session?.user?.name ?? "";
  const email = session?.user?.email ?? "";
  const avatar = session?.user?.image ?? "";
  const profileDisplayName = displayName ?? sessionDisplayName;
  const initial = (profileDisplayName || email || "U").charAt(0).toUpperCase();

  return (
    <div className="animate-fade-up mx-auto max-w-2xl space-y-5">

      {/* ── Page heading ── */}
      <div>
        <p
          className="mb-1.5 font-mono text-xs font-semibold uppercase tracking-[0.15em]"
          style={{ color: "var(--emerald-500)" }}
        >
          {"// USER SETTINGS"}
        </p>
        <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
          Cài đặt tài khoản
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Quản lý hồ sơ, thông báo và bảo mật tài khoản của bạn.
        </p>
      </div>

      {/* ══════════════════════════════
          PROFILE
      ══════════════════════════════ */}
      <Section icon={User} iconColor="var(--emerald-400)" title="Hồ sơ cá nhân">
        {/* Avatar */}
        <div className="mb-6 flex items-center gap-5">
          <div className="relative">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatar}
                alt={displayName || "avatar"}
                className="h-16 w-16 rounded-2xl object-cover"
                style={{ boxShadow: "0 0 24px rgba(34,197,94,0.25)" }}
              />
            ) : (
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-black"
                style={{
                  background: "linear-gradient(135deg, var(--emerald-500), var(--emerald-600))",
                  boxShadow: "0 0 24px rgba(34,197,94,0.25)",
                }}
              >
                {initial}
              </div>
            )}
            <button
              onClick={() => avatarRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full"
              style={{
                background: "var(--bg-overlay)",
                border: "1px solid var(--border-normal)",
              }}
            >
              <Camera size={11} style={{ color: "var(--text-secondary)" }} />
            </button>
            <input ref={avatarRef} type="file" accept="image/*" className="hidden" />
          </div>
          <div>
            <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{profileDisplayName}</p>
            <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>{email}</p>
            <button
              onClick={() => avatarRef.current?.click()}
              className="mt-2 text-xs font-semibold transition-colors"
              style={{ color: "var(--emerald-400)" }}
            >
              Đổi ảnh đại diện
            </button>
          </div>
        </div>

        {/* Fields */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Tên hiển thị"
            value={profileDisplayName}
            onChange={setDisplayName}
            placeholder="Nhập tên của bạn"
            icon={User}
          />
          <Field
            label="Email"
            value={email}
            icon={Mail}
            readOnly
          />
          <Field
            label="Số điện thoại"
            value={phone}
            onChange={setPhone}
            placeholder="Nhập số điện thoại"
            icon={Phone}
          />
          <Field
            label="Vị trí"
            value={location}
            onChange={setLocation}
            placeholder="Nhập thành phố, quốc gia"
            icon={MapPin}
          />
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
              Giới thiệu
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={2}
              placeholder="Viết vài dòng về bạn..."
              className="w-full resize-none rounded-xl px-4 py-2.5 text-xs focus:outline-none"
              style={{
                background: "var(--bg-overlay)",
                border: "1px solid var(--border-normal)",
                color: "var(--text-primary)",
              }}
            />
          </div>
        </div>
      </Section>

      {/* ══════════════════════════════
          NOTIFICATIONS
      ══════════════════════════════ */}
      <Section icon={Bell} iconColor="#FBBF24" title="Thông báo">
        <div className="space-y-0 divide-y" style={{ borderColor: "var(--border-subtle)" }}>
          {[
            {
              icon: Smartphone, label: "Push Notification",
              desc: "Nhận cảnh báo tức thì trên điện thoại (Firebase FCM)",
              on: pushOn, set: setPushOn, color: "var(--emerald-400)",
            },
            {
              icon: Mail, label: "Email Alert",
              desc: "Báo cáo hàng ngày và cảnh báo khẩn cấp qua email",
              on: emailOn, set: setEmailOn, color: "#60A5FA",
            },
            {
              icon: Phone, label: "SMS Alert",
              desc: "Tin nhắn SMS khi xảy ra sự cố nghiêm trọng",
              on: smsOn, set: setSmsOn, color: "#FBBF24",
            },
          ].map(({ icon: Icon, label, desc, on, set, color }) => (
            <div key={label} className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: on ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)" }}
                >
                  <Icon size={13} style={{ color: on ? color : "var(--text-muted)" }} />
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

        {/* Alert types */}
        <div
          className="mt-4 rounded-xl p-4 space-y-3"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)" }}
        >
          <p className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Loại cảnh báo</p>
          {[
            { label: "AI phân tích bệnh cây",  desc: "Kết quả YOLOv8 mỗi lần chụp ảnh",   on: aiAlertOn,     set: setAiAlertOn     },
            { label: "Sensor vượt ngưỡng",      desc: "pH, TDS, nhiệt độ, mực nước",         on: sensorAlertOn, set: setSensorAlertOn },
            { label: "Báo cáo hàng tuần",       desc: "Tổng hợp tình trạng cây mỗi tuần",   on: weeklyReport,  set: setWeeklyReport  },
          ].map(({ label, desc, on, set }) => (
            <div key={label} className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{label}</p>
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{desc}</p>
              </div>
              <Toggle on={on} onChange={set} />
            </div>
          ))}
        </div>
      </Section>

      {/* ══════════════════════════════
          SECURITY
      ══════════════════════════════ */}
      <Section icon={Shield} iconColor="#60A5FA" title="Bảo mật">
        <div className="space-y-4">
          {/* Google OAuth note */}
          <div
            className="flex items-center gap-3 rounded-xl p-3"
            style={{ background: "rgba(96,165,250,0.06)", border: "1px solid rgba(96,165,250,0.18)" }}
          >
            <Globe size={14} style={{ color: "#60A5FA", flexShrink: 0 }} />
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              Tài khoản đăng nhập qua <span style={{ color: "#60A5FA" }}>Google OAuth</span>.
              Đổi mật khẩu trực tiếp tại tài khoản Google của bạn.
            </p>
          </div>

          {/* Change password (for email accounts) */}
          <div className="space-y-3 opacity-40 pointer-events-none select-none">
            <div>
              <label className="mb-1.5 block text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                Mật khẩu hiện tại
              </label>
              <div
                className="flex items-center gap-3 rounded-xl px-4 py-2.5"
                style={{ background: "var(--bg-overlay)", border: "1px solid var(--border-normal)" }}
              >
                <Key size={13} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                <input
                  type={showPass ? "text" : "password"}
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  placeholder="••••••••"
                  className="flex-1 bg-transparent text-xs focus:outline-none"
                  style={{ color: "var(--text-primary)" }}
                />
                <button onClick={() => setShowPass((p) => !p)} style={{ color: "var(--text-muted)" }}>
                  {showPass ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Mật khẩu mới" value={newPass} onChange={setNewPass} type="password" placeholder="••••••••" icon={Key} />
              <Field label="Xác nhận mật khẩu" value={confirmPass} onChange={setConfirmPass} type="password" placeholder="••••••••" icon={Key} />
            </div>
          </div>

        </div>
      </Section>

      {/* ── Save button ── */}
      <div className="flex justify-end pb-8">
        <button onClick={handleSave} className="btn-emerald gap-2">
          {saved ? <CheckCircle size={14} /> : <Save size={14} />}
          {saved ? "Đã lưu!" : "Lưu thay đổi"}
        </button>
      </div>
    </div>
  );
}
