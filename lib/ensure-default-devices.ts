import { Types } from "mongoose";
import DeviceModel from "@/models/Device";

const SHARED_REAL_DEVICE_ID = "DEV_ESP32_001";

function suffixFromUserId(userId: string) {
  return userId.replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase() || "USER00";
}

export async function ensureDefaultDevicesForUser(userId: string) {
  const suffix = suffixFromUserId(userId);
  const ownerId = new Types.ObjectId(userId);

  const demoDevices = [
    {
      deviceId: `DEV_DEMO_${suffix}_001`,
      activationCode: `DEMO-${suffix}-001`,
      name: "Demo Basil Pot",
      plantType: "Basil",
    },
    {
      deviceId: `DEV_DEMO_${suffix}_002`,
      activationCode: `DEMO-${suffix}-002`,
      name: "Demo Lettuce Pot",
      plantType: "Lettuce",
    },
  ];

  for (const demo of demoDevices) {
    await DeviceModel.updateOne(
      { deviceId: demo.deviceId },
      {
        $setOnInsert: {
          deviceId: demo.deviceId,
          userId: ownerId,
          name: demo.name,
          plantType: demo.plantType,
          isOnline: false,
          activationCode: demo.activationCode,
        },
      },
      { upsert: true }
    );
  }

  const sharedReal = await DeviceModel.findOne({ deviceId: SHARED_REAL_DEVICE_ID }).lean();
  if (!sharedReal) {
    await DeviceModel.create({
      deviceId: SHARED_REAL_DEVICE_ID,
      userId: ownerId,
      name: "ESP32 Smart Pot",
      plantType: "Hydroponics",
      isOnline: false,
      activationCode: "REAL-ESP32-001",
    });
  }
}

export const SHARED_DEVICE_IDS = [SHARED_REAL_DEVICE_ID] as const;
