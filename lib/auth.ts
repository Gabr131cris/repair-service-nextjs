

import { getFirebaseAuth, getDb } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

/* ============================================================
   🔹 Înregistrare utilizator nou + creare document în Firestore
   ============================================================ */
export async function registerUser(
  email: string,
  password: string,
  displayName: string
) {
  if (typeof window === "undefined") {
    console.warn("registerUser() called on server — skipped.");
    return null;
  }

  const auth = await getFirebaseAuth();
  const db = getDb();

  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(user, { displayName });

  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    email,
    displayName,
    role: "user",
    createdAt: new Date().toISOString(),
  });

  return user;
}

/* ============================================================
   🔹 Login utilizator existent
   ============================================================ */
export async function loginUser(email: string, password: string) {
  if (typeof window === "undefined") {
    console.warn("loginUser() called on server — skipped.");
    return null;
  }

  const auth = await getFirebaseAuth();
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return user;
}

/* ============================================================
   🔹 Logout utilizator
   ============================================================ */
export async function logoutUser() {
  if (typeof window === "undefined") {
    console.warn("logoutUser() called on server — skipped.");
    return;
  }

  const auth = await getFirebaseAuth();
  await signOut(auth);
}

/* ============================================================
   🔹 Ascultă modificările de autentificare
   ============================================================ */
export async function listenToAuthChanges(callback: (user: User | null) => void) {
  if (typeof window === "undefined") {
    console.warn("listenToAuthChanges() called on server — skipped.");
    return () => {};
  }

  const auth = await getFirebaseAuth();
  return onAuthStateChanged(auth, callback);
}

/* ============================================================
   🔹 Obține rolul utilizatorului curent din Firestore
   ============================================================ */
export async function getUserRole(): Promise<string | null> {
  // 🚫 Previne execuția în SSR (la build pe Vercel)
  if (typeof window === "undefined") {
    console.warn("getUserRole() called on server — skipped.");
    return null;
  }

  const auth = await getFirebaseAuth();
  const db = getDb();

  if (!auth || !db) {
    console.warn("Firebase not initialized properly in getUserRole()");
    return null;
  }

  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();

      if (!user) {
        resolve(null);
        return;
      }

      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          resolve(data.role || "user");
        } else {
          // Creează userul în Firestore dacă nu există
          await setDoc(ref, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || "",
            role: "user",
            createdAt: new Date().toISOString(),
          });
          resolve("user");
        }
      } catch (error) {
        console.error("Eroare la obținerea rolului utilizatorului:", error);
        resolve(null);
      }
    });
  });
}
