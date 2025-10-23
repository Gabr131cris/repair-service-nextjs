// lib/firebase.ts
"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 🔹 Variabile globale (lazy caching)
let app: ReturnType<typeof initializeApp> | null = null;
let firestoreDb: ReturnType<typeof getFirestore> | null = null;

/**
 * ✅ Inițializează Firebase o singură dată, doar pe client
 */
export function getFirebaseApp() {
  // 🚫 Evită rularea pe server (SSR)
  if (typeof window === "undefined") {
    console.warn("⚠️ Firebase initialization skipped on server.");
    return getApps().length ? getApp() : ({} as any);
  }

  if (!app) {
    // 🔹 Fallback complet: process.env + import.meta.env (Vercel Edge/Turbopack)
    const firebaseConfig = {
      apiKey:
        process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
        (import.meta as any)?.env?.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain:
        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
        (import.meta as any)?.env?.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId:
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
        (import.meta as any)?.env?.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket:
        process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
        (import.meta as any)?.env?.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId:
        process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
        (import.meta as any)?.env?.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId:
        process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
        (import.meta as any)?.env?.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId:
        process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ||
        (import.meta as any)?.env?.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    };

    // 🔍 Log complet pentru debugging (vezi consola browserului)
    console.groupCollapsed("🌍 Firebase Runtime Config Check");
    console.log("NEXT_PUBLIC_FIREBASE_API_KEY:", firebaseConfig.apiKey);
    console.log("NEXT_PUBLIC_FIREBASE_PROJECT_ID:", firebaseConfig.projectId);
    console.log("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:", firebaseConfig.authDomain);
    console.log("NEXT_PUBLIC_FIREBASE_APP_ID:", firebaseConfig.appId);
    console.groupEnd();

    // ❌ Dacă lipsesc variabile, log explicit
    if (!firebaseConfig.apiKey) {
      console.error(
        "❌ Firebase API key missing! Check your .env or Vercel environment variables."
      );
    }

    // ✅ Inițializare Firebase (o singură dată)
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  }

  return app;
}

/**
 * ✅ Returnează instanța Firestore (lazy)
 */
export function getDb() {
  if (!firestoreDb && typeof window !== "undefined") {
    firestoreDb = getFirestore(getFirebaseApp());
  }
  return firestoreDb!;
}

/**
 * ✅ Returnează Auth (importat lazy, doar pe client)
 */
export async function getFirebaseAuth() {
  if (typeof window === "undefined") {
    console.warn("⚠️ Firebase Auth requested on server — returning null.");
    return null;
  }

  const { getAuth } = await import("firebase/auth");
  return getAuth(getFirebaseApp());
}

// 🔹 Exporturi compatibile pentru codul existent
export const db =
  typeof window !== "undefined" ? getDb() : (null as any);
export const appInstance =
  typeof window !== "undefined" ? getFirebaseApp() : ({} as any);
