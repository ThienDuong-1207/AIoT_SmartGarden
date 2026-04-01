import { NextResponse } from "next/server";

type OllamaRequest = {
  prompt: string;
  model?: string;
};

const FALLBACK_TEXT = [
  "Stabilize pH in the 5.8-6.2 range and re-check nutrient concentration before changing treatment.",
  "Run one follow-up image scan after environmental adjustments to verify whether lesion spread is slowing.",
  "Prioritize intervention on the strongest risk factor first to minimize stress and cost.",
].join("\n");

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as OllamaRequest | null;
  if (!body?.prompt) {
    return NextResponse.json({ error: "prompt required" }, { status: 400 });
  }

  const baseUrl = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
  const model = body.model ?? process.env.OLLAMA_MODEL ?? "llama3.2";

  try {
    const res = await fetch(`${baseUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt: body.prompt,
        stream: false,
      }),
    });

    const data = await res.json().catch(() => null) as { response?: string; error?: string } | null;
    if (!res.ok) {
      return NextResponse.json({
        text: FALLBACK_TEXT,
        model,
        fallback: true,
        error: data?.error ?? `Ollama HTTP ${res.status}`,
      });
    }

    return NextResponse.json({
      text: data?.response ?? "",
      model,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({
      text: FALLBACK_TEXT,
      model,
      fallback: true,
      error: `Cannot connect to Ollama: ${message}`,
    });
  }
}
