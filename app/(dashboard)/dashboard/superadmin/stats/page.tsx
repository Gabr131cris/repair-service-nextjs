"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { getUserRole } from "@/lib/auth";

export default function StatsPage() {
  const [data, setData] = useState<any[]>([]);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      const r = await getUserRole();
      setRole(r);

      if (r === "superadmin") {
        const snapshot = await getDocs(collection(db, "cars"));
        const all = snapshot.docs.map((doc) => doc.data());
        const grouped = all.reduce(
          (acc: any, car: any) => {
            acc[car.status] = (acc[car.status] || 0) + 1;
            return acc;
          },
          {}
        );

        const formatted = Object.entries(grouped).map(([status, count]) => ({
          status,
          count,
        }));
        setData(formatted);
      }
    };

    loadStats();
  }, []);

  if (role !== "superadmin") return <p>Acces interzis.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Statistici Platformă</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="status" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
