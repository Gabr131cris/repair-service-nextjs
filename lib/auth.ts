
//lib/auth.ts
import { getFirebaseAuth, getDb } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
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

export async function resetUserPassword(email: string) {
  if (typeof window === "undefined") return;
  const auth = await getFirebaseAuth();
  if (!auth) throw new Error("Serviciul de autentificare nu este disponibil.");
  await sendPasswordResetEmail(auth, email);
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
   🔹 Obține rolul utilizatorului curent din Firestore (FIXED)
   ============================================================ */
export async function getUserRole(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  const auth = await getFirebaseAuth();
  const db = getDb();

  if (!auth || !db) return null;

  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();

      if (!user) {
        resolve(null);
        return;
      }

      const uid = user.uid;

      try {
        // 1️⃣ Verificăm colecția USERS (global users)
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          resolve(userSnap.data().role || "user");
          return;
        }

        // 2️⃣ Verificăm colecția COMPANY USERS
        const companyRef = doc(db, "companyUsers", uid);
        const companySnap = await getDoc(companyRef);

        if (companySnap.exists()) {
          resolve(companySnap.data().role || "company_user");
          return;
        }

        // 3️⃣ Nu există în nicio colecție → NU îl creăm în `users`
        resolve(null);
      } catch (err) {
        console.error("Eroare la getUserRole:", err);
        resolve(null);
      }
    });
  });
}

