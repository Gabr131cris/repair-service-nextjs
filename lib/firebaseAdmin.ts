import * as adminSDK from "firebase-admin";

// 🔥 În build-ul Turbopack, env-urile NU sunt încărcate complet.
// Așa că împiedicăm inițializarea Admin SDK dacă lipsesc.
const isBuild =
  process.env.NEXT_PHASE === "phase-production-build" ||
  !process.env.FIREBASE_PRIVATE_KEY ||
  !process.env.FIREBASE_CLIENT_EMAIL ||
  !process.env.FIREBASE_PROJECT_ID ||
  !process.env.FIREBASE_STORAGE_BUCKET;

if (!isBuild) {
  if (!adminSDK.apps.length) {
    adminSDK.initializeApp({
      credential: adminSDK.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  }
}

// 🔥 Dacă suntem în build, exportăm mock objects
export const adminDb = isBuild ? ({} as any) : adminSDK.firestore();
export const adminStorage = isBuild ? ({} as any) : adminSDK.storage().bucket();
