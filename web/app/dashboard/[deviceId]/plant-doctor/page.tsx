"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send, Bot, User, BookOpen, ChevronRight, ChevronDown,
  Leaf, Key, Eye, EyeOff, Sparkles, AlertCircle,
  Droplets, FlaskConical, Thermometer, Sun, Wind,
  Sprout, Bug, Beaker, Lightbulb,
} from "lucide-react";

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

type GuideCategory = {
  icon: React.ElementType;
  label: string;
  color: string;
  bg: string;
};

type GuideArticle = {
  category: string;
  title: string;
  summary: string;
  readTime: string;
  tips: string[];
};

/* ─────────────────────────────────────────
   Guide data
───────────────────────────────────────── */
const GUIDE_CATEGORIES: GuideCategory[] = [
  { icon: Sprout,      label: "Cơ bản",      color: "var(--emerald-400)", bg: "rgba(34,197,94,0.10)"  },
  { icon: Beaker,      label: "Dinh dưỡng",  color: "#60A5FA",            bg: "rgba(96,165,250,0.10)" },
  { icon: Bug,         label: "Bệnh cây",    color: "#F87171",            bg: "rgba(248,113,113,0.10)" },
  { icon: Lightbulb,   label: "Ánh sáng",    color: "#FBBF24",            bg: "rgba(251,191,36,0.10)" },
];

const GUIDE_ARTICLES: GuideArticle[] = [
  {
    category: "Cơ bản",
    title: "Bắt đầu với thủy canh",
    summary: "Hệ thống thủy canh cơ bản, các loại giá thể và thiết lập môi trường lý tưởng cho cây trồng.",
    readTime: "5 phút",
    tips: [
      "Giữ nhiệt độ nước 18–24 °C để rễ cây phát triển tốt nhất.",
      "Thay nước bồn mỗi 7–10 ngày để tránh tích tụ muối khoáng.",
      "pH lý tưởng cho hầu hết rau ăn lá là 5.8–6.5.",
    ],
  },
  {
    category: "Dinh dưỡng",
    title: "Điều chỉnh pH chính xác",
    summary: "pH ảnh hưởng trực tiếp đến khả năng hấp thụ dinh dưỡng. Biết cách tăng/giảm pH an toàn.",
    readTime: "8 phút",
    tips: [
      "Dùng pH Down (axit photphoric) để giảm, pH Up (kali hydroxit) để tăng.",
      "Thêm từng giọt nhỏ, khuấy đều và đo lại sau 5 phút.",
      "Đo pH vào cùng một thời điểm trong ngày để so sánh chính xác.",
    ],
  },
  {
    category: "Dinh dưỡng",
    title: "Dung dịch dinh dưỡng A+B",
    summary: "Cách pha dung dịch A+B đúng tỉ lệ, điều chỉnh TDS theo từng giai đoạn sinh trưởng.",
    readTime: "6 phút",
    tips: [
      "Giai đoạn mầm: TDS 400–600 ppm. Tăng dần lên 1000–1400 ppm khi cây trưởng thành.",
      "Pha A trước, sau đó mới pha B vào bồn nước (không pha chung trong cùng 1 bình).",
      "Dung dịch màu nâu hoặc có mùi hôi → thay hoàn toàn ngay.",
    ],
  },
  {
    category: "Bệnh cây",
    title: "Nhận biết bệnh lá phổ biến",
    summary: "Vàng lá, đốm nâu, lá cong — mỗi triệu chứng chỉ ra một vấn đề khác nhau về dinh dưỡng hoặc môi trường.",
    readTime: "10 phút",
    tips: [
      "Lá vàng đều từ dưới lên → thiếu đạm (N), tăng TDS hoặc thêm dung dịch.",
      "Đốm nâu viền vàng → bệnh nấm, giảm độ ẩm không khí và tăng thông gió.",
      "Lá cong vào trong → mất nước hoặc nhiệt độ quá cao (>30 °C).",
    ],
  },
  {
    category: "Ánh sáng",
    title: "Tối ưu grow light",
    summary: "Loại đèn, khoảng cách và lịch chiếu sáng phù hợp cho từng loại cây thủy canh.",
    readTime: "7 phút",
    tips: [
      "Đèn LED full-spectrum: cách mặt cây 20–40 cm tuỳ công suất.",
      "Rau ăn lá cần 14–16 giờ sáng/ngày. Cây ăn quả cần 18 giờ giai đoạn sinh dưỡng.",
      "Tắt đèn hoàn toàn 6–8 tiếng để cây có chu kỳ tối — đừng để đèn 24/24.",
    ],
  },
];

