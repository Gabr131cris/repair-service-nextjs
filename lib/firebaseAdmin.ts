import admin from "firebase-admin";

// ⛔ BLOCAȚI ADMIN SDK ÎN TIMPUL BUILD-ULUI
if (process.env.NEXT_PHASE === "phase-production-build") {
  // Exportăm mock ca să nu crape build-ul
  // Oricum Admin SDK nu trebuie să ruleze la build
  export const adminDb = {} as any;
  export const adminStorage = {} as any;
  return;
}

// ⬇ Normal runtime
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

export const adminDb = admin.firestore();
export const adminStorage = admin.storage().bucket();
