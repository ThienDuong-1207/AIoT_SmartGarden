import { NextRequest, NextResponse } from "next/server";
import { fuseDiagnosis } from "@/lib/fuseDiagnosis";

const AI_SERVICE = process.env.PLANT_AI_SERVICE_URL ?? "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    // Sensor context tuỳ chọn (gửi kèm từ frontend)
    const sensorRaw = formData.get("sensorContext");
    let sensorContext = {};
    if (sensorRaw) {
      try { sensorContext = JSON.parse(sensorRaw as string); } catch { /* bỏ qua nếu JSON lỗi */ }
    }

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "Không có file ảnh" }, { status: 400 });
    }

    const proxyForm = new FormData();
    proxyForm.append("file", file);

    const aiRes = await fetch(`${AI_SERVICE}/predict`, {
      method: "POST",
      body: proxyForm,
    });

    if (!aiRes.ok) {
      const text = await aiRes.text();
      return NextResponse.json({ error: `AI service lỗi: ${text}` }, { status: 502 });
    }

    const result = await aiRes.json();

    // Bổ sung fusedDiagnosis kết hợp sensor
    result.fusedDiagnosis = fuseDiagnosis(
      result.topDisease,
      result.status,
      sensorContext
    );

    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("ECONNREFUSED") || msg.includes("fetch failed")) {
      return NextResponse.json(
        { error: "AI service chưa khởi động. Vui lòng chạy docker compose up -d" },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
