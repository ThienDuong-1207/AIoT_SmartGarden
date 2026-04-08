import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { dbConnect } from "@/lib/mongodb";
import AIdiagnosticModel from "@/models/AIdiagnostic";
import CameraCaptureModel from "@/models/CameraCapture";
import SensorReadingModel from "@/models/SensorReading";
import { authorizeDevice } from "@/lib/deviceAuth";
import { fuseDiagnosis } from "@/lib/fuseDiagnosis";
import { createAlert } from "@/lib/alerts";

type Params = { params: Promise<{ deviceId: string }> };

type SensorContext = {
  tds: number | null;
  ph: number | null;
  temperature: number | null;
  humidity: number | null;
};

function normalizeSensorContext(input: unknown): SensorContext {
  const src = (input && typeof input === "object") ? (input as Record<string, unknown>) : {};
  const toNum = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
  return {
    tds: toNum(src.tds),
    ph: toNum(src.ph),
    temperature: toNum(src.temperature),
    humidity: toNum(src.humidity),
  };
}

function hasAnySensorValue(ctx: SensorContext): boolean {
  return [ctx.tds, ctx.ph, ctx.temperature, ctx.humidity].some((v) => v !== null);
}

function buildOllamaPrompt(args: {
  topDisease: string | null;
  status: string;
  topConfidence: number;
  fusedDiagnosis: string;
  sensor: SensorContext;
}) {
  const { topDisease, status, topConfidence, fusedDiagnosis, sensor } = args;
  return [
    "You are an agronomy assistant for hydroponic smart garden.",
    `Plant AI status: ${status}`,
    `Top disease: ${topDisease ?? "none"}`,
    `Top confidence: ${(topConfidence * 100).toFixed(1)}%`,
    `Sensor context: TDS=${sensor.tds ?? "N/A"} ppm, pH=${sensor.ph ?? "N/A"}, Temp=${sensor.temperature ?? "N/A"}°C, Humidity=${sensor.humidity ?? "N/A"}%`,
    `Fused diagnosis: ${fusedDiagnosis}`,
    "Return exactly 3 concise actionable lines in English, no markdown bullets.",
  ].join("\n");
}

function buildCloudinarySignature(params: Record<string, string>, apiSecret: string): string {
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return createHash("sha1").update(`${toSign}${apiSecret}`).digest("hex");
}

