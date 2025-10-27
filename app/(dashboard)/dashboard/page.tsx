"use client";

import { useEffect, useState } from "react";
import { getFirebaseAuth } from "@/lib/firebase";
import LiveConsole from "@/components/dashboard/LiveConsole"; // noua componentă

export default function DashboardHome() {
  const [user, setUser] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);

  // ✅ log helper (poți apela oriunde)
  const log = (message: string, type: "info" | "success" | "error" = "info") => {
    const prefix =
      type === "success"
        ? "✅ [SUCCESS]"
        : type === "error"
        ? "❌ [ERROR]"
        : "ℹ️ [INFO]";
    setLogs((prev) => [...prev, `${prefix} ${message}`]);
  };

  useEffect(() => {
    const init = async () => {
      const auth = await getFirebaseAuth();
      setUser(auth?.currentUser);
      log("Firebase Auth initialized", "success");
    };
    init();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-4">Bun venit în Dashboard 👋</h1>
        {user ? (
          <p className="text-gray-700">
            Salut,{" "}
            <span className="font-semibold text-blue-600">
              {user.displayName || user.email}
            </span>
            !
          </p>
        ) : (
          <p className="text-gray-500">Se încarcă datele utilizatorului...</p>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600">
          Aici vei putea vedea un rezumat al anunțurilor tale și statistici.
        </p>
      </div>

      {/* 🔹 Consola live */}
      <LiveConsole logs={logs} onClear={() => setLogs([])} />
    </div>
  );
}
