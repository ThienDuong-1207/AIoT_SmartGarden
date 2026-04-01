import { NextResponse } from "next/server";
import mqtt from "mqtt"; // Đảm bảo bạn đã cài 'npm install mqtt'

export async function POST(request: Request, { params }: { params: { deviceId: string } }) {
    const { deviceId } = params;

    // Cấu hình HiveMQ giống như trong file mqtt.ts của bạn
    const client = mqtt.connect(`mqtts://${process.env.MQTT_BROKER}`, {
        username: process.env.MQTT_USER,
        password: process.env.MQTT_PASSWORD,
        port: 8883,
    });

    return new Promise((resolve) => {
        client.on("connect", () => {
            // Bắn lệnh capture xuống ESP32
            client.publish(`garden/${deviceId}/commands`, "capture_now", { qos: 1 }, () => {
                console.log(`📡 Đã gửi lệnh chụp ảnh tới ${deviceId}`);
                client.end();
                resolve(NextResponse.json({ success: true, message: "Command sent" }));
            });
        });
    });
}