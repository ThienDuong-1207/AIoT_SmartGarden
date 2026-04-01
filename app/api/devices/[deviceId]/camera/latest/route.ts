import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import CameraCaptureModel from "@/models/CameraCapture";

type Params = { params: Promise<{ deviceId: string }> };

export async function GET(
  req: Request,
  { params }: Params
) {
  try {
    const { deviceId } = await params;

    await dbConnect();

    // Lấy bức ảnh mới nhất nhất từ Database theo deviceId
    const latestCapture = await CameraCaptureModel.findOne({ deviceId })
      .sort({ capturedAt: -1 })
      .lean();

    if (!latestCapture) {
      return NextResponse.json(
        { success: false, message: "No camera image found for this device" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        imageUrl: latestCapture.imageUrl,
        capturedAt: latestCapture.capturedAt,
      },
    });
  } catch (error) {
    console.error("Lỗi API lấy ảnh Camera mới nhất:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
