"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send, Bot, User, BookOpen, ChevronDown,
  Leaf, Key, Eye, EyeOff, Sparkles, AlertCircle,
  Droplets, FlaskConical, Thermometer, Sun, Wind,
  Sprout, Bug, Beaker, Lightbulb,
} from "lucide-react";

/* ─── Types ─── */
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

/* ─── Guide data ─── */
const GUIDE_CATEGORIES: GuideCategory[] = [
  { icon: Sprout,    label: "Cơ bản",     color: "var(--emerald-400)", bg: "rgba(34,197,94,0.10)"   },
  { icon: Beaker,    label: "Dinh dưỡng", color: "#60A5FA",            bg: "rgba(96,165,250,0.10)"  },
  { icon: Bug,       label: "Bệnh cây",   color: "#F87171",            bg: "rgba(248,113,113,0.10)" },
  { icon: Lightbulb, label: "Ánh sáng",   color: "#FBBF24",            bg: "rgba(251,191,36,0.10)"  },
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
    summary: "Vàng lá, đốm nâu, lá cong — mỗi triệu chứng chỉ ra một vấn đề khác nhau.",
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
      "Tắt đèn hoàn toàn 6–8 tiếng để cây có chu kỳ tối.",
    ],
  },
];

const OPENROUTER_MODELS = [
  { id: "openrouter/free",                            label: "Auto — Free (recommended)" },
  { id: "meta-llama/llama-3.3-70b-instruct:free",    label: "Llama 3.3 70B"            },
  { id: "mistralai/mistral-7b-instruct:free",         label: "Mistral 7B"               },
  { id: "deepseek/deepseek-r1:free",                  label: "DeepSeek R1"              },
  { id: "deepseek/deepseek-chat-v3-0324:free",        label: "DeepSeek V3"              },
];

const GROQ_MODELS = [
  { id: "llama-3.3-70b-versatile",  label: "Llama 3.3 70B (fastest ⚡)" },
  { id: "llama-3.1-8b-instant",     label: "Llama 3.1 8B (instant ⚡)"  },
  { id: "gemma2-9b-it",             label: "Gemma 2 9B"                 },
  { id: "mixtral-8x7b-32768",       label: "Mixtral 8x7B"              },
];

