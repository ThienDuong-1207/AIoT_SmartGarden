import { AlertTriangle, CheckCircle, Info, Droplets, Bell } from "lucide-react";

type SmartAlertsProps = {
  alerts: string[];
};

/* Classify alert by keywords → severity */
function classify(alert: string): "warning" | "success" | "info" | "danger" {
  const lower = alert.toLowerCase();
  if (lower.includes("thấp") || lower.includes("thap") || lower.includes("còn") || lower.includes("con"))
    return "warning";
  if (lower.includes("ổn định") || lower.includes("on dinh") || lower.includes("khỏe") || lower.includes("khoe"))
    return "success";
  if (lower.includes("nhiệt") || lower.includes("nhiet") || lower.includes("lần") || lower.includes("lan"))
    return "info";
  return "info";
}

const SEVERITY_STYLE = {
  warning: {
    rowClass:    "alert-row-warning",
    icon:        AlertTriangle,
    iconColor:   "var(--gold-500)",
    timeColor:   "var(--gold-400)",
  },
  success: {
    rowClass:    "alert-row-success",
    icon:        CheckCircle,
    iconColor:   "var(--emerald-500)",
    timeColor:   "var(--emerald-400)",
  },
  info: {
    rowClass:    "alert-row-info",
    icon:        Info,
    iconColor:   "var(--blue-400)",
    timeColor:   "var(--blue-400)",
  },
  danger: {
    rowClass:    "alert-row-danger",
    icon:        AlertTriangle,
    iconColor:   "var(--danger)",
    timeColor:   "var(--danger)",
  },
};

/* Mock timestamps for demo */
const MOCK_TIMES = ["2 phút trước", "15 phút trước", "1 giờ trước", "3 giờ trước", "6 giờ trước"];

export default function SmartAlerts({ alerts }: SmartAlertsProps) {
  const items = alerts.slice(0, 5);

  return (
    <section
      className="overflow-hidden rounded-2xl"
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: "rgba(245,158,11,0.10)", color: "var(--gold-400)" }}
          >
            <Bell size={15} />
          </div>
          <div>
            <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
              Smart Alerts
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {items.length} cảnh báo gần nhất
            </p>
          </div>
        </div>

        <span className="badge badge-gold">{items.length} mới</span>
      </div>

      {/* Alert rows */}
      <ul className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
        {items.map((alert, i) => {
          const severity = classify(alert);
          const { rowClass, icon: Icon, iconColor, timeColor } = SEVERITY_STYLE[severity];

          return (
            <li key={`${alert}-${i}`}>
              <div
                className={`alert-row ${rowClass} animate-slide-left`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* Icon */}
                <div
                  className="mt-0.5 shrink-0"
                  style={{ color: iconColor }}
                >
                  <Icon size={15} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {alert}
                  </p>
                  <p
                    className="mt-1 font-mono text-xs"
                    style={{ color: timeColor, opacity: 0.7 }}
                  >
                    {MOCK_TIMES[i] ?? "Vừa xong"}
                  </p>
                </div>

                {/* Sensor icon */}
                <Droplets
                  size={13}
                  className="mt-1 shrink-0 opacity-30"
                  style={{ color: "var(--text-muted)" }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      {/* Footer */}
      <div
        className="px-6 py-3"
        style={{ borderTop: "1px solid var(--border-subtle)" }}
      >
        <p className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
          {">"} Cập nhật qua MQTT WebSocket — realtime ở phase tiếp theo.
        </p>
      </div>
    </section>
  );
}
