"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getUserRole } from "@/lib/auth";


import { ArrowRight, Check, ClipboardList, Gauge, Play, ShieldCheck, Store, Users, Wallet, Wrench } from "lucide-react";
/* ---------- main page ---------- */
export default function HomePage() {
  

  const [role, setRole] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState("");

  const [content, setContent] = useState({
    heroSubtitle: "Aplicația modernă pentru service-uri auto și vulcanizare",
    heroTitle: "Administrează service-ul auto simplu, dintr-un singur loc",
    heroText: "Creează facturi rapid, gestionează clienții și serviciile și urmărește încasările fără tabele complicate.",
    heroImage: "/images/hero-vintage.jpg",

    cta1: "Solicită o demonstrație",
    cta2: "Vezi cum funcționează",

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

    bannerTitle: "Vrei să vezi aplicația adaptată service-ului tău?",
    bannerText:
      "Contactează-ne pentru detalii, abonamente și implementare personalizată.",
  });

  useEffect(() => {
    const loadPage = async () => {
      setRole(await getUserRole());
      const snap = await getDoc(doc(db, "pages", "home"));
      if (snap.exists()) {
        const saved = snap.data();
        setContent((current) => ({
          ...current,
          ...saved,
          heroTitle: current.heroTitle,
          heroText: current.heroText,
          cta1: current.cta1,
          cta2: current.cta2,
          bannerTitle: current.bannerTitle,
        }));
      }
    };
    loadPage().catch((error) => console.error("Nu s-a putut încărca pagina principală:", error));
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
        <div className="relative h-[420px] w-full overflow-hidden md:h-[560px]">
          <Image
            src={content.heroImage}
            alt="Service auto administrat cu Repair Service"
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
  
  <Link href="/contact" className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700">
    {content.cta1} <ArrowRight size={18} aria-hidden="true" />
  </Link>
  <Link href="#cum-functioneaza" className="rounded-full border border-gray-300 px-5 py-3 font-semibold text-gray-800 transition hover:border-blue-500 hover:text-blue-600">
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
            <Store className="mt-0.5 h-6 w-6 text-blue-600" />
            <div>
              <p className="font-semibold">100% Cloud</p>
              <p className="text-sm text-gray-600">Acces rapid și sigur de oriunde.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="cum-functioneaza" className="scroll-mt-24 px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">Un flux simplu</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900 md:text-4xl">Cum funcționează</h2>
            <p className="mt-4 text-slate-600">De la primirea mașinii până la factura finală, toate informațiile rămân organizate în același loc.</p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              { icon: Users, number: "01", title: "Adaugi clientul", text: "Salvezi datele clientului și ale mașinii o singură dată, apoi le găsești rapid la următoarea vizită." },
              { icon: Wrench, number: "02", title: "Selectezi serviciile", text: "Alegi lucrările și prețurile configurate pentru service-ul tău, fără calcule repetate." },
              { icon: ClipboardList, number: "03", title: "Emiți documentul", text: "Verifici totalul, salvezi lucrarea și generezi documentul pentru client în câteva secunde." },
            ].map(({ icon: Icon, number, title, text }) => (
              <article key={number} className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                <span className="absolute right-5 top-3 text-6xl font-black text-slate-50">{number}</span>
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><Icon aria-hidden="true" /></div>
                <h3 className="relative mt-5 text-xl font-bold">{title}</h3>
                <p className="relative mt-3 leading-7 text-slate-600">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-950 px-4 py-20 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400">Previzualizare produs</p>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl">Informația importantă, la vedere</h2>
            <p className="mt-4 leading-7 text-slate-300">Interfața este construită în jurul activităților zilnice: clienți, servicii, prețuri, facturi și încasări.</p>
            <ul className="mt-7 space-y-3 text-slate-200">
              {["Căutare rapidă după client sau număr de înmatriculare", "Prețuri configurabile pentru fiecare serviciu", "Istoric centralizat al lucrărilor și documentelor", "Acces separat pentru administratori și angajați"].map((item) => (
                <li key={item} className="flex items-start gap-3"><Check className="mt-0.5 shrink-0 text-blue-400" size={20} />{item}</li>
              ))}
            </ul>
            <Link href="/contact" className="mt-8 inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500"><Play size={18} fill="currentColor" /> Cere demonstrația video</Link>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl">
            <div className="overflow-hidden rounded-2xl bg-slate-100 text-slate-900">
              <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4"><strong>Creare factură</strong><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Salvat automat</span></div>
              <div className="grid gap-4 p-5 sm:grid-cols-2">
                {["Client", "Număr înmatriculare", "Serviciu", "Angajat"].map((label) => <div key={label}><p className="mb-1 text-xs font-semibold text-slate-500">{label}</p><div className="h-10 rounded-lg border border-slate-200 bg-white" /></div>)}
              </div>
              <div className="mx-5 mb-5 rounded-xl bg-blue-50 p-4"><div className="flex justify-between"><span className="font-semibold">Total estimat</span><strong className="text-blue-700">— RON</strong></div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center"><p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">Pentru afacerea ta</p><h2 className="mt-3 text-3xl font-bold">Cui i se adresează</h2></div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[{title:"Service-uri auto",text:"Pentru programări, lucrări, clienți și documente organizate."},{title:"Vulcanizări",text:"Pentru servicii și prețuri rapide, configurate după tipul lucrării."},{title:"Ateliere independente",text:"Pentru echipe care vor să renunțe la hârtii și fișiere dispersate."}].map((item) => <article key={item.title} className="rounded-2xl border border-slate-200 p-6"><h3 className="text-lg font-bold">{item.title}</h3><p className="mt-2 leading-7 text-slate-600">{item.text}</p></article>)}
          </div>
          <div className="mt-10 rounded-3xl border border-blue-100 bg-blue-50 p-7 text-center md:p-10">
            <h3 className="text-2xl font-bold">Ofertă adaptată modului tău de lucru</h3>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600">Prețul este stabilit în funcție de numărul de utilizatori, funcțiile necesare și nivelul de configurare. Discuția inițială și demonstrația sunt gratuite.</p>
            <Link href="/contact" className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700">Solicită o ofertă <ArrowRight size={18} /></Link>
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
