"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getUserRole } from "@/lib/auth";

type User = {
  id: string;
  email: string;
  role: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
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
    };

    loadUsers();
  }, []);

  const changeRole = async (id: string, newRole: string) => {
    await updateDoc(doc(db, "users", id), { role: newRole });
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role: newRole } : u))
    );
  };

  if (role !== "superadmin")
    return <p className="text-red-600">Nu ai permisiunea să vezi această pagină.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Gestionare Utilizatori</h1>
      <div className="space-y-4">
        {users.map((u) => (
          <div
            key={u.id}
            className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{u.email}</p>
              <p className="text-sm text-gray-500">{u.role}</p>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => changeRole(u.id, "user")}
                className="bg-gray-300 px-3 py-1 rounded"
              >
                User
              </button>
              <button
                onClick={() => changeRole(u.id, "admin")}
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                Admin
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
