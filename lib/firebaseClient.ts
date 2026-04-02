import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getMessaging, getToken, onMessage, deleteToken, type Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function hasRequiredFirebaseConfig() {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId
  );
}

function normalizeVapidKey(value: string | undefined): string | null {
  if (!value) return null;

  const trimmed = value.trim().replace(/^['\"]|['\"]$/g, "");
  if (!trimmed) return null;
  if (!/^[A-Za-z0-9_-]+$/.test(trimmed)) return null;

  try {
    const base64 = trimmed.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const raw = atob(padded);
    if (raw.length !== 65) return null;
  } catch {
    return null;
  }

  return trimmed;
}

function getFirebaseApp(): FirebaseApp | null {
  if (!hasRequiredFirebaseConfig()) return null;
  if (getApps().length > 0) return getApps()[0]!;
  return initializeApp(firebaseConfig);
}

export function getFirebaseMessagingClient(): Messaging | null {
  if (typeof window === "undefined") return null;
  if (!("serviceWorker" in navigator)) return null;
  const app = getFirebaseApp();
  if (!app) {
    console.warn("[fcm-client] Firebase config is incomplete. Skipping messaging setup.");
    return null;
  }
  return getMessaging(app);
}

export async function requestFcmToken(): Promise<string | null> {
  const messaging = getFirebaseMessagingClient();
  if (!messaging) return null;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  const vapidKey = normalizeVapidKey(process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY);
  if (!vapidKey) {
    console.error(
      "[fcm-client] Invalid NEXT_PUBLIC_FIREBASE_VAPID_KEY. Check Firebase Console > Cloud Messaging > Web Push certificates."
    );
    return null;
  }

  const attemptGetToken = async (registration: ServiceWorkerRegistration) => {
    return getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });
  };

  try {
    const registered = await navigator.serviceWorker.register("/firebase-messaging-sw.js", { scope: "/" });
    await registered.update();
    const registration = await navigator.serviceWorker.ready;

    const token = await attemptGetToken(registration);
    return token ?? null;
  } catch (err) {
    const name = err instanceof DOMException ? err.name : "";
    const message = err instanceof Error ? err.message : String(err ?? "");
    const shouldRecover =
      name === "AbortError" ||
      /applicationServerKey|Registration failed - push service error/i.test(message);

    if (!shouldRecover) {
      console.error("[fcm-client] getToken error:", err);
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const oldSub = await registration.pushManager.getSubscription();
      if (oldSub) {
        await oldSub.unsubscribe();
      }

      await deleteToken(messaging).catch(() => undefined);

      const token = await attemptGetToken(registration);
      if (!token) {
        console.warn("[fcm-client] Push registration still unavailable after cleanup.");
      }
      return token ?? null;
    } catch (retryErr) {
      console.warn("[fcm-client] getToken retry failed (non-fatal):", retryErr);
      return null;
    }
  }
}

export function onForegroundMessage(
  callback: (payload: { notification?: { title?: string; body?: string } }) => void
) {
  const messaging = getFirebaseMessagingClient();
  if (!messaging) return () => {};
  return onMessage(messaging, callback);
}
