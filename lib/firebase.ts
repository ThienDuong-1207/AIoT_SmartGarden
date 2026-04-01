import { initializeApp } from "firebase/app";
import { getMessaging, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Messaging only in browser environment
export function getFirebaseMessaging() {
  if (typeof window === "undefined") return null;
  try {
    return getMessaging(app);
  } catch {
    return null;
  }
}

// Listen to foreground messages
export function setupMessagingListener(callback: (payload: any) => void) {
  if (typeof window === "undefined") return;

  const messaging = getFirebaseMessaging();
  if (!messaging) return;

  onMessage(messaging, (payload) => {
    console.log("[FCM] Foreground message:", payload);
    callback(payload);
  });
}

export default app;
