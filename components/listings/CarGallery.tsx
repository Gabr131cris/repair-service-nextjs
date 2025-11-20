"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import CarLightbox from "./CarLightbox";

export default function CarGallery({ schemaData }: { schemaData: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeIndex, setActiveIndex] = useState(0);

  // 🔹 1. CATEGORII SORTATE STABIL (Exterior primul) 
 /* const categories = useMemo(() => {
    if (!schemaData) return [];

    const keys = Object.keys(schemaData).filter(
      (key) => schemaData[key]?.images?.length > 0
    );

    return [
      ...keys.filter((k) => k.toLowerCase() === "exterior"),
      ...keys
        .filter((k) => k.toLowerCase() !== "exterior")
        .sort((a, b) => a.localeCompare(b)),
    ];
  }, [schemaData]);*/
 // 1. Categorii sortate stabil ext primul 
  const categories = useMemo(() => {
  if (!schemaData) return [];

  // extrage secțiunile care chiar au imagini
  const keys = Object.keys(schemaData).filter(
    (key) => schemaData[key]?.images?.length > 0
  );

  // normalizare la lowercase pentru comparație
  const lower = keys.map((k) => k.toLowerCase());

  // ordinea preferată
  const preferred = [
    "exterior",
    "interior",
    "engine",
    "documents",
    "others",
    "other images",
  ];

  // 1️⃣ Secțiuni în ordinea preferată (dacă există)
  const orderedPreferred = preferred
    .map((name) => keys.find((k) => k.toLowerCase() === name))
    .filter(Boolean);

  // 2️⃣ Restul secțiunilor care nu sunt în preferred
  const remaining = keys
    .filter((k) => !preferred.includes(k.toLowerCase()))
    .sort((a, b) => a.localeCompare(b));

  // ORDINEA FINALĂ
  return [...orderedPreferred, ...remaining];
}, [schemaData]);


  // 🔹 2. SORTARE STABILĂ PENTRU IMAGINI
  const sortImages = (images: any[]) =>
    [...images].sort((a, b) =>
      (a.name || "").localeCompare(b.name || "", undefined, {
        numeric: true,
        sensitivity: "base",
      })
    );

  // 🔹 3. COMBINĂM IMAGINILE ÎN ORDINE DETERMINISTĂ  
  const allImages = useMemo(() => {
    if (!schemaData) return [];

    return categories.flatMap((cat) =>
      sortImages(schemaData[cat].images).map((img: any) => ({
        ...img,
        category: cat,
      }))
    );
  }, [schemaData, categories]);

  const openLightbox = (index: number, category = "All") => {
    setActiveCategory(category);
    setActiveIndex(index);
    setIsOpen(true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-2 w-full mb-8">
      
      {/* 🔹 Imagine principală: prima din Exterior deoarece Exterior e primul în categories */}
      <div className="lg:col-span-4 relative bg-gray-100 rounded-lg overflow-hidden">
        <Image
          src={allImages[0]?.src || "/images/placeholder-car.jpg"}
          alt="Main Image"
          fill
          className="object-cover cursor-pointer"
          onClick={() => openLightbox(0)}
          priority
        />
        <span className="absolute top-3 left-3 bg-gray-900/70 text-white text-xs px-2 py-1 rounded">
          FEATURED ({allImages[0]?.category || "N/A"})
        </span>
      </div>

      {/* 🔹 Thumbnails */}
      <div className="lg:col-span-1 grid grid-cols-2 lg:grid-cols-1 gap-2">
        {allImages.slice(1, 6).map((img, i) => (
          <div
            key={i}
            className="relative h-[100px] md:h-[120px] rounded-lg overflow-hidden cursor-pointer group"
            onClick={() => openLightbox(i + 1, img.category)}
          >
            <Image
              src={img.src}
              alt={`Thumbnail ${i}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition"></div>

            {i === 0 && (
              <span className="absolute top-2 left-2 text-xs bg-gray-900/70 text-white px-2 py-1 rounded">
                {img.category}
              </span>
            )}
          </div>
        ))}

        {/* 🔹 Buton All Photos */}
        <div
          onClick={() => setIsOpen(true)}
          className="relative h-[100px] md:h-[120px] bg-gray-800 text-white flex items-center justify-center rounded-lg cursor-pointer hover:bg-gray-700 transition"
        >
          <p className="text-sm font-medium">All Photos ({allImages.length})</p>
        </div>
      </div>

      {/* 🔹 Lightbox */}
      {isOpen && (
        <CarLightbox
          images={allImages}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
          onClose={() => setIsOpen(false)}
          categories={["All", ...categories]}
        />
      )}
    </div>
  );
}
