"use client";

import { useState } from "react";
import CheckAvailabilityModal from "./CheckAvailabilityModal";

function formatPrice(value: any) {
  const num = Number(value);
  if (isNaN(num)) return value;
  return num.toLocaleString("en-US");
}

interface CarPricingBoxProps {
  title: string;
  price: number;
}

export default function CarPricingBox({ title, price }: CarPricingBoxProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* MODAL */}
      <CheckAvailabilityModal
        isOpen={open}
        onClose={() => setOpen(false)}
        carTitle={title}
      />

      <div className="w-full bg-white rounded-xl shadow-md p-5">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div className="flex items-center gap-4 flex-wrap pl-4 md:pl-6">

            <span className="text-3xl font-extrabold text-gray-900">
              USD ${formatPrice(price)}
            </span>

            <div className="flex items-center gap-2 bg-gray-100 px-4 py-1.5 rounded-full shadow-sm border border-gray-200">
              <span className="text-[14px] font-semibold text-gray-900">
                We also accept crypto
              </span>
              <span className="w-5 h-5 rounded-full bg-[#f7931a] flex items-center justify-center">
                <span className="text-white text-xs font-bold">₿</span>
              </span>
            </div>

          </div>

          <button
            onClick={() => setOpen(true)}
            className="
              bg-black text-white py-2.5 px-8 rounded-lg font-semibold
              hover:bg-gray-900 transition w-full md:w-auto
            "
          >
            Check availability
          </button>

        </div>

      </div>
    </>
  );
}
