"use client"; // 🔹 trebuie să fie PRIMA linie

import { useState } from "react";
import { getFirebaseAuth, getDb } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function CreateUserPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("user");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("");
    setLoading(true);

    try {
      // 🟢 Inițializează Firebase local (browser)
      const auth = await getFirebaseAuth();
      const db = getDb();

      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, { displayName: name });

      // Scriem userul în Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: name,
        role,
        createdAt: serverTimestamp(),
      });

      setStatus(`✅ User "${name}" (${role}) creat cu succes!`);
      setEmail("");
      setPassword("");
      setName("");
    } catch (err: any) {
      setStatus("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex justify-center items-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-6 rounded-xl w-[90%] max-w-md shadow-lg">
        <h1 className="text-2xl font-semibold mb-4 text-center">🧩 Create Test User</h1>
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
            <label className="block text-sm font-medium">Nume</label>
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
            <label className="block text-sm font-medium">Parolă</label>
            <input
              type="password"
              className="w-full p-2 rounded-md bg-gray-700 border border-gray-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Rol</label>
            <select
              className="w-full p-2 rounded-md bg-gray-700 border border-gray-600"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="user">User normal</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
          >
            {loading ? "Se creează..." : "Creează user"}
          </button>
        </form>
      </div>
    </main>
  );
}