/* ─────────────────────────────────────────
   Initial AI message
───────────────────────────────────────── */
const INITIAL_MESSAGES: Message[] = [
  {
    role: "assistant",
    content: "Xin chào! Tôi là **Plant Doctor AI**.\n\nNhập API key Gemini của bạn ở trên để bắt đầu. Tôi sẽ tư vấn chuyên sâu về:\n- Chẩn đoán bệnh lá & thiếu dinh dưỡng\n- Điều chỉnh pH, TDS tối ưu\n- Lịch chăm sóc cây thủy canh\n- Phân tích dữ liệu sensor realtime",
    timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
  },
];

const SUGGESTIONS = [
  "Cây bị vàng lá phải làm gì?",
  "TDS 1150 ppm có ổn không?",
  "Làm thế nào để điều chỉnh pH xuống 6.0?",
  "Khi nào cần thay nước bồn thủy canh?",
];

const SENSOR_CONTEXT = [
  { label: "TDS",       value: "1150 ppm", icon: Droplets,    color: "#60A5FA" },
  { label: "pH",        value: "6.2",      icon: FlaskConical, color: "var(--emerald-400)" },
  { label: "Nhiệt độ", value: "24.3 °C",  icon: Thermometer,  color: "#FBBF24" },
  { label: "Độ ẩm",    value: "68%",      icon: Wind,         color: "#60A5FA" },
  { label: "Ánh sáng", value: "ON",       icon: Sun,          color: "#FBBF24" },
];

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */
function formatContent(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br/>");
}

function buildSensorContextString() {
  return SENSOR_CONTEXT.map((s) => `${s.label}: ${s.value}`).join(", ");
}