const INITIAL_MESSAGES: Message[] = [
  {
    role: "assistant",
    content: "Xin chào! Tôi là **Plant Doctor AI**.\n\nNhập API key để bắt đầu. Gợi ý:\n- **Groq** (groq.com/keys) — nhanh nhất ⚡, miễn phí\n- **OpenRouter** (openrouter.ai/keys) — nhiều model\n- **Ollama** — chạy local, không cần key\n\nTôi sẽ tư vấn về:\n- Chẩn đoán bệnh lá & thiếu dinh dưỡng\n- Điều chỉnh pH, TDS tối ưu\n- Lịch chăm sóc cây thủy canh",
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
  { label: "TDS",      value: "1150 ppm", icon: Droplets,     color: "#60A5FA"            },
  { label: "pH",       value: "6.2",      icon: FlaskConical,  color: "var(--emerald-400)" },
  { label: "Nhiệt độ", value: "24.3°C",   icon: Thermometer,  color: "#FBBF24"            },
  { label: "Độ ẩm",   value: "68%",      icon: Wind,          color: "#60A5FA"            },
  { label: "Ánh sáng", value: "ON",       icon: Sun,           color: "#FBBF24"            },
];

function formatContent(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br/>");
}

function buildSensorContextString() {
  return SENSOR_CONTEXT.map((s) => `${s.label}: ${s.value}`).join(", ");
}

/* ─── Guide Card ─── */
function GuideCard({ article, open, onToggle }: {
  article: GuideArticle;
  open: boolean;
  onToggle: () => void;
}) {
  const cat  = GUIDE_CATEGORIES.find((c) => c.label === article.category)!;
  const Icon = cat.icon;
  return (
    <div
      className="overflow-hidden rounded-xl transition-all duration-200"
      style={{
        border: `1px solid ${open ? cat.color + "33" : "var(--border-subtle)"}`,
        background: open ? cat.bg : "transparent",
      }}
    >
      <button className="flex w-full items-center gap-3 p-3.5 text-left" onClick={onToggle}>
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{ background: cat.bg }}
        >
          <Icon size={13} style={{ color: cat.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="rounded-full px-1.5 py-0.5 font-mono text-[9px] font-semibold" style={{ background: cat.bg, color: cat.color }}>
              {article.category}
            </span>
            <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>{article.readTime} đọc</span>
          </div>
          <p className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>
            {article.title}
          </p>
        </div>
        <ChevronDown
          size={13}
          style={{
            color: "var(--text-muted)",
            flexShrink: 0,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        />
      </button>

      {open && (
        <div className="px-3.5 pb-3.5" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <p className="py-2.5 text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {article.summary}
          </p>
          <div className="space-y-1.5">
            {article.tips.map((tip, i) => (
              <div key={i} className="flex gap-2 rounded-lg p-2.5"
                style={{ background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.10)" }}>
                <Leaf size={10} className="mt-0.5 shrink-0" style={{ color: "var(--emerald-400)" }} />
                <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ─── */
export default function PlantDoctorPage() {
  const [catFilter, setCatFilter] = useState("Tất cả");
  const [openGuide, setOpenGuide] = useState<string | null>(null);

  const [endpoint, setEndpoint] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("ai_endpoint") ?? "https://api.groq.com/openai/v1" : "https://api.groq.com/openai/v1"
  );
  const [apiKey, setApiKey] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("openrouter_api_key") ?? "";
  });
  const [model, setModel] = useState(() => {
    if (typeof window === "undefined") return GROQ_MODELS[0].id;
    const saved = localStorage.getItem("openrouter_model") ?? "";
    const allModels = [...GROQ_MODELS, ...OPENROUTER_MODELS];
    return allModels.some((m) => m.id === saved) ? saved : GROQ_MODELS[0].id;
  });
  const [customModel, setCustomModel] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("local_model") ?? "qwen2.5:3b" : "qwen2.5:3b"
  );
  const [showKey, setShowKey]           = useState(false);
  const [keyPanelOpen, setKeyPanelOpen] = useState(false);

  const isLocal = endpoint.includes("localhost") || endpoint.includes("127.0.0.1");
  const isGroq  = endpoint.includes("groq.com");
  const activeModelList = isGroq ? GROQ_MODELS : OPENROUTER_MODELS;
  const activeModel = isLocal ? customModel : model;
  const [messages, setMessages]       = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput]             = useState("");
  const [loading, setLoading]         = useState(false);
  const [apiError, setApiError]       = useState("");
  const bottomRef                     = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function saveEndpoint(url: string) {
    setEndpoint(url);
    if (typeof window !== "undefined") localStorage.setItem("ai_endpoint", url);
    // auto-pick first model for the new provider
    const newIsGroq = url.includes("groq.com");
    const list = newIsGroq ? GROQ_MODELS : OPENROUTER_MODELS;
    const currentValid = list.some((m) => m.id === model);
    if (!currentValid) saveModel(list[0].id);
  }

  function saveApiKey(key: string) {
    setApiKey(key);
    if (typeof window !== "undefined") {
      if (key) localStorage.setItem("openrouter_api_key", key);
      else localStorage.removeItem("openrouter_api_key");
    }
  }

  function saveModel(m: string) {
    setModel(m);
    if (typeof window !== "undefined") localStorage.setItem("openrouter_model", m);
  }

  function saveCustomModel(m: string) {
    setCustomModel(m);
    if (typeof window !== "undefined") localStorage.setItem("local_model", m);
  }

  async function handleSend(text = input) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    // Groq key ở server — không cần check. OpenRouter cần user nhập key.
    if (!isLocal && !isGroq && !apiKey.trim()) { setKeyPanelOpen(true); setApiError("Vui lòng nhập OpenRouter API key trước."); return; }

    const now = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    const userMsg: Message = { role: "user", content: trimmed, timestamp: now };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setApiError("");

    const systemPrompt =
      `Bạn là Plant Doctor AI — chuyên gia thủy canh. Trả lời bằng tiếng Việt, ngắn gọn, thực tiễn.\n` +
      `Dữ liệu sensor hiện tại: ${buildSensorContextString()}.`;

    const history = [...messages, userMsg]
      .filter((m) => m !== INITIAL_MESSAGES[0])
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

    try {
      let res: Response;

      if (isLocal) {
        // Ollama: gọi trực tiếp từ browser (localhost, không có CORS issue)
        res = await fetch(`${endpoint.replace(/\/$/, "")}/chat/completions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: activeModel,
            messages: [{ role: "system", content: systemPrompt }, ...history],
            temperature: 0.7,
            max_tokens: 800,
          }),
        });
      } else {
        // Groq / OpenRouter: proxy qua Next.js API để tránh CORS và bảo vệ key
        const provider = isGroq ? "groq" : "openrouter";
        res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: activeModel,
            provider,
            messages: [{ role: "system", content: systemPrompt }, ...history],
            ...(provider === "openrouter" && apiKey ? { apiKey } : {}),
          }),
        });
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string | { message?: string } }).error instanceof Object
          ? ((err as { error: { message?: string } }).error.message ?? `HTTP ${res.status}`)
          : ((err as { error?: string }).error ?? `HTTP ${res.status}`));
      }

      const data = await res.json() as { choices?: { message?: { content?: string } }[] };
      const reply = data?.choices?.[0]?.message?.content ?? "Không có phản hồi từ AI.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply, timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) }]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Lỗi không xác định";
      setApiError(`Lỗi API: ${message}`);
      setMessages((prev) => [...prev, { role: "assistant", content: `⚠️ **Không thể kết nối AI.**\n${message}`, timestamp: now }]);
    } finally {
      setLoading(false);
    }
  }

  const filteredGuides = catFilter === "Tất cả"
    ? GUIDE_ARTICLES
    : GUIDE_ARTICLES.filter((a) => a.category === catFilter);

  return (
    <div className="animate-fade-up flex gap-5" style={{ height: "calc(100dvh - 240px)", minHeight: 560 }}>

      {/* ── LEFT: Knowledge Base ── */}
      <div
        className="flex w-72 shrink-0 flex-col overflow-hidden rounded-2xl"
        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3.5" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <BookOpen size={13} style={{ color: "var(--emerald-400)" }} />
          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Hướng dẫn</span>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-1.5 px-3 py-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          {["Tất cả", ...GUIDE_CATEGORIES.map((c) => c.label)].map((c) => {
            const cat    = GUIDE_CATEGORIES.find((gc) => gc.label === c);
            const active = catFilter === c;
            return (
              <button
                key={c}
                onClick={() => setCatFilter(c)}
                className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all"
                style={
                  active
                    ? { background: cat ? cat.bg : "rgba(34,197,94,0.10)", color: cat ? cat.color : "var(--emerald-400)", border: `1px solid ${cat ? cat.color + "33" : "rgba(34,197,94,0.25)"}` }
                    : { background: "transparent", color: "var(--text-muted)", border: "1px solid var(--border-subtle)" }
                }
              >
                {cat && <cat.icon size={9} />}
                {c}
              </button>
            );
          })}
        </div>

        {/* Articles */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
          {filteredGuides.map((article) => (
            <GuideCard
              key={article.title}
              article={article}
              open={openGuide === article.title}
              onToggle={() => setOpenGuide((p) => (p === article.title ? null : article.title))}
            />
          ))}
        </div>

        {/* Ideal values footer */}
        <div className="px-3 py-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <p className="mb-2 font-mono text-[9px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Giá trị lý tưởng
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { label: "pH",        range: "5.8–6.5",      color: "var(--emerald-400)" },
              { label: "TDS",       range: "800–1400 ppm",  color: "#60A5FA" },
              { label: "Nhiệt độ", range: "18–26°C",       color: "#FBBF24" },
              { label: "Độ ẩm KK", range: "60–80%",        color: "#60A5FA" },
            ].map(({ label, range, color }) => (
              <div key={label} className="rounded-lg p-2" style={{ background: "var(--bg-base)", border: "1px solid var(--border-subtle)" }}>
                <p className="font-mono text-[10px] font-bold" style={{ color }}>{range}</p>
                <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT: AI Chat ── */}
      <div
        className="flex flex-1 min-w-0 flex-col overflow-hidden rounded-2xl"
        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
      >
        {/* Chat header */}
        <div className="flex items-center justify-between gap-3 px-4 py-3.5" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full" style={{ background: "rgba(34,197,94,0.12)" }}>
              <Sparkles size={13} style={{ color: "var(--emerald-400)" }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Plant Doctor AI</p>
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                {activeModel} · {isLocal ? "Local (Ollama)" : isGroq ? "Groq ⚡" : "OpenRouter"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* API key status */}
            <div
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
              style={
                apiKey
                  ? { background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.20)" }
                  : { background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.20)" }
              }
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: (isLocal || isGroq || apiKey) ? "var(--emerald-500)" : "#FBBF24" }} />
              <span className="font-mono text-[10px] font-semibold" style={{ color: (isLocal || isGroq || apiKey) ? "var(--emerald-400)" : "#FBBF24" }}>
                {isLocal ? "Local" : isGroq ? "Groq ⚡" : apiKey ? "API Connected" : "No API Key"}
              </span>
            </div>
            <button
              onClick={() => setKeyPanelOpen((p) => !p)}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all"
              style={{ background: "var(--bg-base)", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)" }}
            >
              <Key size={11} />
              {apiKey ? "Đổi key" : "Nhập key"}
            </button>
          </div>
        </div>

        {/* API key panel (collapsible) */}
        {keyPanelOpen && (
          <div className="px-4 py-3 space-y-2.5" style={{ borderBottom: "1px solid var(--border-subtle)", background: "rgba(251,191,36,0.04)" }}>

            {/* Endpoint URL */}
            <div className="flex items-center gap-2">
              <span className="text-xs shrink-0 w-16" style={{ color: "var(--text-muted)" }}>Endpoint:</span>
              <input
                value={endpoint}
                onChange={(e) => saveEndpoint(e.target.value)}
                placeholder="https://openrouter.ai/api/v1"
                className="flex-1 rounded-lg bg-transparent px-2.5 py-1.5 font-mono text-xs focus:outline-none"
                style={{ background: "var(--bg-base)", border: "1px solid var(--border-normal)", color: "var(--text-secondary)" }}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {[
                { url: "https://api.groq.com/openai/v1",   label: "Groq ⚡ (fastest)" },
                { url: "https://openrouter.ai/api/v1",      label: "OpenRouter"        },
                { url: "http://localhost:11434/v1",          label: "Local (Ollama)"    },
              ].map(({ url, label }) => (
                <button
                  key={url}
                  onClick={() => saveEndpoint(url)}
                  className="rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold transition-all"
                  style={
                    endpoint === url
                      ? { background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.30)", color: "var(--emerald-400)" }
                      : { background: "var(--bg-base)", border: "1px solid var(--border-subtle)", color: "var(--text-muted)" }
                  }
                >
                  {label}
                </button>
              ))}
            </div>

            {/* API key — hiện khi dùng cloud (Groq hoặc OpenRouter) */}
            {!isLocal && (
              <>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {isGroq
                    ? <>Lấy API key tại <span className="font-mono" style={{ color: "#60A5FA" }}>console.groq.com/keys</span> — miễn phí ⚡</>
                    : <>Lấy API key tại <span className="font-mono" style={{ color: "#60A5FA" }}>openrouter.ai/keys</span> — free tier có sẵn</>
                  }
                  {" "}Key lưu trong trình duyệt.
                </p>
                <div className="flex gap-2">
                  <div className="relative flex flex-1 items-center rounded-xl" style={{ background: "var(--bg-base)", border: "1px solid var(--border-normal)" }}>
                    <input
                      type={showKey ? "text" : "password"}
                      value={apiKey}
                      onChange={(e) => saveApiKey(e.target.value)}
                      placeholder={isGroq ? "gsk_..." : "sk-or-v1-..."}
                      className="flex-1 bg-transparent px-3 py-2 font-mono text-xs focus:outline-none"
                      style={{ color: "var(--text-primary)" }}
                    />
                    <button onClick={() => setShowKey((p) => !p)} className="pr-3" style={{ color: "var(--text-muted)" }}>
                      {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs shrink-0 w-16" style={{ color: "var(--text-muted)" }}>Model:</span>
                  <select
                    value={model}
                    onChange={(e) => saveModel(e.target.value)}
                    className="flex-1 rounded-lg px-2.5 py-1.5 font-mono text-xs focus:outline-none"
                    style={{ background: "var(--bg-base)", border: "1px solid var(--border-normal)", color: "var(--text-secondary)" }}
                  >
                    {activeModelList.map((m) => (
                      <option key={m.id} value={m.id}>{m.label}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Local model name */}
            {isLocal && (
              <div className="flex items-center gap-2">
                <span className="text-xs shrink-0 w-16" style={{ color: "var(--text-muted)" }}>Model:</span>
                <input
                  value={customModel}
                  onChange={(e) => saveCustomModel(e.target.value)}
                  placeholder="qwen2.5:3b"
                  className="flex-1 rounded-lg bg-transparent px-2.5 py-1.5 font-mono text-xs focus:outline-none"
                  style={{ background: "var(--bg-base)", border: "1px solid var(--border-normal)", color: "var(--text-secondary)" }}
                />
              </div>
            )}

            <button onClick={() => { setKeyPanelOpen(false); setApiError(""); }} className="btn-emerald w-full py-1.5 text-xs">
              Lưu
            </button>

            {apiError && (
              <div className="flex items-start gap-2 rounded-lg p-2.5" style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.22)" }}>
                <AlertCircle size={12} className="mt-0.5 shrink-0" style={{ color: "#F87171" }} />
                <p className="text-xs" style={{ color: "#F87171" }}>{apiError}</p>
              </div>
            )}
          </div>
        )}

        {/* Sensor context bar */}
        <div className="flex items-center gap-2 overflow-x-auto px-4 py-2" style={{ borderBottom: "1px solid var(--border-subtle)", scrollbarWidth: "none", background: "var(--bg-base)" }}>
          <span className="shrink-0 font-mono text-[9px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Context</span>
          {SENSOR_CONTEXT.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
              <Icon size={9} style={{ color }} />
              <span className="font-mono text-[10px]" style={{ color: "var(--text-secondary)" }}>
                {label}: <span style={{ color, fontWeight: 700 }}>{value}</span>
              </span>
            </div>
          ))}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                style={{ background: msg.role === "assistant" ? "rgba(34,197,94,0.12)" : "rgba(96,165,250,0.12)" }}
              >
                {msg.role === "assistant"
                  ? <Bot size={12} style={{ color: "var(--emerald-400)" }} />
                  : <User size={12} style={{ color: "#60A5FA" }} />
                }
              </div>
              <div
                className="max-w-[80%] overflow-hidden rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed"
                style={
                  msg.role === "assistant"
                    ? { background: "var(--bg-base)", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)", borderTopLeftRadius: 6 }
                    : { background: "rgba(96,165,250,0.10)", border: "1px solid rgba(96,165,250,0.20)", color: "var(--text-primary)", borderTopRightRadius: 6 }
                }
              >
                <div dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }} />
                <p className="mt-1.5 text-[9px]" style={{ color: "var(--text-muted)" }}>{msg.timestamp}</p>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex gap-2.5">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full" style={{ background: "rgba(34,197,94,0.12)" }}>
                <Bot size={12} style={{ color: "var(--emerald-400)" }} />
              </div>
              <div className="flex items-center gap-1.5 rounded-2xl px-3.5 py-2.5" style={{ background: "var(--bg-base)", border: "1px solid var(--border-subtle)", borderTopLeftRadius: 6 }}>
                {[0,1,2].map((i) => (
                  <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full" style={{ background: "var(--emerald-400)", animationDelay: `${i*150}ms` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-1.5 px-4 pb-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleSend(s)}
                className="rounded-full px-3 py-1.5 text-[11px] font-medium transition-all"
                style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(74,222,128,0.18)", color: "var(--emerald-400)" }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input row */}
        <div className="flex items-center gap-2 px-4 py-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <div className="flex flex-1 items-center gap-2 rounded-xl px-3 py-2.5" style={{ background: "var(--bg-base)", border: "1px solid var(--border-normal)" }}>
            <Leaf size={12} style={{ color: "var(--emerald-500)", flexShrink: 0 }} />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder={isLocal || apiKey ? "Hỏi về cây trồng của bạn..." : `Nhập ${isGroq ? "Groq" : "OpenRouter"} API key để bắt đầu...`}
              className="flex-1 bg-transparent text-xs focus:outline-none"
              style={{ color: "var(--text-primary)" }}
            />
          </div>
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="btn-emerald shrink-0 gap-2 px-4 py-2.5 text-xs"
          >
            <Send size={12} />
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
}
