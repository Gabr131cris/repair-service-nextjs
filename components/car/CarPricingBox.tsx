"use client";

// Same formatter logic you use everywhere
function formatPrice(value: any) {
  const num = Number(value);
  if (isNaN(num)) return value; // safe fallback
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

interface CarPricingBoxProps {
  title: string;
  price: number;
  views?: number;
}

export default function CarPricingBox({
  title,
  price,
  views = 0,
}: CarPricingBoxProps) {
  return (
    <div className="w-full bg-white rounded-xl shadow-md p-5">

      {/* ROW: price + crypto + button */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        {/* LEFT SIDE: price + crypto */}
        <div className="flex items-center gap-4 flex-wrap">

          {/* PRICE (formatted correctly) */}
          <span className="text-3xl font-extrabold text-gray-900">
            USD ${formatPrice(price)}
          </span>

          {/* CRYPTO BADGE EXACT CA ÎN POZA TA */}
          <div className="flex items-center gap-2 bg-gray-100 px-4 py-1.5 rounded-full shadow-sm border border-gray-200">
            <span className="text-[14px] font-semibold text-gray-900">
              We also accept crypto
            </span>

            {/* Bitcoin Icon – cerc portocaliu */}
            <span className="w-5 h-5 rounded-full bg-[#f7931a] flex items-center justify-center">
              <span className="text-white text-xs font-bold">₿</span>
            </span>
          </div>

        </div>

        {/* RIGHT SIDE: BUTTON */}
        <button
          className="
            bg-black text-white py-2.5 px-8 rounded-lg font-semibold
            hover:bg-gray-900 transition w-full md:w-auto
          "
        >
          Check availability
        </button>

      </div>

    </div>
  );
}
