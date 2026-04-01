"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { requestFcmToken, onForegroundMessage } from "@/lib/firebaseClient";

/*
  useFcmToken — chạy 1 lần sau khi user đăng nhập.
  1. Xin quyền notification (browser prompt)
  2. Lấy FCM registration token
  3. Lưu token lên /api/users/fcm-token
  4. Lắng nghe foreground notifications (hiển thị toast)
*/
export function useFcmToken() {
  const { data: session, status } = useSession();
  const registered = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" || registered.current) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;
    // Không hỏi lại nếu user đã từ chối
    if (Notification.permission === "denied") return;

    registered.current = true;

    (async () => {
      const token = await requestFcmToken();
      if (!token) return;

      try {
        await fetch("/api/users/fcm-token", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
      } catch {
        // Non-critical — tiếp tục bình thường
      }
    })();

    // Foreground notification: khi tab đang mở, FCM không tự hiển thị
    // → dùng browser Notification API để show manually
    const unsubscribe = onForegroundMessage((payload) => {
      const title = payload.notification?.title ?? "Smart Garden Alert";
      const body  = payload.notification?.body  ?? "";
      if (Notification.permission === "granted") {
        new Notification(title, {
          body,
          icon: "/icons/icon-192.png",
        });
      }
    });

    return () => { unsubscribe(); };
  }, [status, session]);
}
