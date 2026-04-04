// 2 DÒNG NÀY SẼ ÉP NEXT.JS LUÔN LẤY DỮ LIỆU MỚI NHẤT TỪ MONGODB
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import CameraCapture from "@/models/CameraCapture";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ deviceId: string }> }
) {
  try {
    const { deviceId } = await params;
    await dbConnect();

    // Tìm ảnh mới nhất
    const latestCapture = await CameraCapture.findOne({ deviceId })
      .sort({ capturedAt: -1 })
      .lean() as unknown as { imageUrl?: string; url?: string; timestamp?: Date; capturedAt?: Date; triggeredBy?: string };

    if (!latestCapture) {
      return NextResponse.json({ success: false, message: "No image found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        imageUrl: latestCapture.imageUrl || latestCapture.url || "",
        timestamp: latestCapture.capturedAt || latestCapture.timestamp || new Date(),
        triggeredBy: latestCapture.triggeredBy || "unknown"
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}