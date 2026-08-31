"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Facebook, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

interface SiteInfo {
  siteName?: string;
  description?: string;
  logoUrl?: string;
  contactEmail?: string;
  phone?: string;
  address?: string;
  city?: string;
  facebook?: string;
  linkedin?: string;
  website?: string;
}

export default function Footer() {
  const [siteInfo, setSiteInfo] = useState<SiteInfo | null>(null);

  useEffect(() => {
    getDoc(doc(db, "settings", "site_info"))
      .then((snap) => snap.exists() && setSiteInfo(snap.data()))
      .catch((error) => console.error("Nu s-au putut încărca informațiile site-ului:", error));
  }, []);

  const description =
    siteInfo?.description && !siteInfo.description.toLowerCase().includes("please contact me")
      ? siteInfo.description
      : "Platformă cloud pentru administrarea simplă și eficientă a service-urilor auto.";

  return (
    <footer className="mt-20 bg-slate-950 text-slate-300">
      <div className="container mx-auto px-4 py-14">
        <div className="mb-12 flex flex-col gap-6 rounded-3xl border border-white/10 bg-gradient-to-r from-blue-600/20 to-slate-900 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-300">Ai întrebări?</p>
            <h2 className="mt-2 text-2xl font-bold text-white">Descoperă cum îți poate simplifica munca.</h2>
          </div>
          <Link href="/contact" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-blue-50">
            Solicită o demonstrație <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>

        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <h3 className="text-xl font-bold text-white">{siteInfo?.siteName || "Repair Service"}</h3>
            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">{description}</p>
            {siteInfo?.logoUrl && <img src={siteInfo.logoUrl} alt={siteInfo.siteName || "Repair Service"} className="mt-5 h-12 w-auto object-contain" />}
          </div>
          <div>
            <h4 className="font-semibold text-white">Linkuri utile</h4>
            <ul className="mt-4 space-y-3 text-sm">
              <li><Link href="/about" className="transition hover:text-white">Despre noi</Link></li>
              <li><Link href="/contact" className="transition hover:text-white">Contact</Link></li>
              <li><Link href="/listings" className="transition hover:text-white">Listări</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white">Contact</h4>
            <div className="mt-4 space-y-3 text-sm">
              {siteInfo?.contactEmail && <a href={`mailto:${siteInfo.contactEmail}`} className="flex items-center gap-3 transition hover:text-white"><Mail size={17} className="text-blue-400" />{siteInfo.contactEmail}</a>}
              {siteInfo?.phone && <a href={`tel:${siteInfo.phone.replace(/\s/g, "")}`} className="flex items-center gap-3 transition hover:text-white"><Phone size={17} className="text-blue-400" />{siteInfo.phone}</a>}
              {(siteInfo?.address || siteInfo?.city) && <p className="flex items-start gap-3"><MapPin size={17} className="mt-0.5 shrink-0 text-blue-400" /><span>{siteInfo.address}{siteInfo.address && siteInfo.city ? ", " : ""}{siteInfo.city}</span></p>}
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              {siteInfo?.facebook && <Link href={siteInfo.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="rounded-full border border-white/10 p-2.5 hover:border-blue-400 hover:text-white"><Facebook size={18} /></Link>}
              {siteInfo?.linkedin && <Link href={siteInfo.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="rounded-full border border-white/10 p-2.5 hover:border-blue-400 hover:text-white"><Linkedin size={18} /></Link>}
              {siteInfo?.website && <Link href={siteInfo.website} target="_blank" rel="noreferrer" className="rounded-full border border-white/10 px-4 py-2 text-sm hover:border-blue-400 hover:text-white">Site web</Link>}
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-white/10 pt-6 text-center text-sm text-slate-500">© {new Date().getFullYear()} {siteInfo?.siteName || "Repair Service"}. Toate drepturile rezervate.</div>
      </div>
    </footer>
  );
}
