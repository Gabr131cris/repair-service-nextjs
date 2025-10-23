"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
//import { db } from "@/lib/firebase";
import { getFirebaseAuth, getDb } from "@/lib/firebase";
import { getUserRole } from "@/lib/auth";
import { Car } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { Eye } from "lucide-react";

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

/* 🖼️ Helper pentru imaginea principală */
function getFeaturedImage(car: any): string {
  if (!car?.schemaData) return "/images/placeholder-car.jpg";

  // 1️⃣ Exterior
  const exterior = car.schemaData?.Exterior?.images?.[0]?.src;
  if (exterior) return exterior;

  // 2️⃣ Caută prima imagine din oricare secțiune
  for (const value of Object.values(car.schemaData)) {
    if ((value as any)?.images?.length) {
      return (value as any).images[0].src;
    }
  }

  // 3️⃣ Format vechi
  const legacy = car?.images?.exterior?.[0];
  if (legacy) return legacy;

  // 4️⃣ Placeholder
  return "/images/placeholder-car.jpg";
}

export default function AdminCarsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const [db, setDb] = useState<any>(null);
  const [auth, setAuth] = useState<any>(null);

  // 🔹 Inițializează Firebase în browser
  useEffect(() => {
    (async () => {
      const authInstance = await getFirebaseAuth();
      const dbInstance = getDb();
      setAuth(authInstance);
      setDb(dbInstance);
    })();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      const r = await getUserRole();
      setRole(r);

      if (r === "admin" || r === "superadmin") {
        const snapshot = await getDocs(collection(db, "cars"));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Car[];
        setCars(data);
      }

      setLoading(false);
    };
    loadData();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      setUpdating(id);
      await updateDoc(doc(db, "cars", id), { status: newStatus });
      setCars((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
      );
    } finally {
      setUpdating(null);
    }
  };

  if (loading)
    return (
      <p className="text-center mt-10 text-gray-400">Se încarcă anunțurile...</p>
    );

  if (role !== "admin" && role !== "superadmin")
    return (
      <p className="text-center text-red-600 font-medium mt-6">
        Nu ai permisiunea să vezi această pagină.
      </p>
    );

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-900">
        Aprobare Anunțuri
      </h1>

      {cars.length === 0 ? (
        <p className="text-gray-500 text-center">Nu există anunțuri de aprobat.</p>
      ) : (
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
                      ? `${price.toLocaleString?.()} €`
                      : "Preț indisponibil"}
                  </p>
                  <p
                    className={`text-xs mt-1 font-semibold uppercase ${
                      car.status === "pending"
                        ? "text-yellow-600"
                        : car.status === "available"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
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

                  <button
                    onClick={() => updateStatus(car.id!, "available")}
                    disabled={updating === car.id}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:bg-gray-300"
                  >
                    ✅ Aproba
                  </button>

                  <button
                    onClick={() => updateStatus(car.id!, "rejected")}
                    disabled={updating === car.id}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:bg-gray-300"
                  >
                    ❌ Respinge
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
