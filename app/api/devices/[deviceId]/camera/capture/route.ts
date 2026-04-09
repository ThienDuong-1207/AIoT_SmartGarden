import { NextResponse } from "next/server";
import mqtt from "mqtt";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ deviceId: string }> } // Cấu hình cho Next.js 15
) {
    // BẮT BUỘC dùng await để lấy deviceId
    const { deviceId } = await params;

    const broker = process.env.MQTT_BROKER || "00ab434094624b199888389f95079d45.s1.eu.hivemq.cloud";
    const username = process.env.MQTT_USER || "admin";
    const password = process.env.MQTT_PASSWORD || "Admin123";

    console.log(`📡 Đang gửi lệnh chụp ảnh tới thiết bị: ${deviceId}`);

    try {
        const client = mqtt.connect(`mqtts://${broker}`, {
            username,
            password,
            port: 8883,
            rejectUnauthorized: false
        });

        return new Promise<Response>((resolve) => {
            const timeout = setTimeout(() => {
                client.end();
                resolve(NextResponse.json({ success: false, error: "MQTT Timeout" }, { status: 504 }));
            }, 5000);

            client.on("connect", () => {
                clearTimeout(timeout);
                // Topic chuẩn: garden/DEV_ESP32_001/commands
                const topic = `garden/${deviceId}/commands`;
                client.publish(topic, "capture_now", { qos: 1 }, (err) => {
                    client.end();
                    if (err) {
                        resolve(NextResponse.json({ success: false, error: err.message }, { status: 500 }));
                    } else {
                        console.log(`✅ Đã bắn lệnh capture_now tới topic: ${topic}`);
                        resolve(NextResponse.json({ success: true }));
                    }
                });
            });

            client.on("error", (err) => {
                clearTimeout(timeout);
                client.end();
                resolve(NextResponse.json({ success: false, error: err.message }, { status: 500 }));
            });
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Capture command failed";
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}