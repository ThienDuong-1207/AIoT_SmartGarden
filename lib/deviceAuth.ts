/**
 * deviceAuth.ts
 * Shared auth helpers for device-scoped API routes.
 *
 * - authorizeDevice:      NextAuth session + device ownership (user-facing)
 * - authorizeDeviceToken: activationCode Bearer token (ESP32-facing)
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import DeviceModel from "@/models/Device";
import { NextRequest, NextResponse } from "next/server";
import type { InferSchemaType } from "mongoose";

type DeviceDoc = InferSchemaType<typeof import("@/models/Device").default.schema>;

type AuthOk = {
  error: null;
  device: DeviceDoc & { _id: unknown };
  userId: string;
};

type AuthFail = {
  error: NextResponse;
  device: null;
  userId: null;
};

/**
 * Dùng cho endpoints người dùng gọi từ browser.
 * Kiểm tra session NextAuth + thiết bị thuộc về user đó.
 */
export async function authorizeDevice(
  _req: NextRequest,
  deviceId: string
): Promise<AuthOk | AuthFail> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      device: null,
      userId: null,
    };
  }

  await dbConnect();
  const device = await DeviceModel.findOne({ deviceId }).lean();

  if (!device) {
    return {
      error: NextResponse.json({ error: "Device not found" }, { status: 404 }),
      device: null,
      userId: null,
    };
  }

  if (device.userId.toString() !== session.user.id) {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      device: null,
      userId: null,
    };
  }

  return { error: null, device: device as AuthOk["device"], userId: session.user.id };
}

/**
 * Dùng cho endpoints ESP32 gọi trực tiếp (không có session).
 * Kiểm tra Authorization: Bearer {activationCode} header.
 * Nếu không có header → vẫn cho qua (backward compat với thiết bị cũ).
 * Nếu có header sai → từ chối.
 */
export async function authorizeDeviceToken(
  req: NextRequest,
  deviceId: string
): Promise<AuthOk | AuthFail> {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "").trim();

  await dbConnect();
  const device = await DeviceModel.findOne({ deviceId }).lean();

  if (!device) {
    return {
      error: NextResponse.json({ error: "Device not found" }, { status: 404 }),
      device: null,
      userId: null,
    };
  }

  if (token && token !== device.activationCode) {
    return {
      error: NextResponse.json({ error: "Invalid token" }, { status: 401 }),
      device: null,
      userId: null,
    };
  }

  return {
    error: null,
    device: device as AuthOk["device"],
    userId: device.userId.toString(),
  };
}
