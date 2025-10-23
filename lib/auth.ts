// lib/auth.ts
import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

// ✅ Înregistrare user nou + creare document în Firestore
export async function registerUser(email: string, password: string, displayName: string) {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);

  // Actualizează profilul Firebase Auth (nume afisat)
  await updateProfile(user, { displayName });

  // Creează documentul user în Firestore cu rol implicit "user"
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    email,
    displayName,
    role: "user",
    createdAt: new Date().toISOString(),
  });

  return user;
}

// ✅ Login utilizator existent
export async function loginUser(email: string, password: string) {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return user;
}

// ✅ Logout
export async function logoutUser() {
  await signOut(auth);
}

// ✅ Ascultă modificările de autentificare (ex: în Navbar)
export function listenToAuthChanges(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// ✅ Obține rolul utilizatorului curent din Firestore (cu așteptare corectă)
export async function getUserRole(): Promise<string | null> {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe(); // prevenim ascultarea infinită

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
          // Dacă nu există documentul, îl creăm automat
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
