import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import AIdiagnosticModel from "@/models/AIdiagnostic";
import { authorizeDevice } from "@/lib/deviceAuth";

type Params = { params: Promise<{ deviceId: string }> };

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

  const total = await AIdiagnosticModel.countDocuments(query);
  const stats = await AIdiagnosticModel.aggregate([
    { $match: { deviceId } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const statMap = { healthy: 0, warning: 0, danger: 0 } as Record<string, number>;
  for (const s of stats) statMap[s._id] = s.count;

  return NextResponse.json({ records, total, stats: statMap });
}

/* ── POST: lưu kết quả mới ── */
export async function POST(req: NextRequest, { params }: Params) {
  const { deviceId } = await params;

  const auth = await authorizeDevice(req, deviceId);
  if (auth.error) return auth.error;

  await dbConnect();

  const body = await req.json();

  const {
    imageBase64, sensorContext,
    detections, status, topDisease, topConfidence,
    fusedDiagnosis, recommendation, aiModel, processingMs,
  } = body;

  if (!status) {
    return NextResponse.json({ error: "Thiếu status" }, { status: 400 });
  }

  // Upload ảnh lên Cloudinary thay vì lưu base64 vào MongoDB
  let imageUrl = "";
  if (imageBase64) {
    try {
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
      const apiKey    = process.env.CLOUDINARY_API_KEY!;
      const apiSecret = process.env.CLOUDINARY_API_SECRET!;

      const formData = new FormData();
      formData.append("file", imageBase64);
      formData.append("upload_preset", process.env.CLOUDINARY_UPLOAD_PRESET ?? "AIoT_smartGarden");
      formData.append("folder", `AIoT_smartGarden/diagnostics/${deviceId}`);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData }
      );

      if (uploadRes.ok) {
        const uploadData = await uploadRes.json() as { secure_url: string };
        imageUrl = uploadData.secure_url;
      }
    } catch {
      // upload thất bại → vẫn lưu record, chỉ không có ảnh
    }
  }

  const doc = await AIdiagnosticModel.create({
    deviceId,
    userId:        auth.userId,   // lấy từ session — liên kết trực tiếp với user
    imageUrl,
    sensorContext: sensorContext ?? {},
    detections:    detections    ?? [],
    status,
    topDisease:    topDisease    ?? null,
    topConfidence: topConfidence ?? 0,
    fusedDiagnosis: fusedDiagnosis ?? "",
    recommendation: recommendation ?? "",
    aiModel:       aiModel       ?? "YOLOv8-plantAI",
    processingMs:  processingMs  ?? 0,
  });

  return NextResponse.json({ id: doc._id }, { status: 201 });
}
