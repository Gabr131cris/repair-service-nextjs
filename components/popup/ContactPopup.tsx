"use client";

import { X } from "lucide-react";

export default function ContactPopup({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 relative animate-fadeIn">


        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X size={22} />
        </button>

        <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>

        <div className="space-y-4 text-gray-800">

          {/* Address */}
          

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-sm text-gray-500">HOW TO REACH US</h3>
            <p>(786) 462-9941</p>
            <a
              href="mailto:info@dariellamotors.com"
              className="text-blue-600 underline hover:text-blue-800"
            >
              info@dariellamotors.com
            </a>
          </div>

          {/* Hours */}
          <div>
            <h3 className="font-semibold text-sm text-gray-500">HOURS</h3>

            <div className=" rounded-lg overflow-hidden text-sm">
              <div className="flex justify-between border-b px-4 py-2">
                <span>Monday - Friday</span>
                <span>9 AM - 5 PM</span>
              </div>
              <div className="flex justify-between border-b px-4 py-2">
                <span>Saturday</span>
                <span>9 AM - 12 PM</span>
              </div>
              <div className="flex justify-between px-4 py-2">
                <span>Sunday</span>
                <span>By Appointment Only</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Simple fade animation */}
      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
