"use client";

import { useEffect, useState } from "react";
import { getCars } from "@/lib/firestore";
import Link from "next/link";
import Image from "next/image";
import { Car } from "@/lib/types";
import CarCard from "@/components/car/CarCard";

import CarFilters from "@/components/filters/CarFilters";

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

/* ---------- component ---------- */
export default function ListingsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<any>({});
  const [page, setPage] = useState(1);

  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    (async () => {
      try {
        const data = await getCars();
        setCars(data);
      } catch (e) {
        console.error("Error loading cars:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* filtering logic */
  const filteredCars = cars.filter((car) => {
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
      "";

    if (
      filters.query &&
      !title.toLowerCase().includes(filters.query.toLowerCase())
    )
      return false;
    if (filters.year && parseInt(year) < parseInt(filters.year)) return false;
    if (filters.make && make !== filters.make) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredCars.length / ITEMS_PER_PAGE);
  const paginatedCars = filteredCars.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  /* ---------- UI ---------- */
  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* HERO cover */}
      <section className="relative w-full h-[45vh] min-h-[420px]">
        <Image
          src="/images/hero-listings.jpg"
          alt="Explore Classic Listings"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 drop-shadow-md">
            Explore Our Classic Car Listings
          </h1>
          <p className="mt-3 text-gray-700 max-w-xl mx-auto">
            Hand-picked vintage icons — browse, compare and find your next
            classic.
          </p>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginatedCars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>

            {/* PAGINATION */}
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
    </main>
  );
}
