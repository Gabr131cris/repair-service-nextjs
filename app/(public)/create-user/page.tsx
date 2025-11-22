"use client";

import { useState, useEffect } from "react";
import { getFirebaseAuth, getDb, getFirebaseApp } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  getAuth,
  signOut,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { initializeApp, deleteApp } from "firebase/app";

export default function CreateUserPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("user");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [access, setAccess] = useState<boolean | null>(null);

  const router = useRouter();

  // 🔐 Verifică dacă userul e superadmin
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const auth = await getFirebaseAuth();
        const db = getDb();
        const user = auth.currentUser;
        if (!user) {
          router.push("/auth/login");
          return;
        }

        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().role === "superadmin") {
          setAccess(true);
        } else {
          router.push("/dashboard");
        }
      } catch {
        setAccess(false);
      }
    };
    checkAccess();
  }, [router]);

  if (access === null)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Checking access...
      </div>
    );

  if (!access)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 font-semibold">
        ❌ Access denied — Superadmins only
      </div>
    );

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("");
    setLoading(true);

    try {
      // 🔹 Salvează aplicația principală
      const mainApp = getFirebaseApp();
      const mainAuth = await getFirebaseAuth();
      const db = getDb();

      // 🔹 Creează un app secundar doar pentru crearea userului
      const secondaryApp = initializeApp(mainApp.options, "Secondary");
      const secondaryAuth = getAuth(secondaryApp);

      // 🔹 Creează userul fără să te delogheze
      const { user } = await createUserWithEmailAndPassword(
        secondaryAuth,
        email,
        password
      );
      await updateProfile(user, { displayName: name });

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: name,
        role,
        createdAt: serverTimestamp(),
      });

      setStatus(`✅ User "${name}" (${role}) created successfully!`);
      setEmail("");
      setPassword("");
      setName("");

      // 🔹 Deloghează doar instanța secundară, nu pe tine
      await signOut(secondaryAuth);
      await deleteApp(secondaryApp);
    } catch (err: any) {
      setStatus("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex justify-center items-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-6 rounded-xl w-[90%] max-w-md shadow-lg">
        <h1 className="text-2xl font-semibold mb-4 text-center">
          🧩 Create New User
        </h1>

        {status && (
          <p
            className={`text-sm mb-4 ${
              status.startsWith("✅") ? "text-green-400" : "text-red-400"
            }`}
          >
            {status}
          </p>
        )}

        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Full Name</label>
            <input
              type="text"
              className="w-full p-2 rounded-md bg-gray-700 border border-gray-600"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              className="w-full p-2 rounded-md bg-gray-700 border border-gray-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              className="w-full p-2 rounded-md bg-gray-700 border border-gray-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Role</label>
            <select
              className="w-full p-2 rounded-md bg-gray-700 border border-gray-600"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
          >
            {loading ? "Creating..." : "Create User"}
          </button>
        </form>
      </div>
    </main>
  );
}
