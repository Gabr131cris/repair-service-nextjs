"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { Loader2, ArrowLeft } from "lucide-react";
import { getUserRole } from "@/lib/auth";

export default function EditCompanyUserPage() {
  const params = useParams();
  const router = useRouter();

  const companyId = params.id as string;
  const userId = params.userId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  const [role, setRole] = useState<string | null>(null);

  const [userData, setUserData] = useState<any>(null);

  // Editable fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [position, setPosition] = useState("");
  const [email, setEmail] = useState("");
  const [userRole, setUserRole] = useState<"company_admin" | "company_user">(
    "company_user"
  );

  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    const load = async () => {
      const r = await getUserRole();
      setRole(r);

      if (r !== "company_admin") {
        setLoading(false);
        return;
      }

      // Load user Firestore data
      const snap = await getDoc(doc(db, "companyUsers", userId));
      if (snap.exists()) {
        const data = snap.data();
        setUserData(data);

        setFirstName(data.firstName || "");
        setLastName(data.lastName || "");
        setPhone(data.phone || "");
        setPosition(data.position || "");
        setEmail(data.email || "");
        setUserRole(data.role || "company_user");
      }

      setLoading(false);
    };

    load();
  }, [userId]);

  /* ---------------------------------------
        UPDATE ALL USER FIELDS
  ---------------------------------------- */
  const saveChanges = async () => {
    if (!email) return alert("Email invalid!");

    setSaving(true);

    try {
      await updateDoc(doc(db, "companyUsers", userId), {
        firstName,
        lastName,
        phone,
        position,
        email,
        role: userRole,
        updatedAt: serverTimestamp(),
      });

      alert("Modificările au fost salvate!");
      router.back();
    } catch (err: any) {
      alert("Eroare: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  /* ---------------------------------------
          RESET PASSWORD (SAFE)
  ---------------------------------------- */
  const resetPassword = async () => {
    if (newPassword.length < 6)
      return alert("Parola trebuie să aibă minim 6 caractere.");

    setResetting(true);

    try {
      const mainApp = (await import("@/lib/firebase")).appInstance;

      const { initializeApp, deleteApp } = await import("firebase/app");
      const { getAuth, updatePassword, signInWithEmailAndPassword, signOut } =
        await import("firebase/auth");

      const secondaryApp = initializeApp(
        mainApp.options,
        "SecondaryReset-" + Date.now()
      );
      const secondaryAuth = getAuth(secondaryApp);

      // ❗ Ai nevoie de parola veche – altfel trebuie resetare prin email.
      await signInWithEmailAndPassword(
        secondaryAuth,
        email,
        userData.tempPassword || "123456"
      );

      await updatePassword(secondaryAuth.currentUser!, newPassword);

      await signOut(secondaryAuth);
      await deleteApp(secondaryApp);

      alert("Parola a fost resetată cu succes!");
      setNewPassword("");
    } catch (err: any) {
      alert("Eroare resetare parolă: " + err.message);
    } finally {
      setResetting(false);
    }
  };

  if (loading)
    return (
      <div className="text-center mt-20 text-gray-500">
        Se încarcă datele...
      </div>
    );

  if (role !== "company_admin")
    return (
      <p className="text-center mt-20 text-red-500">❌ Acces interzis.</p>
    );

  return (
    <div className="p-6 max-w-xl mx-auto">

      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-700 hover:text-black mb-6"
      >
        <ArrowLeft size={18} /> Înapoi
      </button>

      <h1 className="text-2xl font-bold mb-6">Editare utilizator</h1>

      <div className="bg-white shadow border rounded-xl p-5 space-y-4">

        {/* FIRST NAME */}
        <div>
          <label className="font-medium">Prenume</label>
          <input
            type="text"
            className="border p-2 rounded w-full mt-1"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>

        {/* LAST NAME */}
        <div>
          <label className="font-medium">Nume</label>
          <input
            type="text"
            className="border p-2 rounded w-full mt-1"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>

        {/* PHONE */}
        <div>
          <label className="font-medium">Telefon</label>
          <input
            type="text"
            className="border p-2 rounded w-full mt-1"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="07xx xxx xxx"
          />
        </div>

        {/* POSITION */}
        <div>
          <label className="font-medium">Funcție</label>
          <input
            type="text"
            className="border p-2 rounded w-full mt-1"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="Manager, Contabil..."
          />
        </div>

        {/* EMAIL */}
        <div>
          <label className="font-medium">Email</label>
          <input
            type="email"
            className="border p-2 rounded w-full mt-1"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* ROLE */}
        <div>
          <label className="font-medium">Rol</label>
          <select
            className="border p-2 rounded w-full mt-1"
            value={userRole}
            onChange={(e) =>
              setUserRole(e.target.value as "company_admin" | "company_user")
            }
          >
            <option value="company_user">User</option>
            <option value="company_admin">Admin</option>
          </select>
        </div>

        {/* SAVE BUTTON */}
        <button
          onClick={saveChanges}
          disabled={saving}
          className="bg-blue-600 text-white w-full py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700"
        >
          {saving && <Loader2 className="animate-spin" size={18} />}
          Salvează modificările
        </button>
      </div>

      {/* RESET PASSWORD */}
      <div className="bg-white shadow border rounded-xl p-5 mt-6 space-y-4">
        <h2 className="font-semibold text-lg">Resetare parolă</h2>

        <input
          type="password"
          placeholder="Parola nouă"
          className="border p-2 rounded w-full"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <button
          onClick={resetPassword}
          disabled={resetting}
          className="bg-red-600 text-white w-full py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-red-700"
        >
          {resetting && <Loader2 className="animate-spin" size={18} />}
          Resetează parola
        </button>
      </div>
    </div>
  );
}
