"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Save } from "lucide-react";

/* ============================
    TYPES MATCH SCHEMA-BILL
============================ */
interface VehicleCategory {
  id: string;
  name: string;
  sizes: string[];
}

interface ServiceItem {
  id: string;
  name: string;
  defaultWheels: number;
}

interface Section {
  id?: string;
  title: string;
  type:
    | "custom"
    | "list"
    | "richtext"
    | "images"
    | "youtube"
    | "files"
    | "vehicle_categories"   // ← CORECT
    | "services";            // ← CORECT

  vehicleCategories?: VehicleCategory[];
  services?: ServiceItem[];
}

/* ============================
      PRICE STRUCTURE
============================ */
interface PriceTable {
  prices: {
    [categoryId: string]: {
      [size: string]: {
        [serviceId: string]: number;
      };
    };
  };
}

export default function BillPriceForm() {
  const { companyId } = useParams();
  const [schema, setSchema] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  const [prices, setPrices] = useState<PriceTable>({
    prices: {},
  });

  /* ============================
      LOAD SCHEMA + EXISTING PRICES
  ============================= */
  useEffect(() => {
    const loadSchema = async () => {
      const schemaSnap = await getDoc(
        doc(db, "companyBillSchemas", companyId)
      );

      if (!schemaSnap.exists()) {
        alert("Nu există schema pentru compania aceasta.");
        setLoading(false);
        return;
      }

      setSchema(schemaSnap.data().sections || []);

      const priceSnap = await getDoc(
        doc(db, "companyBillPrices", companyId)
      );

      if (priceSnap.exists()) {
        setPrices(priceSnap.data() as PriceTable);
      }

      setLoading(false);
    };

    loadSchema();
  }, [companyId]);

  /* ============================
      HANDLE PRICE EDIT
  ============================= */
  const setPrice = (
    categoryId: string,
    size: string,
    serviceId: string,
    value: number
  ) => {
    setPrices((prev) => {
      const updated = { ...prev };

      if (!updated.prices[categoryId]) updated.prices[categoryId] = {};
      if (!updated.prices[categoryId][size])
        updated.prices[categoryId][size] = {};

      updated.prices[categoryId][size][serviceId] = value;

      return { ...updated };
    });
  };

  /* ============================
      SAVE PRICES
  ============================= */
  const savePrices = async () => {
    await setDoc(
      doc(db, "companyBillPrices", companyId as string),
      prices
    );

    alert("Prețurile au fost salvate!");
  };

  if (loading)
    return <p className="text-center mt-10">Se încarcă...</p>;

  /* ============================
      UI
  ============================= */
  const vehicleSection = schema.find(
    (s) => s.type === "vehicle_categories"   // ← corectat
  );

  const servicesSection = schema.find(
    (s) => s.type === "services"
  );

  if (!vehicleSection || !servicesSection) {
    return (
      <p className="text-red-600 text-center mt-10">
        Schema incompletă – lipsește "vehicle_categories" sau "services".
      </p>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md">
      <h1 className="text-2xl font-semibold mb-6">
        Introducere prețuri servicii
      </h1>

      {vehicleSection.vehicleCategories!.map((cat) => (
        <div key={cat.id} className="mb-10 border rounded-lg p-5 bg-gray-50">
          <h2 className="text-xl font-bold mb-4">{cat.name}</h2>

          {cat.sizes.map((size) => (
            <div key={size} className="mb-6 border p-4 rounded bg-white">
              <h3 className="text-lg font-semibold mb-3">
                Mărime: {size}
              </h3>

              <div className="space-y-3">
                {servicesSection.services!.map((srv) => {
                  const value =
                    prices.prices?.[cat.id]?.[size]?.[srv.id] || "";

                  return (
                    <div
                      key={srv.id}
                      className="flex items-center gap-4 border p-3 rounded"
                    >
                      <span className="flex-1">{srv.name}</span>

                      <input
                        type="number"
                        className="border p-2 rounded w-32"
                        value={value}
                        onChange={(e) =>
                          setPrice(
                            cat.id,
                            size,
                            srv.id,
                            Number(e.target.value)
                          )
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ))}

      <button
        onClick={savePrices}
        className="bg-green-600 text-white px-5 py-2 rounded-lg mt-6 flex items-center gap-2"
      >
        <Save size={16} /> Save Prices
      </button>
    </div>
  );
}