/* ─────────────────────────────────────────
   Sub-components
───────────────────────────────────────── */
function GuideCard({ article, open, onToggle }: {
  article: GuideArticle;
  open: boolean;
  onToggle: () => void;
}) {
  const cat = GUIDE_CATEGORIES.find((c) => c.label === article.category)!;
  const Icon = cat.icon;
  return (
    <div
      className="overflow-hidden rounded-2xl transition-all duration-200"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: `1px solid ${open ? "rgba(74,222,128,0.20)" : "var(--border-subtle)"}`,
      }}
    >
      <button
        className="flex w-full items-center gap-4 p-4 text-left"
        onClick={onToggle}
      >
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ background: cat.bg, border: `1px solid ${cat.color}22` }}
        >
          <Icon size={16} style={{ color: cat.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="rounded-full px-2 py-0.5 font-mono text-[9px] font-semibold"
              style={{ background: cat.bg, color: cat.color }}
            >
              {article.category}
            </span>
            <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              {article.readTime} đọc
            </span>
          </div>
          <p className="mt-1 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            {article.title}
          </p>
          {!open && (
            <p className="mt-0.5 truncate text-xs" style={{ color: "var(--text-muted)" }}>
              {article.summary}
            </p>
          )}
        </div>
        <ChevronDown
          size={14}
          style={{
            color: "var(--text-muted)",
            flexShrink: 0,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        />
      </button>

      {open && (
        <div
          className="px-4 pb-4"
          style={{ borderTop: "1px solid var(--border-subtle)" }}
        >
          <p className="py-3 text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {article.summary}
          </p>
          <div className="space-y-2">
            {article.tips.map((tip, i) => (
              <div key={i} className="flex gap-2.5 rounded-xl p-3"
                style={{ background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.10)" }}>
                <Leaf size={11} className="mt-0.5 shrink-0" style={{ color: "var(--emerald-400)" }} />
                <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {tip}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   Main page
───────────────────────────────────────── */
export default function PlantDoctorPage() {
  const [tab, setTab] = useState<"guide" | "ai">("guide");

  /* Guide state */
  const [catFilter, setCatFilter]   = useState("Tất cả");
  const [openGuide, setOpenGuide]   = useState<string | null>(null);

  /* AI Chat state */
  const [apiKey, setApiKey]         = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("gemini_api_key") ?? "" : ""
  );
  const [showKey, setShowKey]       = useState(false);
  const [keyPanelOpen, setKeyPanelOpen] = useState(false);
  const [messages, setMessages]     = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [apiError, setApiError]     = useState("");
  const bottomRef                   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function saveApiKey(key: string) {
    setApiKey(key);
    if (typeof window !== "undefined") {
      if (key) localStorage.setItem("gemini_api_key", key);
      else localStorage.removeItem("gemini_api_key");
    }
  }

  async function handleSend(text = input) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    if (!apiKey.trim()) {
      setKeyPanelOpen(true);
      setApiError("Vui lòng nhập Gemini API key trước khi chat.");
      return;
    }

    const now = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    const userMsg: Message = { role: "user", content: trimmed, timestamp: now };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setApiError("");

    /* Build history for Gemini */
    const history = [...messages, userMsg]
      .filter((m) => m.role !== "assistant" || m !== INITIAL_MESSAGES[0])
      .map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }));

    const systemPrompt =
      `Bạn là Plant Doctor AI — chuyên gia thủy canh. Trả lời bằng tiếng Việt, ngắn gọn, thực tiễn.\n` +
      `Dữ liệu sensor hiện tại: ${buildSensorContextString()}.\n` +
      `Dựa vào dữ liệu sensor để tư vấn chính xác khi người dùng hỏi về cây trồng.`;

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: history,
            generationConfig: { temperature: 0.7, maxOutputTokens: 800 },
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = (err as { error?: { message?: string } }).error?.message ?? `HTTP ${res.status}`;
        throw new Error(msg);
      }

      const data = await res.json() as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "Không có phản hồi từ AI.";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: reply,
          timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Lỗi không xác định";
      setApiError(`Lỗi API: ${message}`);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ **Không thể kết nối Gemini API.**\n${message}\n\nKiểm tra lại API key hoặc thử lại sau.`,
          timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const filteredGuides =
    catFilter === "Tất cả"
      ? GUIDE_ARTICLES
      : GUIDE_ARTICLES.filter((a) => a.category === catFilter);

  return (
    <div className="animate-fade-up space-y-0">

      {/* ── Tab bar ── */}
      <div
        className="mb-5 flex items-center gap-2"
        style={{ borderBottom: "1px solid var(--border-subtle)", paddingBottom: "1rem" }}
      >
        {(["guide", "ai"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold transition-all"
            style={
              tab === t
                ? {
                    background: "rgba(34,197,94,0.10)",
                    color: "var(--emerald-400)",
                    border: "1px solid rgba(74,222,128,0.22)",
                  }
                : {
                    background: "transparent",
                    color: "var(--text-secondary)",
                    border: "1px solid transparent",
                  }
            }
          >
            {t === "guide" ? <BookOpen size={14} /> : <Sparkles size={14} />}
            {t === "guide" ? "Hướng dẫn" : "Doctor AI"}
          </button>
        ))}

        {tab === "ai" && (
          <div className="ml-auto flex items-center gap-2">
            {/* API key status */}
            <div
              className="flex items-center gap-1.5 rounded-full px-3 py-1"
              style={
                apiKey
                  ? { background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.20)" }
                  : { background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.20)" }
              }
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: apiKey ? "var(--emerald-500)" : "#FBBF24" }}
              />
              <span
                className="font-mono text-[10px] font-semibold"
                style={{ color: apiKey ? "var(--emerald-400)" : "#FBBF24" }}
              >
                {apiKey ? "Gemini 1.5 Flash" : "Chưa có API key"}
              </span>
            </div>

            <button
              onClick={() => setKeyPanelOpen((p) => !p)}
              className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-secondary)",
              }}
            >
              <Key size={12} />
              {apiKey ? "Đổi key" : "Nhập API key"}
            </button>
          </div>
        )}
      </div>

      {/* ════════════════════════════════
          GUIDE TAB
      ════════════════════════════════ */}
      {tab === "guide" && (
        <div className="space-y-4">
          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            {["Tất cả", ...GUIDE_CATEGORIES.map((c) => c.label)].map((c) => {
              const cat = GUIDE_CATEGORIES.find((gc) => gc.label === c);
              const active = catFilter === c;
              return (
                <button
                  key={c}
                  onClick={() => setCatFilter(c)}
                  className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all"
                  style={
                    active
                      ? {
                          background: cat ? cat.bg : "rgba(34,197,94,0.10)",
                          color: cat ? cat.color : "var(--emerald-400)",
                          border: `1px solid ${cat ? cat.color + "33" : "rgba(34,197,94,0.25)"}`,
                        }
                      : {
                          background: "rgba(255,255,255,0.03)",
                          color: "var(--text-muted)",
                          border: "1px solid var(--border-subtle)",
                        }
                  }
                >
                  {cat && <cat.icon size={10} />}
                  {c}
                </button>
              );
            })}
          </div>

          {/* Articles */}
          <div className="space-y-3">
            {filteredGuides.map((article) => (
              <GuideCard
                key={article.title}
                article={article}
                open={openGuide === article.title}
                onToggle={() =>
                  setOpenGuide((p) => (p === article.title ? null : article.title))
                }
              />
            ))}
          </div>

          {/* Sensor quick ref */}
          <div
            className="rounded-2xl p-4"
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
          >
            <p
              className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              Giá trị sensor lý tưởng
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { label: "pH",         range: "5.8 – 6.5",   color: "var(--emerald-400)" },
                { label: "TDS",        range: "800 – 1400 ppm", color: "#60A5FA" },
                { label: "Nhiệt độ",  range: "18 – 26 °C",  color: "#FBBF24" },
                { label: "Độ ẩm KK",  range: "60 – 80%",    color: "#60A5FA" },
              ].map(({ label, range, color }) => (
                <div
                  key={label}
                  className="rounded-xl p-3 text-center"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-subtle)" }}
                >
                  <p className="font-mono text-xs font-black" style={{ color }}>{range}</p>
                  <p className="mt-0.5 text-[10px]" style={{ color: "var(--text-muted)" }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════
          DOCTOR AI TAB
      ════════════════════════════════ */}
      {tab === "ai" && (
        <div className="space-y-4">

          {/* API key panel */}
          {keyPanelOpen && (
            <div
              className="rounded-2xl p-4 space-y-3"
              style={{ background: "var(--bg-elevated)", border: "1px solid rgba(251,191,36,0.22)" }}
            >
              <div className="flex items-center gap-2">
                <Key size={13} style={{ color: "#FBBF24" }} />
                <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  Google Gemini API Key
                </span>
              </div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Lấy API key miễn phí tại{" "}
                <span className="font-mono" style={{ color: "#60A5FA" }}>
                  aistudio.google.com
                </span>
                . Key được lưu trong trình duyệt, không gửi lên server.
              </p>
              <div className="flex gap-2">
                <div
                  className="relative flex flex-1 items-center rounded-xl"
                  style={{ background: "var(--bg-overlay)", border: "1px solid var(--border-normal)" }}
                >
                  <input
                    type={showKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => saveApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="flex-1 bg-transparent px-4 py-2.5 font-mono text-xs focus:outline-none"
                    style={{ color: "var(--text-primary)" }}
                  />
                  <button
                    onClick={() => setShowKey((p) => !p)}
                    className="pr-3"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <button
                  onClick={() => { setKeyPanelOpen(false); setApiError(""); }}
                  className="btn-emerald px-4 py-2 text-xs"
                >
                  Lưu
                </button>
              </div>

              {apiError && (
                <div
                  className="flex items-start gap-2 rounded-xl p-3"
                  style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.22)" }}
                >
                  <AlertCircle size={13} className="mt-0.5 shrink-0" style={{ color: "#F87171" }} />
                  <p className="text-xs" style={{ color: "#F87171" }}>{apiError}</p>
                </div>
              )}
            </div>
          )}

          {/* Chat area */}
          <div
            className="flex flex-col overflow-hidden rounded-2xl"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
              height: "calc(100dvh - 380px)",
              minHeight: 420,
            }}
          >
            {/* Sensor context bar */}
            <div
              className="flex items-center gap-3 overflow-x-auto px-4 py-2.5"
              style={{ borderBottom: "1px solid var(--border-subtle)", scrollbarWidth: "none" }}
            >
              <span className="shrink-0 font-mono text-[9px] font-semibold uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}>
                Context
              </span>
              {SENSOR_CONTEXT.map(({ label, value, icon: Icon, color }) => (
                <div
                  key={label}
                  className="flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-subtle)" }}
                >
                  <Icon size={10} style={{ color }} />
                  <span className="font-mono text-[10px]" style={{ color: "var(--text-secondary)" }}>
                    {label}:{" "}
                    <span style={{ color, fontWeight: 700 }}>{value}</span>
                  </span>
                </div>
              ))}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                    style={{
                      background:
                        msg.role === "assistant"
                          ? "rgba(34,197,94,0.12)"
                          : "rgba(96,165,250,0.12)",
                    }}
                  >
                    {msg.role === "assistant"
                      ? <Bot size={13} style={{ color: "var(--emerald-400)" }} />
                      : <User size={13} style={{ color: "#60A5FA" }} />
                    }
                  </div>

                  <div
                    className="max-w-[78%] overflow-hidden rounded-2xl px-4 py-3 text-xs leading-relaxed"
                    style={
                      msg.role === "assistant"
                        ? {
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid var(--border-subtle)",
                            color: "var(--text-secondary)",
                            borderTopLeftRadius: 6,
                          }
                        : {
                            background: "rgba(96,165,250,0.10)",
                            border: "1px solid rgba(96,165,250,0.20)",
                            color: "var(--text-primary)",
                            borderTopRightRadius: 6,
                          }
                    }
                  >
                    <div dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }} />
                    <p className="mt-2 text-[9px]" style={{ color: "var(--text-muted)" }}>
                      {msg.timestamp}
                    </p>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div className="flex gap-3">
                  <div
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                    style={{ background: "rgba(34,197,94,0.12)" }}
                  >
                    <Bot size={13} style={{ color: "var(--emerald-400)" }} />
                  </div>
                  <div
                    className="flex items-center gap-1.5 rounded-2xl px-4 py-3"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid var(--border-subtle)",
                      borderTopLeftRadius: 6,
                    }}
                  >
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="h-1.5 w-1.5 animate-bounce rounded-full"
                        style={{ background: "var(--emerald-400)", animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Suggestions (first load) */}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 px-4 pb-3">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    className="rounded-full px-3 py-1.5 text-xs transition-all"
                    style={{
                      background: "rgba(34,197,94,0.06)",
                      border: "1px solid rgba(74,222,128,0.18)",
                      color: "var(--emerald-400)",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input row */}
            <div
              className="flex items-center gap-2 px-4 py-3"
              style={{ borderTop: "1px solid var(--border-subtle)" }}
            >
              <div
                className="flex flex-1 items-center gap-2 rounded-xl px-4 py-2.5"
                style={{ background: "var(--bg-overlay)", border: "1px solid var(--border-subtle)" }}
              >
                <Leaf size={13} style={{ color: "var(--emerald-500)", flexShrink: 0 }} />
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder={apiKey ? "Hỏi về cây trồng của bạn..." : "Nhập API key trước để chat..."}
                  className="flex-1 bg-transparent text-xs focus:outline-none"
                  style={{ color: "var(--text-primary)" }}
                />
              </div>

              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className="btn-emerald shrink-0 gap-2 px-4 py-2.5 text-xs"
              >
                <Send size={13} />
                Gửi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
