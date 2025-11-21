"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";

import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
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
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        Checking session...
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-900">
      <Sidebar />
      <main className="flex-1 bg-gray-100 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
