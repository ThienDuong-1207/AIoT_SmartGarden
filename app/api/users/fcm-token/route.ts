import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import UserModel from "@/models/User";

/*
  PATCH /api/users/fcm-token
  Body: { token: string }   → lưu FCM token
  Body: { token: null }     → xóa FCM token (user tắt notifications)
*/
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { token } = await req.json() as { token: string | null };

  await dbConnect();

  if (token) {
    await UserModel.findOneAndUpdate(
      { email: session.user.email },
      { fcmToken: token }
    );
  } else {
    await UserModel.findOneAndUpdate(
      { email: session.user.email },
      { $unset: { fcmToken: 1 } }
    );
  }

  return NextResponse.json({ ok: true });
}
