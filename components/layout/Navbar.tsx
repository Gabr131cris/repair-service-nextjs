"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

const navLinks = [
  { href: "/", label: "Acasă" },
  { href: "/dashboard", label: "Panou de control" },
  { href: "/contact", label: "Contact" },
];

interface SiteInfo {
  logoUrl?: string;
  siteName?: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [siteInfo, setSiteInfo] = useState<SiteInfo | null>(null);

  useEffect(() => {
    getDoc(doc(db, "settings", "site_info"))
      .then((snap) => snap.exists() && setSiteInfo(snap.data()))
      .catch((error) => console.error("Nu s-au putut încărca informațiile site-ului:", error));
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 text-slate-800 shadow-sm backdrop-blur" aria-label="Navigație principală">
      <div className="container mx-auto flex min-h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2" aria-label="Repair Service - pagina principală">
          {siteInfo?.logoUrl ? (
            <img src={siteInfo.logoUrl} alt={siteInfo.siteName || "Repair Service"} className="h-10 w-auto object-contain" />
          ) : (
            <span className="text-2xl font-bold tracking-tight"><span className="text-blue-600">Repair</span> Service</span>
          )}
        </Link>

        <div className="hidden items-center gap-2 lg:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} aria-current={isActive(link.href) ? "page" : undefined}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${isActive(link.href) ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-blue-700"}`}>
              {link.label}
            </Link>
          ))}
          <Link href="/auth/login" className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-700">Autentificare</Link>
          <Link href="/contact" className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md">Solicită o demonstrație</Link>
        </div>

        <button type="button" onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Închide meniul" : "Deschide meniul"} aria-expanded={open} aria-controls="meniul-mobil"
          className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 lg:hidden">
          {open ? <X size={26} aria-hidden="true" /> : <Menu size={26} aria-hidden="true" />}
        </button>
      </div>

      {open && (
        <div id="meniul-mobil" className="border-t border-slate-200 bg-white px-4 py-4 shadow-lg lg:hidden">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} aria-current={isActive(link.href) ? "page" : undefined}
                className={`rounded-xl px-4 py-3 font-semibold ${isActive(link.href) ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"}`}>
                {link.label}
              </Link>
            ))}
            <Link href="/auth/login" className="rounded-xl border border-slate-200 px-4 py-3 text-center font-semibold text-slate-700">Autentificare</Link>
            <Link href="/contact" className="rounded-xl bg-blue-600 px-4 py-3 text-center font-semibold text-white shadow-sm">Solicită o demonstrație</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
