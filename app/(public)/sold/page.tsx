"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import { getCars } from "@/lib/firestore";
import { Car } from "@/lib/types";
import CarCard from "@/components/car/CarCard";
import CarFilters from "@/components/filters/CarFilters";
import { getUserRole } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { useSearchParams } from "next/navigation";

/* ---------- helper ---------- */
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

/* ---------- wrapper ---------- */
export default function SoldPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SoldPage />
    </Suspense>
  );
}

/* ---------- component ---------- */
function SoldPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<any>({});
  const [page, setPage] = useState(1);
  const [role, setRole] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState("");
  const [content, setContent] = useState({
    heroImage: "/images/hero-sold.jpg",
    heroTitle: "Explore Our Classic Car Sold",
    heroText:
      "",
  });

  // 🔹 Citește parametrii din URL (ex: ?query=BMW)
  const searchParams = useSearchParams();

  useEffect(() => {
    const q = searchParams.get("query");
    if (q) {
      setFilters((prev: any) => ({ ...prev, query: q }));
    } else {
      setFilters({
        query: "",
        yearFrom: "",
        yearTo: "",
        make: "",
        model: "",
        minPrice: "",
        maxPrice: "",
        sort: "",
      });
    }
  }, [searchParams]);

  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    (async () => {
      try {
        const r = await getUserRole();
        setRole(r);

        const docRef = doc(db, "pages", "Sold");
        const snap = await getDoc(docRef, { source: "server" });
        if (snap.exists()) setContent(snap.data() as any);
        else await setDoc(docRef, content);

        const data = await getCars();
        setCars(data);
      } catch (e) {
        console.error("❌ Error loading data:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    try {
      const docRef = doc(db, "pages", "sold");
      await updateDoc(docRef, content);
      setIsEditing(false);
      setStatus("✅ Sold page updated successfully!");
      setTimeout(() => setStatus(""), 3000);
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  const handleImageUpload = async (file: File | null) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload-page", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (data.url) setContent((prev) => ({ ...prev, heroImage: data.url }));
  };

  /* ---------- Filtering logic ---------- */
  const filteredCars = cars
     .filter((car) => {
    // ✅ Afișează DOAR mașinile vândute
    if (!car.status || car.status.toLowerCase() !== "sold") return false;

      const title =
        findValue(car.schemaData, "Title") ||
        findValue(car.schemaData, "Titlu") ||
        "";
      const year =
        findValue(car.schemaData, "Year") ||
        findValue(car.schemaData, "An fabricație") ||
        "";
      const make =
        findValue(car.schemaData, "Make") ||
        findValue(car.schemaData, "Marcă") ||
        car.make ||
        "";
      const model =
        findValue(car.schemaData, "Model") ||
        findValue(car.schemaData, "Model") ||
        car.model ||
        "";
      const price =
        parseFloat(
          findValue(car.schemaData, "Price") ||
            findValue(car.schemaData, "Preț") ||
            car.price ||
            0
        ) || 0;

      if (
        filters.query &&
        !(
          title.toLowerCase().includes(filters.query.toLowerCase()) ||
          make.toLowerCase().includes(filters.query.toLowerCase()) ||
          model.toLowerCase().includes(filters.query.toLowerCase())
        )
      )
        return false;

      if (filters.yearFrom && parseInt(year) < parseInt(filters.yearFrom))
        return false;
      if (filters.yearTo && parseInt(year) > parseInt(filters.yearTo))
        return false;

      if (
        filters.make &&
        !make.toLowerCase().includes(filters.make.toLowerCase())
      )
        return false;

      if (
        filters.model &&
        !model.toLowerCase().includes(filters.model.toLowerCase())
      )
        return false;

      const min = parseFloat(filters.minPrice) || 0;
      const max = parseFloat(filters.maxPrice) || Infinity;
      if (price < min || price > max) return false;

      return true;
    })
    .sort((a, b) => {
      const priceA =
        parseFloat(
          findValue(a.schemaData, "Price") ||
            findValue(a.schemaData, "Preț") ||
            a.price ||
            0
        ) || 0;
      const priceB =
        parseFloat(
          findValue(b.schemaData, "Price") ||
            findValue(b.schemaData, "Preț") ||
            b.price ||
            0
        ) || 0;

      if (filters.sort === "price_low") return priceA - priceB;
      if (filters.sort === "price_high") return priceB - priceA;

      if (filters.sort === "newest") {
        const yearA =
          parseInt(
            findValue(a.schemaData, "Year") ||
              findValue(a.schemaData, "An fabricație") ||
              a.year ||
              0
          ) || 0;
        const yearB =
          parseInt(
            findValue(b.schemaData, "Year") ||
              findValue(b.schemaData, "An fabricație") ||
              b.year ||
              0
          ) || 0;
        return yearB - yearA;
      }

      if (filters.sort === "oldest") {
        const yearA =
          parseInt(
            findValue(a.schemaData, "Year") ||
              findValue(a.schemaData, "An fabricație") ||
              a.year ||
              0
          ) || 0;
        const yearB =
          parseInt(
            findValue(b.schemaData, "Year") ||
              findValue(b.schemaData, "An fabricație") ||
              b.year ||
              0
          ) || 0;
        return yearA - yearB;
      }

      return 0;
    });

  const totalPages = Math.ceil(filteredCars.length / ITEMS_PER_PAGE);
  const paginatedCars = filteredCars.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* HERO cover */}
      <section className="relative w-full h-[45vh] min-h-[420px]">
        <Image
          src={content.heroImage}
          alt="Explore Classic Listings"
          fill
          priority
          className="object-cover object-center"
        />
        {isEditing && (
          <input
            type="file"
            onChange={(e) => handleImageUpload(e.target.files?.[0] || null)}
            className="absolute bottom-2 left-2 bg-white/80 text-xs"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          {isEditing ? (
            <div className="text-center max-w-xl w-full">
              <input
                value={content.heroTitle}
                onChange={(e) =>
                  setContent({ ...content, heroTitle: e.target.value })
                }
                className="w-full border p-2 rounded text-3xl font-bold text-center"
              />
              <textarea
                value={content.heroText}
                onChange={(e) =>
                  setContent({ ...content, heroText: e.target.value })
                }
                className="mt-3 w-full border p-2 rounded text-gray-700 text-center"
              />
            </div>
          ) : (
            <>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 drop-shadow-md">
                {content.heroTitle}
              </h1>
              <p className="mt-3 text-gray-700 max-w-xl mx-auto">
                {content.heroText}
              </p>
            </>
          )}
        </div>
      </section>

      {/* FILTERS */}
      <section className="w-full bg-gray-900 py-4 px-4 md:px-8 -mt-6 relative z-10">
        <div className="max-w-[1600px] mx-auto">
          <CarFilters onFilter={setFilters} />
        </div>
      </section>

      {/* LISTINGS */}
      <section className="max-w-[1600px] mx-auto px-4 py-12">
        {loading ? (
          <p className="text-center text-gray-500">Loading listings...</p>
        ) : filteredCars.length === 0 ? (
          <p className="text-center text-gray-500">
            No cars match your search.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {paginatedCars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center mt-10 gap-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                      page === i + 1
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {role === "superadmin" && (
        <div className="text-center my-8">
          <button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            className={`px-6 py-2 rounded-lg text-sm font-semibold ${
              isEditing
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-gray-700 hover:bg-gray-600 text-white"
            }`}
          >
            {isEditing ? "💾 Save Changes" : "✏️ Edit Page"}
          </button>
          {status && (
            <p className="mt-3 text-green-600 text-sm font-medium">{status}</p>
          )}
        </div>
      )}
    </main>
  );
}
