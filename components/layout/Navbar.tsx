"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, Search } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [siteInfo, setSiteInfo] = useState<any>(null);

  // 🔹 Load site info from Firestore
  useEffect(() => {
    const fetchSiteInfo = async () => {
      try {
        const refDoc = doc(db, "settings", "site_info");
        const snap = await getDoc(refDoc);
        if (snap.exists()) setSiteInfo(snap.data());
      } catch (err) {
        console.error("Error loading site info:", err);
      }
    };
    fetchSiteInfo();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/listings?query=${encodeURIComponent(search)}`);
      setSearch("");
      setOpen(false);
    }
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/listings", label: "Listings" },
    { href: "/finance", label: "Finance" },
    { href: "/shipping", label: "Shipping" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    
  ];

  return (
    <nav className="bg-white text-gray-800 shadow-sm sticky top-0 z-50 border-b border-gray-200">
      <div className="container mx-auto flex items-center justify-between px-4 py-3 md:py-4">
        {/* 🔹 LOGO or site name fallback */}
        <Link href="/" className="flex items-center space-x-2">
          {siteInfo?.logoUrl ? (
            <img
              src={siteInfo.logoUrl}
              alt={siteInfo.siteName || "Logo"}
              className="h-10 w-auto object-contain"
            />
          ) : (
            <>
              <span className="text-2xl font-bold text-blue-600">
                {siteInfo?.siteName?.split(" ")[0] || "Car"}
              </span>
              <span className="text-2xl font-bold text-gray-900">
                {siteInfo?.siteName?.split(" ")[1] || "Market"}
              </span>
            </>
          )}
        </Link>

        {/* 🔹 SEARCH BAR (desktop) */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex items-center bg-gray-100 rounded-full overflow-hidden px-3 py-1.5 w-96 border border-gray-200"
        >
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search cars (e.g. BMW, Audi, Ford)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm text-gray-700 px-2 flex-1"
          />
        </form>

        {/* 🔹 NAV LINKS (desktop) */}
        <div className="hidden md:flex items-center space-x-6 font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition ${
                pathname === link.href
                  ? "text-blue-600 font-semibold"
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* SELL BUTTON */}
          <Link
            href="/dashboard/cars/new"
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full font-semibold transition"
          >
            Sell a Car
          </Link>

          {/* LOGIN */}
          <Link
            href="/auth/login"
            className="border border-gray-300 hover:border-blue-500 text-gray-700 hover:text-blue-600 px-4 py-2 rounded-full transition"
          >
            Login
          </Link>
        </div>

        {/* 🔹 MOBILE MENU BUTTON */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-gray-600 hover:text-blue-600"
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* 🔹 MOBILE DROPDOWN */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-sm">
          {/* Search bar mobile */}
          <form
            onSubmit={handleSearch}
            className="flex items-center bg-gray-100 rounded-full overflow-hidden px-3 py-2 m-4 border border-gray-200"
          >
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search cars..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none text-sm text-gray-700 px-2 flex-1"
            />
          </form>

          {/* Menu items */}
          <ul className="flex flex-col space-y-2 px-6 pb-4 font-medium">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`block py-2 transition ${
                    pathname === link.href
                      ? "text-blue-600 font-semibold"
                      : "text-gray-700 hover:text-blue-600"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}

            <li>
              <Link
                href="/dashboard/cars/new"
                onClick={() => setOpen(false)}
                className="block bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-center font-semibold transition"
              >
                Sell a Car
              </Link>
            </li>

            <li>
              <Link
                href="/auth/login"
                onClick={() => setOpen(false)}
                className="block border border-gray-300 hover:border-blue-500 text-gray-700 hover:text-blue-600 px-4 py-2 rounded-full text-center transition"
              >
                Login
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
