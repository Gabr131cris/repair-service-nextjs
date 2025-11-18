"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Car } from "@/lib/types";
import { getCarStatuses } from "@/lib/firestore";

/* Helper universal */
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

function formatNumber(value: any) {
  const num = Number(value);
  if (isNaN(num)) return value;
  return num.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function getFeaturedImage(car: any): string {
  try {
    const exterior = car?.schemaData?.Exterior?.images?.[0]?.src;
    if (exterior) return exterior;

    if (car?.schemaData) {
      for (const [_, value] of Object.entries(car.schemaData)) {
        if ((value as any)?.images?.length) {
          return (value as any).images[0].src;
        }
      }
    }

    const legacy = car?.images?.exterior?.[0];
    if (legacy) return legacy;
  } catch (err) {
    console.error("[CarCardSold] Error loading image:", err);
  }

  return "/images/placeholder-car.jpg";
}

interface Props {
  car: Car;
}

export default function CarCardSold({ car }: Props) {
  const [statusColors, setStatusColors] = useState<Record<string, any>>({});

  useEffect(() => {
    (async () => {
      try {
        const data = await getCarStatuses();
        setStatusColors(data);
      } catch (err) {
        console.error("❌ Error loading statuses:", err);
      }
    })();
  }, []);

  if (!car) return null;

  const mainImage = getFeaturedImage(car);

  const title =
    findValue(car.schemaData, "Title") ||
    findValue(car.schemaData, "Titlu") ||
    "Unknown Title";

  const year =
    findValue(car.schemaData, "Year") ||
    findValue(car.schemaData, "An fabricație") ||
    undefined;

  const mileage =
    findValue(car.schemaData, "Mileage") ||
    findValue(car.schemaData, "Kilometraj") ||
    undefined;

  return (
  <div className="group relative bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm transition-all duration-300 select-none">

    {/* IMAGE (non-clickable) */}
    <div className="relative w-full h-56 md:h-64 overflow-hidden cursor-default">
      <Image
        src={mainImage}
        alt={title}
        fill
        className="object-cover transition-transform duration-500"
      />

      {/* DIAGONAL SOLD OVERLAY */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div
          className="
            absolute
            w-[200%]
            h-20
            bg-white/70
            rotate-[-25deg]
            top-1/2
            -translate-y-1/2
            flex
            items-center
            justify-center
            shadow-xl
          "
        >
          <span className="text-4xl md:text-5xl font-extrabold text-red-600 tracking-wider drop-shadow-lg">
            SOLD
          </span>
        </div>
      </div>

      {/* GRADIENT OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent"></div>

      {/* SOLD BADGE (optional) */}
      
    </div>

    {/* CONTENT (non-clickable) */}
    <div className="p-4 cursor-default">
      <p className="block text-[17px] font-semibold text-gray-900 leading-snug truncate">
        {title}
      </p>

      <p className="text-sm text-gray-500 mt-1">
        {year ? `${year}` : ""} • {mileage ? `${formatNumber(mileage)} miles` : "—"}
      </p>

      {/* SOLD TEXT */}
      
    </div>
  </div>
);

}
