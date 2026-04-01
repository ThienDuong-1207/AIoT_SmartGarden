// File: app/api/camera/upload/route.ts
import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { dbConnect } from '@/lib/mongodb';
import CameraCapture from '@/models/CameraCapture';
import Device from '@/models/Device'; // Gọi thêm bảng Device để lấy userId

// Cấu hình Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
    try {
        // 1. Đọc Device ID từ Header
        const deviceId = request.headers.get('Device-Id');
        if (!deviceId) {
            return NextResponse.json({ success: false, message: "Missing Device-Id header" }, { status: 400 });
        }

        // 2. Kết nối DB và tìm chủ nhân (userId) của thiết bị này
        await dbConnect();
        const device = await Device.findOne({ deviceId });

        if (!device || !device.userId) {
            console.error(`Không tìm thấy thiết bị hoặc userId cho mã: ${deviceId}`);
            return NextResponse.json({ success: false, message: "Device not found or missing userId" }, { status: 404 });
        }

        // 3. Nhận buffer ảnh từ ESP32
        const arrayBuffer = await request.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        if (buffer.length === 0) {
            return NextResponse.json({ success: false, message: "Empty image buffer" }, { status: 400 });
        }

        console.log(`Nhận ảnh từ [${deviceId}] (User: ${device.userId}). Kích thước: ${buffer.length} bytes...`);

        // 4. Upload lên Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: 'smart_garden_iot' },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(buffer);
        });

        const imageUrl = (uploadResult as any).secure_url;
        console.log(`Upload Cloudinary thành công! URL: ${imageUrl}`);

        // 5. Lưu vào MongoDB CHUẨN KHỚP VỚI SCHEMA CỦA BẠN
        const newCapture = await CameraCapture.create({
            deviceId: deviceId,
            userId: device.userId,       // Lấy từ bảng Device sang
            imageUrl: imageUrl,
            triggeredBy: 'schedule',     // Nằm trong Enum ["manual", "schedule", "alert"]
            // capturedAt: Không cần truyền, Mongoose sẽ tự lấy Date.now() theo Schema
        });

        return NextResponse.json({ success: true, url: imageUrl, captureId: newCapture._id });

    } catch (error) {
        console.error("Lỗi API Upload Ảnh:", error);
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
}