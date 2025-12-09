"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";

import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    let unsubscribe = () => {};

    (async () => {
      const auth = await getFirebaseAuth();

      unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        if (!currentUser) {
          router.push("/auth/login");
        } else {
          setUser(currentUser);
        }
        setLoading(false);
      });
    })();

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="flex items-center gap-3 text-gray-600 text-lg">
          <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
          Se verifică sesiunea...
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* HEADER */}
        <header className="h-16 bg-white shadow-sm border-b flex items-center px-6 justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>

          <div className="flex items-center gap-3 text-gray-600 text-sm">
            <span>{user.email}</span>
            <span className="w-2 h-2 rounded-full bg-green-500" />
          </div>
        </header>

        {/* PAGE CONTENT  <div className="max-w-6xl mx-auto">{children}</div> */}
        <main className="flex-1 overflow-y-auto p-4">
    <div className="w-full">{children}</div>
</main>
      </div>
    </div>
  );
}
