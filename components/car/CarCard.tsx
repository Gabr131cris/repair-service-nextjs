"use client";

import Link from "next/link";
import Image from "next/image";
import { Car } from "@/lib/types";

/* 🧠 Helper universal pentru citirea valorilor din schemaData */
function findValue(schemaData: any, key: string) {
  if (!schemaData || typeof schemaData !== "object") {
    console.warn("[CarCard] schemaData invalid:", schemaData);
    return undefined;
  }

  const normalizedKey = key.trim().toLowerCase();

  for (const [sectionName, sectionValue] of Object.entries(schemaData)) {
    if (typeof sectionValue === "object" && sectionValue !== null) {
      for (const [k, v] of Object.entries(sectionValue)) {
        if (k.trim().toLowerCase() === normalizedKey) {
          console.log(`[CarCard] Găsit '${key}' în secțiunea "${sectionName}":`, v);
          return v;
        }
      }
    }
  }

  console.warn(`[CarCard] Valoarea pentru '${key}' nu a fost găsită în schemaData.`);
  return undefined;
}

/* 🧠 Helper: obține imaginea principală */
function getFeaturedImage(car: any): string {
  try {
    // 1️⃣ Încearcă prima imagine din secțiunea "Exterior"
    const exterior = car?.schemaData?.Exterior?.images?.[0]?.src;
    if (exterior) {
      console.log("[CarCard] Imagine principală (Exterior):", exterior);
      return exterior;
    }

    // 2️⃣ Caută în alte secțiuni care conțin imagini
    if (car?.schemaData) {
      for (const [section, value] of Object.entries(car.schemaData)) {
        if ((value as any)?.images?.length) {
          const img = (value as any).images[0].src;
          console.log(`[CarCard] Imagine găsită în secțiunea '${section}':`, img);
          return img;
        }
      }
    }

    // 3️⃣ Format vechi (legacy)
    const legacy = car?.images?.exterior?.[0];
    if (legacy) {
      console.log("[CarCard] Imagine veche găsită:", legacy);
      return legacy;
    }
  } catch (err) {
    console.error("[CarCard] Eroare la obținerea imaginii:", err);
  }

  // 4️⃣ Fallback
  console.warn("[CarCard] Nicio imagine găsită, folosim placeholder.");
  return "/images/placeholder-car.jpg";
}

interface Props {
  car: Car;
}

export default function CarCard({ car }: Props) {
  if (!car) {
    console.error("[CarCard] car este null sau undefined!");
    return null;
  }

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

  console.groupCollapsed(`[CarCard] ▶️ Anunț ${car.id}`);
  console.log("Title:", title);
  console.log("Price:", price);
  console.log("Mileage:", mileage);
  console.log("Year:", year);
  console.log("Location:", location);
  console.log("Status:", car.status);
  console.log("Main Image:", mainImage);
  console.groupEnd();

  return (
    <div className="group relative bg-[#1a1a1a] border border-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
      {/* 🖼️ Imagine principală */}
      <Link href={`/listings/${car.id}`} className="block relative w-full h-52">
        <Image
          src={mainImage}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* 🔹 Status Badge */}
        <span
          className={`absolute top-3 left-3 text-xs font-semibold px-2 py-1 rounded ${
            car.status === "available"
              ? "bg-green-500"
              : car.status === "pending"
              ? "bg-yellow-500"
              : "bg-red-500"
          }`}
        >
          {car.status?.toUpperCase() || "UNKNOWN"}
        </span>
      </Link>

      {/* 🧾 Informații principale */}
      <div className="p-4 text-white">
        <h3 className="text-lg font-semibold mb-1 truncate group-hover:text-blue-400 transition-colors">
          {title}
        </h3>

        <p className="text-sm text-gray-400 mb-1">
          {year || "N/A"} • {mileage ? `${mileage} km` : "—"}
        </p>

        <p className="text-blue-400 font-bold text-lg mb-2">
          {price ? `${price} €` : "—"}
        </p>

        <div className="flex justify-between items-center text-sm text-gray-500">
          {location && <span className="truncate">{location}</span>}

          <Link
            href={`/listings/${car.id}`}
            className="text-blue-500 hover:text-blue-300 font-medium transition-colors"
          >
            Detalii →
          </Link>
        </div>
      </div>
    </div>
  );
}
