import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import CameraCapture from "@/models/CameraCapture";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ deviceId: string }> }
) {
  try {
    // 1. Chờ lấy params (Bắt buộc cho Next.js 15)
    const { deviceId } = await params;

    // 2. Kết nối DB
    await dbConnect();

    // 3. Tìm ảnh mới nhất
    // Ép kiểu 'any' ở đây để tránh TypeScript báo lỗi "Property does not exist"
    const latestCapture = await CameraCapture.findOne({ deviceId })
      .sort({ timestamp: -1 })
      .lean() as any;

    // 4. Nếu không tìm thấy dữ liệu
    if (!latestCapture) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy ảnh cho thiết bị này" },
        { status: 404 }
      );
    }

    // 5. Trả về dữ liệu (Kiểm tra kỹ tên trường imageUrl)
    return NextResponse.json({
      success: true,
      data: {
        // Nếu trong DB bạn lỡ lưu là 'url' thay vì 'imageUrl', dòng dưới sẽ tự sửa
        imageUrl: latestCapture.imageUrl || latestCapture.url || "",
        timestamp: latestCapture.timestamp || new Date(),
        triggeredBy: latestCapture.triggeredBy || "unknown"
      }
    });

  } catch (error: any) {
    console.error("❌ Lỗi API Latest:", error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}