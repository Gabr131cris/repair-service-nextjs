"use client";
//create user page for company_admin to manage company users
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { Loader2, UserPlus, Trash2, Pencil } from "lucide-react";
import { getUserRole } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function CompanyUsersPage() {
  const params = useParams();
  const companyId = params.id as string;

  const [company, setCompany] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter();

  // Form state (extended)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [position, setPosition] = useState("");

  const [userRole, setUserRole] = useState<"company_admin" | "company_user">(
    "company_user"
  );

  useEffect(() => {
    const load = async () => {
      const r = await getUserRole();
      setRole(r);

      if (r !== "company_admin") {
        setLoading(false);
        return;
      }

      const companyDoc = await getDoc(doc(db, "companies", companyId));
      setCompany({ id: companyDoc.id, ...companyDoc.data() });

      const snapshot = await getDocs(collection(db, "companyUsers"));
      const filtered = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((u) => u.companyId === companyId);

      setUsers(filtered);
      setLoading(false);
    };

    load();
  }, [companyId]);

  /* ----------------------------------
        CREATE USER — EXTENDED DATA
     ---------------------------------- */
  const createUser = async () => {
    if (!email || !password || !firstName || !lastName) {
      return alert("Toate câmpurile obligatorii trebuie completate.");
    }

    if (password.length < 6) return alert("Parola minim 6 caractere.");

    setCreating(true);

    try {
      const mainApp = (await import("@/lib/firebase")).appInstance;

      const { initializeApp, deleteApp } = await import("firebase/app");
      const { getAuth, createUserWithEmailAndPassword, signOut } = await import(
        "firebase/auth"
      );

      const secondaryApp = initializeApp(
        mainApp.options,
        "Secondary-" + Date.now()
      );
      const secondaryAuth = getAuth(secondaryApp);

      const userCred = await createUserWithEmailAndPassword(
        secondaryAuth,
        email,
        password
      );

      const uid = userCred.user.uid;

      // Save extended user data in Firestore
      await setDoc(doc(db, "companyUsers", uid), {
        companyId,
        email,
        firstName,
        lastName,
        phone,
        position,
        role: userRole,
        createdAt: serverTimestamp(),
      });

      await signOut(secondaryAuth);
      await deleteApp(secondaryApp);

      setUsers((prev) => [
        ...prev,
        {
          id: uid,
          email,
          firstName,
          lastName,
          phone,
          position,
          role: userRole,
          companyId,
        },
      ]);

      // Reset fields
      setEmail("");
      setPassword("");
      setFirstName("");
      setLastName("");
      setPhone("");
      setPosition("");

      alert("Utilizator creat cu succes!");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  };

  /* ----------------------------------
                DELETE USER
     ---------------------------------- */
  const deleteUser = async (id: string, email: string) => {
    if (!confirm(`Ștergi utilizatorul ${email}?`)) return;

    setDeleting(id);

    try {
      await deleteDoc(doc(db, "companyUsers", id));

      await fetch("/api/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: id }),
      });

      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error(err);
      alert("Eroare la ștergere.");
    } finally {
      setDeleting(null);
    }
  };

  if (loading)
    return (
      <div className="text-center mt-20 text-gray-500">
        Se încarcă datele...
      </div>
    );

  if (role !== "company_admin")
    return <p className="text-center mt-20 text-red-500">❌ Acces interzis.</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        👥 Utilizatori — <span className="text-blue-600">{company?.name}</span>
      </h1>

      {/* CREATE USER CARD */}
      <div className="p-5 bg-white shadow rounded-xl border mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <UserPlus size={20} className="text-blue-600" /> Creează utilizator nou
        </h2>

        <div className="space-y-4">

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-medium">Prenume</label>
              <input
                type="text"
                className="border px-3 py-2 rounded w-full mt-1"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>

            <div>
              <label className="font-medium">Nume</label>
              <input
                type="text"
                className="border px-3 py-2 rounded w-full mt-1"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="font-medium">Telefon</label>
            <input
              type="text"
              className="border px-3 py-2 rounded w-full mt-1"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="07xx xxx xxx"
            />
          </div>

          <div>
            <label className="font-medium">Funcție</label>
            <input
              type="text"
              className="border px-3 py-2 rounded w-full mt-1"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="Manager, Contabil..."
            />
          </div>

          <div>
            <label className="font-medium">Email</label>
            <input
              type="email"
              className="border px-3 py-2 rounded w-full mt-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@firma.ro"
            />
          </div>

          <div>
            <label className="font-medium">Parolă</label>
            <input
              type="password"
              className="border px-3 py-2 rounded w-full mt-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="font-medium">Rol</label>
            <select
              className="border px-3 py-2 rounded w-full mt-1"
              value={userRole}
              onChange={(e) =>
                setUserRole(e.target.value as "company_admin" | "company_user")
              }
            >
              <option value="company_user">User</option>
              <option value="company_admin">Admin</option>
            </select>
          </div>

          <button
            onClick={createUser}
            disabled={creating}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 w-full"
          >
            {creating && <Loader2 size={18} className="animate-spin" />}
            Creează
          </button>
        </div>
      </div>

      {/* USERS LIST */}
      <div className="p-5 bg-white shadow rounded-xl border">
        <h2 className="text-lg font-semibold mb-4">Utilizatori existenți</h2>

        {users.length === 0 ? (
          <p className="text-gray-500 italic">Niciun utilizator.</p>
        ) : (
          <div className="space-y-3">
            {users.map((u) => (
              <div
                key={u.id}
                className="border rounded-lg p-3 flex justify-between items-center hover:bg-gray-50 transition"
              >
                <div>
                  <p className="font-medium">{u.firstName} {u.lastName}</p>
                  <p className="text-sm text-gray-600">{u.email}</p>
                  <p className="text-sm text-gray-500">{u.position}</p>
                </div>

                <div className="flex gap-2">

                  <button
                    onClick={() =>
                      router.push(
                        `/dashboard/company/${companyId}/admin/users/${u.id}/edit`
                      )
                    }
                    className="px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md flex items-center gap-1 text-sm"
                  >
                    <Pencil size={16} />
                    Edit
                  </button>

                  <button
                    onClick={() => deleteUser(u.id, u.email)}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center gap-1 text-sm"
                    disabled={deleting === u.id}
                  >
                    {deleting === u.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
