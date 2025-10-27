"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Mail, MapPin, Phone } from "lucide-react";

export default function TopBar() {
  const [siteInfo, setSiteInfo] = useState<any>(null);

  // 🔹 Load data from Firestore
  useEffect(() => {
    const fetchSiteInfo = async () => {
      try {
        const refDoc = doc(db, "settings", "site_info");
        const snap = await getDoc(refDoc);
        if (snap.exists()) {
          setSiteInfo(snap.data());
        }
      } catch (err) {
        console.error("Error loading site info:", err);
      }
    };

    fetchSiteInfo();
  }, []);

  if (!siteInfo)
    return (
      <div className="w-full bg-gray-100 border-b border-gray-200 text-gray-700 text-sm">
        <div className="w-full max-w-[1800px] mx-auto px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between px-4 py-2 gap-2">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-gray-400">
              <Phone size={14} />
              <span>Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );

  const { phone, contactEmail, city, country } = siteInfo;

  return (
    <div className="w-full bg-gray-100 border-b border-gray-200 text-gray-700 text-sm">
      <div className="w-full max-w-[1800px] mx-auto px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between px-4 py-2 gap-2">
        {/* LEFT SIDE — Contact info */}
        <div className="flex items-center gap-6">
          {phone && (
            <a
              href={`tel:${phone}`}
              className="flex items-center gap-2 hover:text-blue-600 transition"
            >
              <Phone size={14} />
              <span>{phone}</span>
            </a>
          )}
          {contactEmail && (
            <a
              href={`mailto:${contactEmail}`}
              className="flex items-center gap-2 hover:text-blue-600 transition"
            >
              <Mail size={14} />
              <span>{contactEmail}</span>
            </a>
          )}
        </div>

        {/* RIGHT SIDE — Location */}
        {(city || country) && (
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin size={14} className="text-blue-500" />
            <span>
              {city && country ? `${city}, ${country}` : city || country}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
