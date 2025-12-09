"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { getUserRole } from "@/lib/auth";


import { Gauge, ShieldCheck, Wallet, Truck } from "lucide-react";
//
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



/* ---------- main page ---------- */
export default function HomePage() {
  

  const [role, setRole] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState("");

  const [content, setContent] = useState({
    heroSubtitle: "Aplicația modernă pentru service-uri auto și vulcanizare",
    heroTitle:
      "Gestionare completă: facturi, prețuri, clienți, servicii",
    heroText:
      "Creezi facturi în câteva secunde, administrezi servicii și prețuri, salvezi clienți, verifici istoricul și îți scalezi afacerea cu un instrument complet în cloud.",
    heroImage: "/images/hero-vintage.jpg",

    cta1: "Începe Gratuit",
    cta2: "Contactează-ne",

    benefits: [
      { title: "Facturi Instant", text: "Generezi facturi în câteva secunde." },
      {
        title: "Prețuri Automate",
        text: "Calcul pe categorii auto și mărimi roți.",
      },
      {
        title: "Administrare Completă",
        text: "Superadmin, companii, utilizatori, servicii.",
      },
      {
        title: "100% Cloud",
        text: "Stocare sigură și accesibilă de oriunde.",
      },
    ],

    bannerTitle: "Vrei să folosești aplicația pentru service-ul tău?",
    bannerText:
      "Contactează-ne pentru detalii, abonamente și implementare personalizată.",
  });

  
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
          <div className="mx-auto max-w-7xl rounded-2xl border border-gray-200 bg-white/90 backdrop-blur p-8 shadow-sm">

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
                <div className="text-center">
  <p className="text-xs tracking-[0.2em] text-gray-500">
    {content.heroSubtitle}
  </p>
  <h1 className="mt-2 text-3xl font-extrabold leading-tight md:text-4xl">
    {content.heroTitle}
  </h1>
  <p className="mt-3 max-w-3xl mx-auto text-gray-600">
    {content.heroText}
  </p>
</div>
              </>
            )}

            <div className="mt-5 flex flex-wrap justify-center gap-3">
  
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
      <section className="w-full flex justify-center px-4">
  <div className="w-full max-w-6xl mt-12 grid gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:grid-cols-4">

          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-6 w-6 text-blue-600" />
            <div>
              <p className="font-semibold">Facturi Instant</p>
              <p className="text-sm text-gray-600">
                Generezi facturi în câteva secunde.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Gauge className="mt-0.5 h-6 w-6 text-blue-600" />
            <div>
              <p className="font-semibold">Prețuri Automate</p>
              <p className="text-sm text-gray-600">Calcul automat pe categorii auto.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Wallet className="mt-0.5 h-6 w-6 text-blue-600" />
            <div>
              <p className="font-semibold">Administrare Completă</p>
              <p className="text-sm text-gray-600">Utilizatori, servicii, clienți, companii.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Truck className="mt-0.5 h-6 w-6 text-blue-600" />
            <div>
              <p className="font-semibold">100% Cloud</p>
              <p className="text-sm text-gray-600">Acces rapid și sigur de oriunde.</p>
            </div>
          </div>
        </div>
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
                Contactează-ne
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
