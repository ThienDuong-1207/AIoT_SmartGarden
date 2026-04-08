import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import CameraCapture from '@/models/CameraCapture';
import Device from '@/models/Device';

export async function POST(request: Request) {
    try {
        const deviceId = request.headers.get('Device-Id');
        if (!deviceId) return NextResponse.json({ success: false }, { status: 400 });

        await dbConnect();
        const device = await Device.findOne({ deviceId });
        if (!device) return NextResponse.json({ success: false }, { status: 404 });

        const arrayBuffer = await request.arrayBuffer();
        // Chuyển sang Unsigned Upload (Fetch API) để bypass xác thực và tránh timeout 499
        const formData = new FormData();
        const blob = new Blob([arrayBuffer], { type: 'image/jpeg' });
        formData.append("file", blob, "capture.jpg");
        formData.append("upload_preset", process.env.CLOUDINARY_UPLOAD_PRESET || "AIoT_smartGarden");

        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
        
        const resObj = await fetch(uploadUrl, {
            method: "POST",
            body: formData,
        });

        const uploadResult = await resObj.json();
        if (!resObj.ok) {
            throw new Error(uploadResult.error?.message || "Upload failed");
        }

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
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Upload failed";
        console.error("❌ Upload Error:", message);
        return NextResponse.json({ success: false, message }, { status: 500 });
    }
}