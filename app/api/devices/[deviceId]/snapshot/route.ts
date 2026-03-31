import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import CameraCaptureModel from "@/models/CameraCapture";
import { authorizeDevice, authorizeDeviceToken } from "@/lib/deviceAuth";

type Params = { params: Promise<{ deviceId: string }> };

/*
  GET /api/devices/[deviceId]/snapshot?after=<ISO>
  Poll cho ảnh mới nhất chụp SAU thời điểm `after`.
  ESP32 hoặc frontend gọi để lấy ảnh vừa capture.
*/
export async function GET(req: NextRequest, { params }: Params) {
  const { deviceId } = await params;

  const auth = await authorizeDevice(req, deviceId);
  if (auth.error) return auth.error;

  await dbConnect();

  const afterParam = req.nextUrl.searchParams.get("after");
  const after = afterParam ? new Date(afterParam) : new Date(Date.now() - 30_000); // default: 30s trước

  const snapshot = await CameraCaptureModel
    .findOne({ deviceId, capturedAt: { $gt: after } })
    .sort({ capturedAt: -1 })
    .lean();

  if (!snapshot) {
    return NextResponse.json({ image: null }, { status: 200 });
  }

  return NextResponse.json({
    image:      snapshot.imageBase64,
    capturedAt: snapshot.capturedAt,
  });
}

/*
  POST /api/devices/[deviceId]/snapshot
  ESP32 gửi ảnh sau khi nhận lệnh capture_now.
  Body: { imageBase64: "data:image/jpeg;base64,..." }
*/
export async function POST(req: NextRequest, { params }: Params) {
  const { deviceId } = await params;

  // ESP32 dùng Authorization: Bearer {activationCode}
  const auth = await authorizeDeviceToken(req, deviceId);
  if (auth.error) return auth.error;

  const body = await req.json();

  if (!body.imageBase64) {
    return NextResponse.json({ error: "imageBase64 required" }, { status: 400 });
  }

  await dbConnect();

  await CameraCaptureModel.create({
    deviceId,
    imageBase64: body.imageBase64,
    capturedAt:  body.capturedAt ? new Date(body.capturedAt) : new Date(),
  });

  // Chỉ giữ lại 10 snapshot gần nhất mỗi thiết bị
  const all = await CameraCaptureModel
    .find({ deviceId })
    .sort({ capturedAt: -1 })
    .select("_id")
    .lean();

  if (all.length > 10) {
    const toDelete = all.slice(10).map(d => d._id);
    await CameraCaptureModel.deleteMany({ _id: { $in: toDelete } });
  }

  return NextResponse.json({ ok: true });
}
