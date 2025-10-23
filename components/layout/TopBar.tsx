"use client";

import { Mail, MapPin, Phone } from "lucide-react";

export default function TopBar() {
  return (
    <div className="w-full bg-gray-100 border-b border-gray-200 text-gray-700 text-sm">
      <div className="w-full max-w-[1800px] mx-auto px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between px-4 py-2 gap-2">
        {/* LEFT SIDE — Contact info */}
        <div className="flex items-center gap-6">
          <a
            href="tel:+13092199999"
            className="flex items-center gap-2 hover:text-blue-600 transition"
          >
            <Phone size={14} />
            <span>+1 (309) 219-9999</span>
          </a>
          <a
            href="mailto:info@carmarket.com"
            className="flex items-center gap-2 hover:text-blue-600 transition"
          >
            <Mail size={14} />
            <span>info@carmarket.com</span>
          </a>
        </div>

        {/* RIGHT SIDE — Location */}
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin size={14} className="text-blue-500" />
          <span>Chicago, IL, USA</span>
        </div>
      </div>
    </div>
  );
}
