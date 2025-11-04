"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Footer() {
  const [siteInfo, setSiteInfo] = useState<any>(null);

  useEffect(() => {
    const fetchSiteInfo = async () => {
      try {
        const ref = doc(db, "settings", "site_info");
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setSiteInfo(snap.data());
        }
      } catch (err) {
        console.error("Error loading site info:", err);
      }
    };
    fetchSiteInfo();
  }, []);

  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 py-10 mt-16">
      <div className="container mx-auto px-4 text-center md:text-left">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 🔹 Company Info */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">
              {siteInfo?.siteName || "CarMarket"}
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              {siteInfo?.description ||
                "Buy or sell your car easily, quickly and safely."}
            </p>
            {siteInfo?.logoUrl && (
              <img
                src={siteInfo.logoUrl}
                alt="Logo"
                className="w-28 mt-4 mx-auto md:mx-0"
              />
            )}
          </div>

          {/* 🔹 Useful Links */}
          <div>
            <h4 className="text-white font-semibold mb-3">Useful Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:underline">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:underline">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/listings" className="hover:underline">
                  Listings
                </Link>
              </li>
            </ul>
          </div>

          {/* 🔹 Contact */}
          <div>
            <h4 className="text-white font-semibold mb-3">Contact</h4>
            {siteInfo?.contactEmail && (
              <p className="text-sm text-gray-400">
                📧 {siteInfo.contactEmail}
              </p>
            )}
            {siteInfo?.phone && (
              <p className="text-sm text-gray-400 mt-1">📞 {siteInfo.phone}</p>
            )}
            {siteInfo?.address && (
              <p className="text-sm text-gray-400 mt-1">
                📍 {siteInfo.address}
                <br></br>
                📍 {siteInfo.city}
              </p>
            )}

            <div className="flex gap-4 mt-3 justify-center md:justify-start">
              {siteInfo?.facebook && (
                <Link
                  href={siteInfo.facebook}
                  target="_blank"
                  className="hover:text-white transition"
                >
                  Facebook
                </Link>
              )}
              {siteInfo?.instagram && (
                <Link
                  href={siteInfo.instagram}
                  target="_blank"
                  className="hover:text-white transition"
                >
                  Instagram
                </Link>
              )}
              {siteInfo?.youtube && (
                <Link
                  href={siteInfo.youtube}
                  target="_blank"
                  className="hover:text-white transition"
                >
                  YouTube
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* 🔹 Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-4 text-sm text-gray-500 text-center">
          © {year} {siteInfo?.siteName || "CarMarket"}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
