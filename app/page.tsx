"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getCars } from "@/lib/firestore";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { getUserRole } from "@/lib/auth";
import CarCard from "@/components/car/CarCard";
import type { Car } from "@/lib/types";
import { Gauge, ShieldCheck, Wallet, Truck } from "lucide-react";

/* ---------- helpers ---------- */
function findValue(schemaData: any, key: string) {
  if (!schemaData || typeof schemaData !== "object") return undefined;
  const needle = key.trim().toLowerCase();
  for (const section of Object.values(schemaData)) {
    if (section && typeof section === "object") {
      for (const [k, v] of Object.entries(section as Record<string, any>)) {
        if (k.trim().toLowerCase() === needle) return v;
      }
    }
  }
  return undefined;
}

function getFeaturedImage(car: any): string {
  const ext = car?.schemaData?.Exterior?.images?.[0]?.src;
  if (ext) return ext;

  if (car?.schemaData) {
    for (const section of Object.values(car.schemaData)) {
      const img = (section as any)?.images?.[0]?.src;
      if (img) return img;
    }
  }

  const legacy = car?.images?.exterior?.[0];
  return legacy || "/images/placeholder-car.jpg";
}

/* ---------- listing card ---------- */
function ListingCard({ car }: { car: Car }) {
  const title =
    findValue(car.schemaData, "Title") ||
    findValue(car.schemaData, "Titlu") ||
    "Untitled";

  const year =
    findValue(car.schemaData, "Year") ||
    findValue(car.schemaData, "An fabricație") ||
    "";

  const mileage =
    findValue(car.schemaData, "Mileage") ||
    findValue(car.schemaData, "Kilometraj") ||
    "";

  const price =
    findValue(car.schemaData, "Price") ||
    findValue(car.schemaData, "Preț") ||
    car.price;

  const img = getFeaturedImage(car);

  return (
    <Link
      href={`/listings/${car.id}`}
      className="group block rounded-xl border border-gray-200 bg-white hover:shadow-lg transition overflow-hidden"
    >
      <div className="relative h-48 w-full">
        <Image
          src={img}
          alt={typeof title === "string" ? title : "Car"}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        {car.status && (
          <span
            className={`absolute left-3 top-3 rounded px-2 py-1 text-[11px] font-semibold text-white ${
              car.status === "available"
                ? "bg-green-600"
                : car.status === "pending"
                ? "bg-yellow-500"
                : "bg-red-600"
            }`}
          >
            {car.status.toUpperCase()}
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="line-clamp-1 text-lg font-semibold text-gray-900">
          {typeof title === "string" ? title : "Listing"}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {year || "—"} • {mileage ? `${mileage} mileage` : "—"}
        </p>
        <p className="mt-2 text-xl font-bold text-blue-600">
          {price ? `${Number(price).toLocaleString()} $` : "—"}
        </p>
      </div>
    </Link>
  );
}

/* ---------- main page ---------- */
export default function HomePage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState("");

  const [content, setContent] = useState({
    heroSubtitle: "AMERICAN VINTAGE & MUSCLE",
    heroTitle: "Buy • Consign iconic cars from the golden era",
    heroText:
      "Curated classics, muscle legends and vintage cruisers — inspected, verified, and ready for the open road.",
    heroImage: "/images/hero-vintage.jpg",
    cta1: "Browse All Listings",
    cta2: "Talk to Us",
    bannerTitle: "Got a classic to consign?",
    bannerText: "We make it easy—photography, paperwork, nationwide buyers.",
  });

  // 🔹 Filtrăm mașinile — excludem cele cu status "sold", "pending" sau "rejected"
  const visibleCars = cars.filter(
    (car) =>
      car.status &&
      !["sold", "pending", "rejected","draft"].includes(car.status.toLowerCase())
  );

  /* ---------- Load data ---------- */
  useEffect(() => {
    (async () => {
      const r = await getUserRole();
      setRole(r);

      const docRef = doc(db, "pages", "home");
      const snap = await getDoc(docRef);
      if (snap.exists()) setContent(snap.data() as any);
      else await setDoc(docRef, content);

      try {
        const data = await getCars();
        setCars(data);
      } catch (e) {
        console.error("Failed to load cars:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ---------- Save changes ---------- */
  const handleSave = async () => {
    try {
      const docRef = doc(db, "pages", "home");
      await updateDoc(docRef, content);
      setIsEditing(false);
      setStatus("✅ Homepage updated successfully!");
      setTimeout(() => setStatus(""), 3000);
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  /* ---------- Upload image ---------- */
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

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* HERO */}
      <section className="relative">
        <div className="relative h-[54vh] min-h-[420px] w-full overflow-hidden">
          <Image
            src={content.heroImage}
            alt="Vintage American Classics"
            fill
            priority
            className="object-cover"
          />
          {isEditing && (
            <input
              type="file"
              onChange={(e) => handleImageUpload(e.target.files?.[0] || null)}
              className="absolute bottom-2 left-2 bg-white/80 text-xs"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />
        </div>

        <div className="container mx-auto -mt-28 px-4">
          <div className="mx-auto max-w-5xl rounded-2xl border border-gray-200 bg-white/90 backdrop-blur p-8 shadow-sm">
            {isEditing ? (
              <>
                <input
                  value={content.heroSubtitle}
                  onChange={(e) =>
                    setContent({ ...content, heroSubtitle: e.target.value })
                  }
                  className="text-xs tracking-[0.2em] text-gray-500 w-full mb-2 border-b"
                />
                <textarea
                  value={content.heroTitle}
                  onChange={(e) =>
                    setContent({ ...content, heroTitle: e.target.value })
                  }
                  className="w-full text-3xl font-extrabold leading-tight border p-2 rounded"
                />
                <textarea
                  value={content.heroText}
                  onChange={(e) =>
                    setContent({ ...content, heroText: e.target.value })
                  }
                  className="w-full mt-2 text-gray-700 border p-2 rounded"
                />
              </>
            ) : (
              <>
                <p className="text-xs tracking-[0.2em] text-gray-500">
                  {content.heroSubtitle}
                </p>
                <h1 className="mt-2 text-3xl font-extrabold leading-tight md:text-4xl">
                  {content.heroTitle}
                </h1>
                <p className="mt-3 max-w-3xl text-gray-600">
                  {content.heroText}
                </p>
              </>
            )}

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/listings"
                className="rounded-full bg-blue-600 px-5 py-2.5 text-white font-semibold hover:bg-blue-700 transition"
              >
                {content.cta1}
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-gray-300 px-5 py-2.5 font-semibold text-gray-800 hover:border-blue-500 hover:text-blue-600 transition"
              >
                {content.cta2}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="container mx-auto px-4">
        <div className="mx-auto mt-12 grid gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:grid-cols-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-6 w-6 text-blue-600" />
            <div>
              <p className="font-semibold">Verified Listings</p>
              <p className="text-sm text-gray-600">
                Quality cars, vetted by us
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Gauge className="mt-0.5 h-6 w-6 text-blue-600" />
            <div>
              <p className="font-semibold">Straightforward Process</p>
              <p className="text-sm text-gray-600">No hidden headaches</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Wallet className="mt-0.5 h-6 w-6 text-blue-600" />
            <div>
              <p className="font-semibold">Fair Pricing</p>
              <p className="text-sm text-gray-600">Market-aligned values</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Truck className="mt-0.5 h-6 w-6 text-blue-600" />
            <div>
              <p className="font-semibold">Nationwide Delivery</p>
              <p className="text-sm text-gray-600">We can ship your classic</p>
            </div>
          </div>
        </div>
      </section>

      {/* LISTINGS */}
      <section className="container mx-auto px-4">
        <div className="mt-12 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold">Fresh in the shop</h2>
            <p className="text-sm text-gray-600">
              Hand-picked icons from coast to coast
            </p>
          </div>
          <Link
            href="/listings"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-xl border border-gray-200"
              >
                <div className="h-48 w-full bg-gray-100" />
                <div className="space-y-2 p-4">
                  <div className="h-4 w-2/3 bg-gray-100" />
                  <div className="h-3 w-1/2 bg-gray-100" />
                  <div className="h-5 w-1/3 bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleCars.slice(0, 4).map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4">
        <div className="my-14 rounded-2xl border border-gray-200 bg-gradient-to-r from-blue-50 to-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              {isEditing ? (
                <>
                  <input
                    value={content.bannerTitle}
                    onChange={(e) =>
                      setContent({ ...content, bannerTitle: e.target.value })
                    }
                    className="w-full border p-2 rounded font-bold text-lg mb-2"
                  />
                  <textarea
                    value={content.bannerText}
                    onChange={(e) =>
                      setContent({ ...content, bannerText: e.target.value })
                    }
                    className="w-full border p-2 rounded text-gray-700"
                  />
                </>
              ) : (
                <>
                  <h3 className="text-xl font-bold">{content.bannerTitle}</h3>
                  <p className="text-gray-600">{content.bannerText}</p>
                </>
              )}
            </div>
            <div className="flex gap-3">
              
              <Link
                href="/contact"
                className="rounded-full bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700 transition"
              >
                Talk to Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ADMIN CONTROLS */}
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
