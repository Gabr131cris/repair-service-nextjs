"use client";

import { useEffect, useState } from "react";
import { getFirebaseAuth } from "@/lib/firebase";

const auth = await getFirebaseAuth();


export default function DashboardHome() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(auth.currentUser);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Bun venit în Dashboard 👋</h1>
      {user ? (
        <p className="text-gray-700">
          Salut, <span className="font-semibold text-blue-600">
            {user.displayName || user.email}
          </span>!
        </p>
      ) : (
        <p className="text-gray-500">Se încarcă datele utilizatorului...</p>
      )}

      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <p>Aici vei putea vedea un rezumat al anunțurilor tale și statistici.</p>
      </div>
    </div>
  );
}
