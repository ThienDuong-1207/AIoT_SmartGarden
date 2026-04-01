import { getFirebaseMessaging } from "@/lib/firebaseAdmin";
import { dbConnect } from "@/lib/mongodb";
import UserModel from "@/models/User";

export type NotificationPayload = {
  title: string;
  body: string;
  /** Optional deep-link path, e.g. "/dashboard/SGP-2024-001/alerts" */
  link?: string;
  /** Arbitrary data passed to the notification handler */
  data?: Record<string, string>;
};

/*
  Gửi FCM push notification tới 1 user qua fcmToken.
  Nếu token không hợp lệ (registration-token-not-registered)
  → tự động xóa token khỏi DB.
*/
export async function sendNotification(
  userId: string,
  payload: NotificationPayload
): Promise<void> {
  const messaging = getFirebaseMessaging();
  if (!messaging) return; // FCM chưa cấu hình → bỏ qua

  await dbConnect();
  const user = await UserModel.findById(userId).select("fcmToken").lean();
  const token = (user as { fcmToken?: string } | null)?.fcmToken;
  if (!token) return; // User chưa cấp quyền notification

  try {
    await messaging.send({
      token,
      notification: {
        title: payload.title,
        body:  payload.body,
      },
      webpush: {
        fcmOptions: {
          link: payload.link ?? "/dashboard",
        },
        notification: {
          icon: "/icons/icon-192.png",
          badge: "/icons/badge-72.png",
        },
      },
      data: payload.data ?? {},
    });
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    // Token hết hạn hoặc bị revoke → xóa khỏi DB
    if (
      code === "messaging/registration-token-not-registered" ||
      code === "messaging/invalid-registration-token"
    ) {
      await UserModel.findByIdAndUpdate(userId, { $unset: { fcmToken: 1 } });
      console.warn(`[fcm] Removed stale token for user ${userId}`);
    } else {
      console.error("[fcm] Send error:", err);
    }
  }
}

/*
  Helper: map alert type → title + icon hint
*/
export function alertToNotification(
  alertType: string,
  message: string,
  deviceName: string
): NotificationPayload {
  const TITLES: Record<string, string> = {
    tds_low:        "⚠️ Low Nutrients",
    tds_high:       "⚠️ High TDS",
    ph_low:         "🚨 pH Critical Low",
    ph_high:        "🚨 pH Critical High",
    temp_low:       "⚠️ Temperature Low",
    temp_high:      "⚠️ Temperature High",
    water_low:      "🚨 Water Level Low",
    ai_disease:     "🌿 Disease Detected",
    device_offline: "📡 Device Offline",
  };

  return {
    title: `${TITLES[alertType] ?? "Smart Garden Alert"} — ${deviceName}`,
    body:  message,
    link:  "/dashboard",
    data:  { alertType },
  };
}
