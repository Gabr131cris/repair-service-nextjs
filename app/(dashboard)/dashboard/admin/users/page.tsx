"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getUserRole } from "@/lib/auth";
import Link from "next/link";
import { Trash2, UserPlus, Shield, Loader2 } from "lucide-react";

type User = {
  id: string;
  email: string;
  role: string;
  displayName?: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // 🔹 Încarcă utilizatorii doar dacă e superadmin
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const r = await getUserRole();
        setRole(r);

        if (r === "superadmin") {
          const snapshot = await getDocs(collection(db, "users"));
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as User[];
          setUsers(data);
        }
      } catch (err) {
        console.error("Error loading users:", err);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  // 🔹 Schimbă rolul
  const changeRole = async (id: string, newRole: string) => {
    setActionLoading(id + "-role");
    try {
      await updateDoc(doc(db, "users", id), { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      console.error("Error changing role:", err);
    } finally {
      setActionLoading(null);
    }
  };

  // 🔹 Șterge utilizator
  const deleteUser = async (id: string, email: string) => {
    if (!confirm(`Ștergi definitiv utilizatorul ${email}?`)) return;
    setActionLoading(id + "-delete");
    try {
      await deleteDoc(doc(db, "users", id));
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error("Error deleting user:", err);
    } finally {
      setActionLoading(null);
    }
  };

  // 🔒 Blocare pentru non-superadmin
  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        Se încarcă utilizatorii...
      </div>
    );

  if (role !== "superadmin")
    return (
      <p className="text-center text-red-600 font-semibold mt-20">
        ❌ Nu ai permisiunea să vezi această pagină.
      </p>
    );

  // ✅ Pagina de administrare useri
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="text-blue-600" size={24} />
          Gestionare Utilizatoriiiiii
        </h1>
        <Link
          href="/dashboard/superadmin/create-user"
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          <UserPlus size={18} /> Adaugă User
        </Link>
      </div>

      <div className="space-y-4">
        {users.length === 0 ? (
          <p className="text-gray-500 italic text-center">
            Nu există utilizatori în baza de date.
          </p>
        ) : (
          users.map((u) => (
            <div
              key={u.id}
              className="bg-white p-4 rounded-lg shadow flex justify-between items-center border border-gray-100 hover:shadow-md transition"
            >
              <div>
                <p className="font-semibold text-gray-800">
                  {u.displayName || "—"}{" "}
                  <span className="text-gray-500 text-sm">({u.email})</span>
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Rol actual:{" "}
                  <span className="font-medium text-blue-600">{u.role}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Butoane schimbare rol */}
                {["user", "admin", "superadmin"].map((r) => (
                  <button
                    key={r}
                    onClick={() => changeRole(u.id, r)}
                    disabled={actionLoading === u.id + "-role"}
                    className={`px-3 py-1 rounded text-sm border ${
                      u.role === r
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    {actionLoading === u.id + "-role" ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      r
                    )}
                  </button>
                ))}

                {/* Buton ștergere */}
                <button
                  onClick={() => deleteUser(u.id, u.email)}
                  disabled={actionLoading === u.id + "-delete"}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                >
                  {actionLoading === u.id + "-delete" ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
