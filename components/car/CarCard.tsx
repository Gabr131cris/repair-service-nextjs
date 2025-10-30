"use client";

import Link from "next/link";
import Image from "next/image";
import { Car } from "@/lib/types";

/* 🧠 Helper universal pentru citirea valorilor din schemaData */
function findValue(schemaData: any, key: string) {
  if (!schemaData || typeof schemaData !== "object") return undefined;
  const normalizedKey = key.trim().toLowerCase();

  for (const [sectionName, sectionValue] of Object.entries(schemaData)) {
    if (typeof sectionValue === "object" && sectionValue !== null) {
      for (const [k, v] of Object.entries(sectionValue)) {
        if (k.trim().toLowerCase() === normalizedKey) return v;
      }
    }
  }
  return undefined;
}

/* 🔢 Formatare numere — cu separator de mii, fără zecimale */
function formatNumber(value: any) {
  const num = Number(value);
  if (isNaN(num)) return value;
  return num.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

/* 🧠 Helper: obține imaginea principală */
function getFeaturedImage(car: any): string {
  try {
    // 1️⃣ Încearcă prima imagine din secțiunea "Exterior"
    const exterior = car?.schemaData?.Exterior?.images?.[0]?.src;
    if (exterior) return exterior;

    // 2️⃣ Caută în alte secțiuni care conțin imagini
    if (car?.schemaData) {
      for (const [_, value] of Object.entries(car.schemaData)) {
        if ((value as any)?.images?.length) {
          return (value as any).images[0].src;
        }
      }
    }

    // 3️⃣ Format vechi (legacy)
    const legacy = car?.images?.exterior?.[0];
    if (legacy) return legacy;
  } catch (err) {
    console.error("[CarCard] Eroare la obținerea imaginii:", err);
  }

  // 4️⃣ Fallback
  return "/images/placeholder-car.jpg";
}

interface Props {
  car: Car;
}

export default function CarCard({ car }: Props) {
  if (!car) return null;

  const mainImage = getFeaturedImage(car);

  // 🔹 Extragem valorile din schemaData (cu fallback-uri)
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

  const location =
    findValue(car.schemaData, "Location") ||
    findValue(car.schemaData, "Locație") ||
    undefined;

  return (
    <div className="group relative bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      {/* 🖼️ Imagine principală */}
      <Link
        href={`/listings/${car.id}`}
        className="block relative w-full h-56 md:h-64 overflow-hidden"
      >
        <Image
          src={mainImage}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* 🔹 Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-70 group-hover:opacity-90 transition"></div>

        {/* 🔹 Status Badge */}
        <span
          className={`absolute top-3 left-3 text-[11px] font-semibold px-2.5 py-1.5 rounded-full tracking-wide shadow-md ${
            car.status === "available"
              ? "bg-green-500 text-white"
              : car.status === "pending"
              ? "bg-yellow-500 text-black"
              : "bg-red-600 text-white"
          }`}
        >
          {car.status?.toUpperCase() || "UNKNOWN"}
        </span>
      </Link>

      {/* 🧾 Informații principale */}
      <div className="p-4">
        {/* Titlu */}
        <Link
          href={`/listings/${car.id}`}
          className="block text-[17px] font-semibold text-gray-900 leading-snug hover:text-blue-600 transition-colors truncate"
        >
          {title}
        </Link>

        {/* An + kilometraj */}
        <p className="text-sm text-gray-500 mt-1">
          {year ? `${year}` : ""} •{" "}
          {mileage ? `${formatNumber(mileage)} mileage` : "—"}
        </p>

        {/* Preț */}
        <p className="text-xl font-bold text-blue-600 mt-2 mb-3">
          {price ? `$${formatNumber(price)}` : "—"}
        </p>

        {/* Locație + buton */}
        <div className="flex justify-between items-center">
          {location ? (
            <span className="text-sm text-gray-500 truncate">📍 {location}</span>
          ) : (
            <span className="text-sm text-gray-400">—</span>
          )}

          <Link
            href={`/listings/${car.id}`}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            View details →
          </Link>
        </div>
      </div>
    </div>
  );
}
