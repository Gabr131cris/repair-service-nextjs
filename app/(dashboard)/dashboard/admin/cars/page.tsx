"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, setDoc } from "firebase/firestore";
import { getFirebaseAuth, getDb } from "@/lib/firebase";
import { getUserRole } from "@/lib/auth";
import { Car } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { Eye, PlusCircle } from "lucide-react";

/* 🧠 Helper universal */
function findValue(schemaData: any, key: string) {
  if (!schemaData || typeof schemaData !== "object") return undefined;
  const normalized = key.trim().toLowerCase();
  for (const [section, sectionData] of Object.entries(schemaData)) {
    if (typeof sectionData === "object" && sectionData !== null) {
      for (const [k, v] of Object.entries(sectionData)) {
        if (k.trim().toLowerCase() === normalized) return v;
      }
    }
  }
  return undefined;
}

/* 🖼️ Imagine principală */
function getFeaturedImage(car: any): string {
  if (!car?.schemaData) return "/images/placeholder-car.jpg";
  const exterior = car.schemaData?.Exterior?.images?.[0]?.src;
  if (exterior) return exterior;
  for (const value of Object.values(car.schemaData)) {
    if ((value as any)?.images?.length) return (value as any).images[0].src;
  }
  return "/images/placeholder-car.jpg";
}

export default function AdminCarsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [statuses, setStatuses] = useState<{ name: string; color: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState({ name: "", color: "#4287f5" });

  const [db, setDb] = useState<any>(null);

  // 🔹 Inițializează Firebase
  useEffect(() => {
    (async () => {
      const dbInstance = getDb();
      setDb(dbInstance);
    })();
  }, []);

  // 🔹 Încarcă datele (statusuri + anunțuri)
  useEffect(() => {
    if (!db) return;

    const loadData = async () => {
      try {
        const r = await getUserRole();
        setRole(r);

        if (r === "admin" || r === "superadmin") {
          const snapshot = await getDocs(collection(db, "cars"));
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Car[];
          setCars(data);

          // 🔹 Încarcă statusurile custom din Firestore
          const statusSnap = await getDocs(collection(db, "settings", "car_statuses", "list"));
          const statusData = statusSnap.docs.map((doc) => doc.data()) as { name: string; color: string }[];
          setStatuses(statusData.length ? statusData : [
            { name: "pending", color: "#eab308" },
            { name: "available", color: "#22c55e" },
            { name: "rejected", color: "#ef4444" },
            { name: "sold", color: "#6b7280" },
            { name: "reserved", color: "#3b82f6" },
            { name: "no reserve", color: "#8b5cf6" },
          ]);
        }
      } catch (error) {
        console.error("Eroare la încărcare:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [db]);

  // 🔹 Actualizare status mașină
  const updateStatus = async (id: string, newStatus: string) => {
    if (!db) return alert("Baza de date nu e gata.");
    try {
      setUpdating(id);
      await updateDoc(doc(db, "cars", id), { status: newStatus });
      setCars((prev) => prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c)));
    } finally {
      setUpdating(null);
    }
  };

  // 🔹 Adaugă un nou status (doar superadmin)
  const addNewStatus = async () => {
    if (!newStatus.name.trim()) return alert("Introdu un nume pentru status.");
    const id = newStatus.name.toLowerCase().replace(/\s+/g, "-");

    try {
      await setDoc(doc(db, "settings", "car_statuses", "list", id), {
        name: newStatus.name,
        color: newStatus.color,
      });
      setStatuses((prev) => [...prev, { ...newStatus }]);
      setNewStatus({ name: "", color: "#4287f5" });
      alert("✅ Status adăugat!");
    } catch (err) {
      console.error("Eroare la adăugare status:", err);
      alert("❌ Eroare la adăugare status");
    }
  };

  if (loading)
    return <p className="text-center mt-10 text-gray-400">Se încarcă...</p>;

  if (role !== "admin" && role !== "superadmin")
    return (
      <p className="text-center text-red-600 font-medium mt-6">
        Nu ai permisiunea să vezi această pagină.
      </p>
    );

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold text-center text-gray-900">
        Gestionare Anunțuri
      </h1>

      {/* 🎨 Status Manager */}
      {role === "superadmin" && (
        <div className="bg-white p-6 rounded-xl shadow-md border space-y-4">
          <h2 className="text-xl font-semibold">Statusuri disponibile</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {statuses.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-2 border p-2 rounded-lg"
              >
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: s.color }}
                ></div>
                <span className="text-sm font-medium">{s.name}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-center mt-4">
            <input
              type="text"
              placeholder="Nume status (ex: 'Sold')"
              value={newStatus.name}
              onChange={(e) =>
                setNewStatus({ ...newStatus, name: e.target.value })
              }
              className="border p-2 rounded w-full sm:w-1/3"
            />
            <input
              type="color"
              value={newStatus.color}
              onChange={(e) =>
                setNewStatus({ ...newStatus, color: e.target.value })
              }
              className="w-12 h-10 cursor-pointer"
            />
            <button
              onClick={addNewStatus}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              <PlusCircle size={16} /> Adaugă status
            </button>
          </div>
        </div>
      )}

      {/* 🚗 Lista mașinilor */}
      <div className="space-y-5">
        {cars.map((car) => {
          const title =
            findValue(car.schemaData, "Title") ||
            findValue(car.schemaData, "Titlu") ||
            "Titlu necunoscut";
          const price =
            findValue(car.schemaData, "Price") ||
            findValue(car.schemaData, "Preț") ||
            "—";
          const year =
            findValue(car.schemaData, "Year") ||
            findValue(car.schemaData, "An fabricație") ||
            "—";
          const mainImage = getFeaturedImage(car);

          const statusColor =
            statuses.find((s) => s.name === car.status)?.color || "#999";

          return (
            <div
              key={car.id}
              className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition flex flex-col sm:flex-row items-center gap-5 p-4"
            >
              {/* Imagine */}
              <div className="relative w-full sm:w-48 h-32 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                <Image
                  src={mainImage}
                  alt={title}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 w-full">
                <h2 className="text-lg font-semibold text-gray-900 truncate">
                  {title}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {year} •{" "}
                  {price !== "—"
                    ? `${price.toLocaleString?.()} $`
                    : "Preț indisponibil"}
                </p>
                <p
                  className="text-xs mt-1 font-semibold uppercase"
                  style={{ color: statusColor }}
                >
                  {car.status}
                </p>
              </div>

              {/* Butoane */}
              <div className="flex items-center gap-2">
                <Link
                  href={`/listings/${car.id}`}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                >
                  <Eye size={16} /> Vezi
                </Link>

                {/* Select Status */}
                <select
                  onChange={(e) => updateStatus(car.id!, e.target.value)}
                  value={car.status || ""}
                  className="border border-gray-300 rounded-lg p-1 text-sm"
                >
                  {statuses.map((s) => (
                    <option key={s.name} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