async function generateOllamaRecommendation(prompt: string): Promise<string | null> {
  const baseUrl = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
  const model = process.env.OLLAMA_MODEL ?? "llama3.2";
  try {
    const res = await fetch(`${baseUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt, stream: false }),
    });
    const data = (await res.json().catch(() => null)) as { response?: string } | null;
    if (!res.ok) return null;
    const text = (data?.response ?? "").trim();
    return text || null;
  } catch {
    return null;
  }
}

/* ── GET: danh sách diagnostics của device ── */
export async function GET(req: NextRequest, { params }: Params) {
  const { deviceId } = await params;

  const auth = await authorizeDevice(req, deviceId);
  if (auth.error) return auth.error;

  await dbConnect();

  const limit  = Number(req.nextUrl.searchParams.get("limit")  ?? 20);
  const status = req.nextUrl.searchParams.get("status"); // filter: healthy | warning | danger

  const query: Record<string, unknown> = { deviceId };
  if (status && ["healthy", "warning", "danger"].includes(status)) {
    query.status = status;
  }

  const records = await AIdiagnosticModel
    .find(query)
    .sort({ capturedAt: -1 })
    .limit(limit)
    .lean();

  // Backfill imageUrl for legacy diagnostics by resolving from CameraCapture.diagId
  const missingImageDiagIds = records
    .filter((r) => !r.imageUrl)
    .map((r) => String(r._id));

  let captureByDiagId = new Map<string, string>();
  if (missingImageDiagIds.length > 0) {
    const captures = await CameraCaptureModel
      .find({
        deviceId,
        userId: auth.userId,
        diagId: { $in: missingImageDiagIds },
      })
      .select({ diagId: 1, imageUrl: 1 })
      .lean();

    captureByDiagId = new Map(
      captures
        .filter((c) => c.diagId && c.imageUrl)
        .map((c) => [String(c.diagId), c.imageUrl as string])
    );
  }

  const normalizedRecords = records.map((r) => {
    if (r.imageUrl) return r;
    const resolved = captureByDiagId.get(String(r._id));
    return resolved ? { ...r, imageUrl: resolved } : r;
  });

  const total = await AIdiagnosticModel.countDocuments(query);
  const stats = await AIdiagnosticModel.aggregate([
    { $match: { deviceId } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const statMap = { healthy: 0, warning: 0, danger: 0 } as Record<string, number>;
  for (const s of stats) statMap[s._id] = s.count;

  return NextResponse.json({ records: normalizedRecords, total, stats: statMap });
}

/* ── POST: lưu kết quả mới ── */
export async function POST(req: NextRequest, { params }: Params) {
  const { deviceId } = await params;

  const auth = await authorizeDevice(req, deviceId);
  if (auth.error) return auth.error;

  await dbConnect();

  const body = await req.json();

  const {
    snapshotId,
    imageBase64, sensorContext,
    detections, status, topDisease, topConfidence,
    fusedDiagnosis, recommendation, aiModel, processingMs,
  } = body;

  if (!status) {
    return NextResponse.json({ error: "Missing status" }, { status: 400 });
  }

  let finalSensorContext = normalizeSensorContext(sensorContext);
  if (!hasAnySensorValue(finalSensorContext)) {
    const latestReading = await SensorReadingModel
      .findOne({ deviceId })
      .sort({ timestamp: -1 })
      .select({ tds_ppm: 1, ph: 1, temp: 1, humi: 1 })
      .lean();

    if (latestReading) {
      finalSensorContext = {
        tds: typeof latestReading.tds_ppm === "number" ? latestReading.tds_ppm : null,
        ph: typeof latestReading.ph === "number" ? latestReading.ph : null,
        temperature: typeof latestReading.temp === "number" ? latestReading.temp : null,
        humidity: typeof latestReading.humi === "number" ? latestReading.humi : null,
      };
    }
  }

  const finalFusedDiagnosis = (fusedDiagnosis && String(fusedDiagnosis).trim())
    ? String(fusedDiagnosis).trim()
    : fuseDiagnosis(topDisease ?? null, status, finalSensorContext);

  const ollamaPrompt = buildOllamaPrompt({
    topDisease: topDisease ?? null,
    status,
    topConfidence: typeof topConfidence === "number" ? topConfidence : 0,
    fusedDiagnosis: finalFusedDiagnosis,
    sensor: finalSensorContext,
  });
  const ollamaRecommendation = await generateOllamaRecommendation(ollamaPrompt);
  const finalRecommendation = ollamaRecommendation ?? recommendation ?? finalFusedDiagnosis;

  // Upload ảnh lên Cloudinary thay vì lưu base64 vào MongoDB
  let imageUrl = "";
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
  let uploadFailureReason = "";

  const uploadToCloudinary = async (fileValue: string): Promise<string | null> => {
    if (!cloudName || !apiKey || !apiSecret) {
      uploadFailureReason = "Missing Cloudinary credentials";
      return null;
    }

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const folder = `AIoT_smartGarden/diagnostics/${deviceId}`;
    const signature = buildCloudinarySignature({ folder, timestamp }, apiSecret);

    const formData = new FormData();
    formData.append("file", fileValue);
    formData.append("folder", folder);
    formData.append("timestamp", timestamp);
    formData.append("api_key", apiKey);
    formData.append("signature", signature);

    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: formData }
    );

    if (!uploadRes.ok) {
      const errPayload = await uploadRes.text().catch(() => "");
      console.warn("[diagnostics] Cloudinary upload failed:", errPayload || `HTTP ${uploadRes.status}`);

      // Fallback: unsigned upload via preset (useful when signed upload is rejected intermittently)
      if (uploadPreset) {
        const fallbackForm = new FormData();
        fallbackForm.append("file", fileValue);
        fallbackForm.append("upload_preset", uploadPreset);
        fallbackForm.append("folder", folder);

        const fallbackRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: "POST", body: fallbackForm }
        );

        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json() as { secure_url?: string };
          return fallbackData.secure_url ?? null;
        }

        const fallbackPayload = await fallbackRes.text().catch(() => "");
        uploadFailureReason = fallbackPayload || `Signed ${uploadRes.status}; fallback ${fallbackRes.status}`;
        return null;
      }

      uploadFailureReason = errPayload || `HTTP ${uploadRes.status}`;
      return null;
    }

    const uploadData = await uploadRes.json() as { secure_url?: string };
    return uploadData.secure_url ?? null;
  };

  // If this diagnostic is created from an existing snapshot, reuse its Cloudinary URL.
  if (snapshotId) {
    const snap = await CameraCaptureModel
      .findOne({ _id: snapshotId, deviceId, userId: auth.userId })
      .select({ imageUrl: 1 })
      .lean();
    if (snap?.imageUrl) {
      imageUrl = snap.imageUrl as string;
    }
  }

  // If image is already hosted on Cloudinary, reuse URL.
  if (!imageUrl && typeof imageBase64 === "string" && /^https?:\/\//i.test(imageBase64)) {
    if (imageBase64.includes("res.cloudinary.com/")) {
      imageUrl = imageBase64;
    } else {
      imageUrl = (await uploadToCloudinary(imageBase64)) ?? "";
    }
  }

  if (!imageUrl && imageBase64) {
    try {
      imageUrl = (await uploadToCloudinary(String(imageBase64))) ?? "";
    } catch (err) {
      console.warn("[diagnostics] Cloudinary upload error:", err);
    }
  }

  const imageUploadFailed = !!imageBase64 && !imageUrl;
  if (imageUploadFailed) {
    console.warn("[diagnostics] Image upload failed; saving diagnostic without image URL", uploadFailureReason || "unknown reason");
  }

  const doc = await AIdiagnosticModel.create({
    deviceId,
    userId:        auth.userId,   // lấy từ session — liên kết trực tiếp với user
    imageUrl,
    sensorContext: finalSensorContext,
    detections:    detections    ?? [],
    status,
    topDisease:    topDisease    ?? null,
    topConfidence: topConfidence ?? 0,
    fusedDiagnosis: finalFusedDiagnosis,
    recommendation: finalRecommendation,
    aiModel:       aiModel       ?? "YOLOv8-plantAI",
    processingMs:  processingMs  ?? 0,
  });

  const hasDetectedIssue = status !== "healthy" || !!topDisease;
  if (hasDetectedIssue) {
    const alertSeverity = status === "danger" ? "danger" : status === "warning" ? "warning" : "info";
    const alertMessageParts = [
      `AI diagnosis for ${deviceId}:`,
      finalFusedDiagnosis || topDisease || "Plant health issue detected",
      `Recommendation: ${finalRecommendation}`,
    ];

    await createAlert({
      deviceId,
      userId: auth.userId,
      type: "ai_disease",
      severity: alertSeverity,
      message: alertMessageParts.join(" "),
      value: typeof topConfidence === "number" ? Math.round(topConfidence * 100) : undefined,
      threshold: alertSeverity === "danger" ? 80 : alertSeverity === "warning" ? 60 : undefined,
    });
  }

  // Link snapshot -> diagnostic for end-to-end traceability
  if (snapshotId) {
    await CameraCaptureModel.updateOne(
      { _id: snapshotId, deviceId, userId: auth.userId },
      { $set: { diagId: doc._id } }
    );
  }

  return NextResponse.json({
    id: doc._id,
    sensorContext: finalSensorContext,
    fusedDiagnosis: finalFusedDiagnosis,
    recommendation: finalRecommendation,
    imageUploadFailed,
    warning: imageUploadFailed ? "Image upload failed. Diagnostic was saved without image." : undefined,
    warningDetail: imageUploadFailed ? uploadFailureReason || undefined : undefined,
  }, { status: 201 });
}
