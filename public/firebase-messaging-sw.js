 
// Firebase Messaging Service Worker
// Xử lý push notifications khi browser/tab đang đóng (background)

importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

// Config phải hardcode ở đây vì Service Worker không truy cập được env vars
// Các giá trị này là public (NEXT_PUBLIC_*) nên an toàn khi để client-side
firebase.initializeApp({
  apiKey:            "AIzaSyBx5OAOhOh83dkk3AvhoZuRZDM8U1FYDy8",
  authDomain:        "aiot-smart-garden-c2373-5d6aa.firebaseapp.com",
  projectId:         "aiot-smart-garden-c2373-5d6aa",
  messagingSenderId: "809583108027",
  appId:             "1:809583108027:web:4fda3c36dd1eff9cf4ee9e",
});

const messaging = firebase.messaging();

// Xử lý background push — hiển thị notification tray của OS
messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification ?? {};
  const link = payload.fcmOptions?.link ?? payload.data?.link ?? "/dashboard";

  self.registration.showNotification(title ?? "Smart Garden", {
    body:  body ?? "",
    icon:  "/icons/icon-192.png",
    badge: "/icons/badge-72.png",
    data:  { link },
    actions: [
      { action: "open",    title: "View Dashboard" },
      { action: "dismiss", title: "Dismiss" },
    ],
  });
});

// Click vào notification → mở dashboard
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const link = event.notification.data?.link ?? "/dashboard";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(link);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(link);
    })
  );
});
