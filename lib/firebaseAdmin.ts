import admin from "firebase-admin";

/*
  Firebase Admin SDK singleton.
  Dùng server-side để gửi FCM push notifications.

  Cần 3 env vars (lấy từ Firebase Console → Project Settings → Service Accounts):
    FIREBASE_PROJECT_ID
    FIREBASE_CLIENT_EMAIL
    FIREBASE_PRIVATE_KEY   (dạng "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n")
*/

function initFirebaseAdmin() {
  if (admin.apps.length > 0) return admin.app();

  const projectId    = process.env.FIREBASE_PROJECT_ID;
  const clientEmail  = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey   = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    console.warn("[firebase-admin] Missing env vars — FCM disabled");
    return null;
  }

  return admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
  });
}

export function getFirebaseAdmin() {
  return initFirebaseAdmin();
}

export function getFirebaseMessaging() {
  const app = getFirebaseAdmin();
  if (!app) return null;
  return admin.messaging(app);
}
