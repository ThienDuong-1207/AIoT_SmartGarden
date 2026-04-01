import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { dbConnect } from "@/lib/mongodb";
import CameraCaptureModel from "@/models/CameraCapture";
import { authorizeDevice, authorizeDeviceToken } from "@/lib/deviceAuth";

type Params = { params: Promise<{ deviceId: string }> };

function buildCloudinarySignature(params: Record<string, string>, apiSecret: string): string {
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return createHash("sha1").update(`${toSign}${apiSecret}`).digest("hex");
}

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
    snapshotId:  snapshot._id,
    image:      snapshot.imageUrl,
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
  const auth = await authorizeDeviceToken(req, deviceId, { requireToken: true });
  if (auth.error) return auth.error;

  const body = await req.json();

  if (!body.imageBase64) {
    return NextResponse.json({ error: "imageBase64 required" }, { status: 400 });
  }

  await dbConnect();

  // Upload ảnh lên Cloudinary
  let imageUrl = "";
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ error: "Cloudinary credentials are missing" }, { status: 500 });
    }

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const folder = `AIoT_smartGarden/snapshots/${deviceId}`;
    const signature = buildCloudinarySignature({ folder, timestamp }, apiSecret);

    const formData = new FormData();
    formData.append("file", body.imageBase64);
    formData.append("folder", folder);
    formData.append("timestamp", timestamp);
    formData.append("api_key", apiKey);
    formData.append("signature", signature);

    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: formData }
    );

    if (!uploadRes.ok) {
      const uploadErr = await uploadRes.text();
      return NextResponse.json(
        { error: `Cloudinary upload failed: ${uploadErr}` },
        { status: 502 }
      );
    }

    const uploadData = await uploadRes.json() as { secure_url: string };
    imageUrl = uploadData.secure_url;
  } catch {
    return NextResponse.json({ error: "Cloudinary upload failed" }, { status: 502 });
  }

  await CameraCaptureModel.create({
    deviceId,
    userId:      auth.userId,
    imageUrl,
    capturedAt:  body.capturedAt ? new Date(body.capturedAt) : new Date(),
    triggeredBy: "manual",
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
