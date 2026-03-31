import { NextResponse } from "next/server";

const PROVIDER_URLS: Record<string, string> = {
  groq:       "https://api.groq.com/openai/v1/chat/completions",
  openrouter: "https://openrouter.ai/api/v1/chat/completions",
};

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.messages) {
    return NextResponse.json({ error: "messages required" }, { status: 400 });
  }

  const { messages, model, provider = "groq" } = body as {
    messages: { role: string; content: string }[];
    model?: string;
    provider?: string;
  };

  const url = PROVIDER_URLS[provider] ?? PROVIDER_URLS.groq;

  // Pick API key: prefer env, then body (for user-supplied OpenRouter key)
  let apiKey: string;
  if (provider === "openrouter") {
    apiKey = (body.apiKey as string) || process.env.OPENROUTER_API_KEY || "";
  } else {
    apiKey = process.env.GROQ_API_KEY || "";
  }

  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
  if (provider === "openrouter") {
    headers["HTTP-Referer"] = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    headers["X-Title"] = "Smart Garden Plant Doctor";
  }

  const activeModel =
    model ||
    (provider === "groq" ? "llama-3.3-70b-versatile" : "openrouter/free");

  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: activeModel,
        messages,
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      const msg = (data as { error?: { message?: string } }).error?.message ?? `HTTP ${res.status}`;
      return NextResponse.json({ error: msg }, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
