import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { dbConnect } from '@/lib/mongodb';
import CameraCapture from '@/models/CameraCapture';
import Device from '@/models/Device';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
    try {
        const deviceId = request.headers.get('Device-Id');
        if (!deviceId) return NextResponse.json({ success: false }, { status: 400 });

        await dbConnect();
        const device = await Device.findOne({ deviceId });
        if (!device) return NextResponse.json({ success: false }, { status: 404 });

        const arrayBuffer = await request.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = `data:image/jpeg;base64,${buffer.toString('base64')}`;

        // Upload bằng SDK chính thức
        const uploadResult = await cloudinary.uploader.upload(base64Image, {
            folder: 'smart_garden_iot',
            upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET || 'AIoT_smartGarden',
        });

        console.log(`✅ Upload OK: ${uploadResult.secure_url}`);

        // Tìm đoạn CameraCapture.create và sửa lại:
        await CameraCapture.create({
            deviceId,
            userId: device.userId,
            imageUrl: uploadResult.secure_url,
            triggeredBy: 'manual',
            // timestamp: ... (You successfully removed this property)
        });

        return NextResponse.json({ success: true, url: uploadResult.secure_url });
    } catch (error: any) {
        console.error("❌ Upload Error:", error.message);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}