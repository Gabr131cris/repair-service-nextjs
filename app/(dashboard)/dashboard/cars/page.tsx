"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getFirebaseAuth, getDb } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";
import { Trash2, Eye } from "lucide-react";
import { Car } from "@/lib/types";

/* 🧠 Helper pentru extragerea valorilor din schemaData */
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

export default function UserCarsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const auth = await getFirebaseAuth();
      const db = getDb();

      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          const q = query(collection(db, "cars"), where("ownerId", "==", user.uid));
          const snapshot = await getDocs(q);
          const data = snapshot.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() } as Car)
          );
          setCars(data);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    })();
  }, []);

  const handleDelete = async (carId: string) => {
    if (!confirm("Sigur vrei să ștergi acest anunț?")) return;

    try {
      setDeleting(carId);
      const res = await fetch(`/api/delete-car?id=${carId}`, { method: "DELETE" });
      const data = await res.json();

      if (!data.success) throw new Error(data.error || "Eroare la ștergere");

      setCars((prev) => prev.filter((c) => c.id !== carId));
      alert("✅ Anunț șters cu succes!");
    } catch (err) {
      console.error(err);
      alert("❌ Eroare la ștergere.");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <p className="text-center mt-6">Se încarcă...</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-gray-800">Anunțurile mele</h1>
        <Link
          href="/dashboard/cars/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
        >
          + Adaugă anunț
        </Link>
      </div>

      {cars.length === 0 ? (
        <p className="text-gray-500">Nu ai adăugat niciun anunț încă.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map((car) => {
            const mainImage =
              car?.schemaData?.Exterior?.images?.[0]?.src ||
              car?.images?.exterior?.[0] ||
              "/images/placeholder-car.jpg";

            const title =
              findValue(car.schemaData, "Title") ||
              findValue(car.schemaData, "Titlu") ||
              "Titlu necunoscut";

            const price =
              findValue(car.schemaData, "Price") ||
              findValue(car.schemaData, "Preț") ||
              undefined;

            const mileage =
              findValue(car.schemaData, "Mileage") ||
              findValue(car.schemaData, "Kilometraj") ||
              undefined;

            const year =
              findValue(car.schemaData, "Year") ||
              findValue(car.schemaData, "An fabricație") ||
              undefined;

            return (
              <div
                key={car.id}
                className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white hover:shadow-lg transition relative"
              >
                {/* Imagine mașină */}
                <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100">
                  <img
                    src={mainImage}
                    alt={title}
                    className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                  />
                  <span
                    className={`absolute top-2 left-2 px-2 py-1 text-xs font-bold text-white rounded ${
                      car.status === "available"
                        ? "bg-green-600"
                        : car.status === "pending"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  >
                    {car.status?.toUpperCase()}
                  </span>
                </div>

                {/* Conținut card */}
                <div className="p-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-semibold truncate mb-1">{title}</h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {year || "N/A"} • {mileage ? `${mileage} km` : "—"}
                    </p>
                    <p className="text-blue-600 font-bold text-lg mb-3">
                      {price ? `${price} €` : "—"}
                    </p>
                  </div>

                  <div className="flex justify-between items-center mt-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/listings/${car.id}`}
                        className="flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        <Eye size={16} /> Vezi
                      </Link>

                      <Link
                        href={`/dashboard/cars/edit/${car.id}`}
                        className="flex items-center gap-1 text-green-600 hover:underline"
                      >
                        ✏️ Editează
                      </Link>
                    </div>

                    <button
                      onClick={() => handleDelete(car.id)}
                      disabled={deleting === car.id}
                      className={`flex items-center gap-1 px-3 py-1 rounded text-sm transition ${
                        deleting === car.id
                          ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                          : "bg-red-100 text-red-600 hover:bg-red-200"
                      }`}
                    >
                      <Trash2 size={16} />
                      {deleting === car.id ? "Ștergere..." : "Șterge"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
