"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import CarGallery from "@/components/listings/CarGallery";

/* 🧠 Recursive deep search in schemaData */
function deepFindValue(obj: any, key: string): any {
  if (!obj || typeof obj !== "object") return undefined;
  const normalized = key.trim().toLowerCase();
  for (const [k, v] of Object.entries(obj)) {
    if (k.trim().toLowerCase() === normalized) return v;
    if (typeof v === "object") {
      const found = deepFindValue(v, key);
      if (found !== undefined) return found;
    }
  }
  return undefined;
}

/* 🔢 Format numbers with commas */
function formatNumber(value: any) {
  const num = Number(value);
  if (isNaN(num)) return value;
  return num.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export default function CarDetailsPage() {
  const { id } = useParams();
  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statuses, setStatuses] = useState<Record<string, { color: string; name: string }>>({});

  /* 🔹 Fetch car data + status colors */
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        // 1️⃣ Mașina
        const docRef = doc(db, "cars", id as string);
        const snap = await getDoc(docRef);
        if (snap.exists()) setCar({ id, ...snap.data() });

        // 2️⃣ Statusuri cu culori
        const statusSnap = await getDocs(collection(db, "settings", "car_statuses", "list"));
        const map: Record<string, { color: string; name: string }> = {};
        statusSnap.forEach((s) => {
          const data = s.data();
          if (data.name)
            map[data.name.toLowerCase().trim()] = {
              name: data.name,
              color: data.color || "#999999",
            };
        });
        setStatuses(map);
      } catch (err) {
        console.error("[CarDetails] Error loading car or statuses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading)
    return <p className="text-center mt-6 text-gray-600">Loading car details...</p>;

  if (!car)
    return <p className="text-center text-red-500 mt-6">Car not found.</p>;

  // 🔹 Extract details
  const title = deepFindValue(car.schemaData, "Title") || "Unknown Title";
  const price = deepFindValue(car.schemaData, "Price") || undefined;
  const make = deepFindValue(car.schemaData, "Make") || "—";
  const model = deepFindValue(car.schemaData, "Model") || "—";
  const year = deepFindValue(car.schemaData, "Year") || undefined;
  const mileage = deepFindValue(car.schemaData, "Mileage") || undefined;

  // 🔹 Status styling din Firestore
  const normalizedStatus = (car.status || "unknown").trim().toLowerCase();
  const statusData = statuses[normalizedStatus];
  const statusColor = statusData?.color || "#999";
  const statusName = statusData?.name || car.status || "Unknown";

  return (
    <div className="max-w-[1600px] mx-auto p-6">
      {/* 🔹 Title + status */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">{title}</h1>
          <p className="text-gray-600 mb-4">
            {year || "N/A"} •{" "}
            {mileage ? `${formatNumber(mileage)} mileage` : "—"} •{" "}
            <span
              className="font-semibold uppercase px-2 py-1 rounded-md text-white"
              style={{ backgroundColor: statusColor }}
            >
              {statusName}
            </span>
          </p>
        </div>

        {/* 💰 Price */}
        {price && (
          <div className="mt-3 md:mt-0 bg-white/80 backdrop-blur-sm border border-gray-200 shadow-md rounded-2xl px-6 py-3 text-xl font-semibold text-gray-900">
            <span className="text-blue-700">Price:</span> ${formatNumber(price)}
          </div>
        )}
      </div>

      {/* 🖼️ Gallery */}
      <div className="md:col-span-2 mb-10 mt-4">
        <CarGallery schemaData={car.schemaData} />
      </div>

      {/* 🧩 Dynamic Sections */}
      <div className="mt-12 bg-white p-10 rounded-2xl shadow-xl space-y-12 border border-gray-100">
        {car.schemaData && <DynamicSections schemaData={car.schemaData} />}
      </div>
    </div>
  );
}

/* 🧩 Component that applies schema_order from Firestore */
/* 🧩 Component that applies schema_order from Firestore */
function DynamicSections({ schemaData }: { schemaData: any }) {
  const [schemaOrder, setSchemaOrder] = useState<
    { name: string; active: boolean }[] | null
  >(null);

  useEffect(() => {
    const fetchSchemaOrder = async () => {
      try {
        const ref = doc(db, "settings", "schema_order");
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setSchemaOrder(snap.data().sections || []);
        } else {
          setSchemaOrder([]); // fallback if missing
        }
      } catch (err) {
        console.error("Error loading schema order:", err);
      }
    };
    fetchSchemaOrder();
  }, []);

  if (!schemaOrder)
    return (
      <p className="text-gray-500 text-center mt-10">
        Loading section structure...
      </p>
    );

  // 🔹 Extrage doar secțiunile active și adaugă fallback pentru cele noi
  const orderedSections = schemaOrder
    .filter((s) => s.active)
    .map((s) => s.name)
    .filter((name) => !!schemaData[name]);

  const definedNames = schemaOrder.map((s) => s.name.toLowerCase());
  const remaining = Object.keys(schemaData).filter(
    (key) => !definedNames.includes(key.toLowerCase())
  );

  const finalSections = Array.from(
    new Map(
      [...orderedSections, ...remaining].map((name) => [
        name.toLowerCase(),
        name,
      ])
    ).values()
  );

  // ✅ Funcție robustă pentru extragerea ID-ului YouTube din orice format
  const renderYouTubeEmbed = (url: string) => {
    try {
      const cleanUrl = url.trim();

      // regex robust care prinde toate formele
      const videoIdMatch = cleanUrl.match(
        /(?:v=|\/embed\/|\/shorts\/|youtu\.be\/)([A-Za-z0-9_-]{11})/
      );
      const videoId = videoIdMatch ? videoIdMatch[1] : null;

      // 🧩 DEBUG: vezi exact ce link e procesat și ce ID s-a extras
      console.log(
        "%c🎬 YouTube debug",
        "background: #222; color: #4af; font-weight: bold; padding: 2px 6px; border-radius: 4px;",
        "\nURL:",
        cleanUrl,
        "\nVideo ID:",
        videoId
      );

      if (!videoId) {
        console.warn("⚠️ Nu s-a putut extrage ID YouTube din:", url);
        return (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            {url}
          </a>
        );
      }

      return (
        <div className="mt-4 mb-6 aspect-video rounded-xl overflow-hidden shadow-lg border border-gray-200">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </div>
      );
    } catch (err) {
      console.error("❌ Invalid YouTube link:", url, err);
      return null;
    }
  };

  // 🔹 Detectează dacă un string e un link YouTube
  const isYouTubeLink = (value: any): value is string =>
    typeof value === "string" &&
    (value.includes("youtube.com") || value.includes("youtu.be"));

  return (
    <>
      {finalSections.map((section) => {
        const data = schemaData[section];
        if (!data) return null;

        const isArray = Array.isArray(data);
        const isObject = typeof data === "object" && !isArray;
        const skipFields = ["tempId", "createdAt", "updatedAt"];
        if (skipFields.includes(section)) return null;

        return (
          <section
            key={section}
            className="border-b border-gray-200 pb-10 last:border-0 last:pb-0"
          >
            <h2 className="text-3xl font-semibold mb-6 text-gray-900 tracking-tight uppercase">
              {section}
            </h2>

            {/* 🔹 Liste simple */}
            {isArray && (
              <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-gray-800 text-[15px] leading-relaxed">
                {data.length > 0 ? (
                  data.map((item: string, i: number) =>
                    isYouTubeLink(item) ? (
                      <li key={i} className="col-span-2">
                        {renderYouTubeEmbed(item)}
                      </li>
                    ) : (
                      <li key={i} className="flex items-center gap-2">
  <span className="text-blue-600 text-lg leading-none">•</span>
  <span className="text-[15px]">{item}</span>
</li>

                    )
                  )
                ) : (
                  <li className="text-gray-400 italic">No data available</li>
                )}
              </ul>
            )}

            {/* 🔹 Obiecte structurate */}
            {isObject && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  {Object.entries(data).map(([fieldName, fieldValue]: any) => {
                    if (
                      [
                        "content",
                        "images",
                        "tempId",
                        "createdAt",
                        "updatedAt",
                      ].includes(fieldName)
                    )
                      return null;

                    if (!fieldValue) return null;

                    // 🔹 Dacă e un link YouTube, afișează player
                    if (isYouTubeLink(fieldValue)) {
                      return (
                        <div key={fieldName} className="col-span-3 w-full">
                          <span className="block text-xs font-semibold uppercase text-gray-500 tracking-wide mb-2">
                            {fieldName.replace(/_/g, " ")}
                          </span>
                          {renderYouTubeEmbed(fieldValue)}
                        </div>
                      );
                    }

                    const displayValue = Array.isArray(fieldValue)
                      ? fieldValue.join(", ")
                      : String(fieldValue);

                    return (
                      <div
                        key={fieldName}
                        className="flex flex-col bg-gray-50 border border-gray-100 rounded-lg p-4 hover:bg-gray-100 transition"
                      >
                        <span className="text-xs font-semibold uppercase text-gray-500 tracking-wide">
                          {fieldName.replace(/_/g, " ")}
                        </span>
                        <span className="text-gray-900 font-medium text-base mt-1">
                          {displayValue}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* 🔹 Content + imagini */}
                {data.content && (
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-[15px]">
                    {data.content}
                  </div>
                )}

                {/* 🔹 Imagini — sortate + prima imagine exterior afișată prima */}
                {data.images &&
                  Array.isArray(data.images) &&
                  data.images.length > 0 &&
                  (() => {
                    // 🔸 Sortează imaginile după nume (alfabetic sau numeric)
                    const sortedImages = [...data.images].sort((a, b) => {
                      const aName = a.name?.toLowerCase() || "";
                      const bName = b.name?.toLowerCase() || "";

                      // dacă numele sunt numerice (ex: "1.jpg", "10.jpg"), sortează numeric
                      const aNum = parseInt(aName);
                      const bNum = parseInt(bName);
                      if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;

                      // altfel sortare alfabetică naturală
                      return aName.localeCompare(bName, undefined, {
                        numeric: true,
                      });
                    });

                    // 🔸 dacă e secțiunea "Exterior", marchează prima imagine drept featured
                    const featuredFirst =
                      section.toLowerCase() === "exterior"
                        ? [sortedImages[0], ...sortedImages.slice(1)]
                        : sortedImages;

                    return (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
                        {featuredFirst.map((img: any, i: number) => (
                          <div
                            key={i}
                            className={`relative overflow-hidden rounded-xl border border-gray-200 shadow-sm group ${
                              section.toLowerCase() === "exterior" && i === 0
                                ? "ring-2 ring-blue-500 ring-offset-2"
                                : ""
                            }`}
                          >
                            <img
                              src={img.src}
                              alt={`${section} ${i + 1}`}
                              className={`object-cover w-full h-44 transition-transform duration-300 group-hover:scale-105 ${
                                section.toLowerCase() === "exterior" && i === 0
                                  ? "h-60 md:h-72"
                                  : ""
                              }`}
                              loading="lazy"
                            />

                            {/* 🔸 Badge vizual opțional */}
                            {section.toLowerCase() === "exterior" &&
                              i === 0 && (
                                <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-md shadow">
                                  Featured
                                </span>
                              )}
                          </div>
                        ))}
                      </div>
                    );
                  })()}
              </>
            )}
          </section>
        );
      })}
    </>
  );
}
