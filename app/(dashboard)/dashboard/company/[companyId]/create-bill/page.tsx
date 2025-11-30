"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, addDoc, collection, Timestamp } from "firebase/firestore";

/* -------------------------------------------------------------------
    INTERFEȚE - EXACT CE AVEM ÎN SCHEMA + PRICE STRUCTURE
------------------------------------------------------------------- */

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

interface DetailField {
  id: string;
  name: string;
  type: "number";
}

interface Section {
  id?: string;
  title: string;
  type:
    | "custom"
    | "vehicle_categories"
    | "services"
    | "details_values";
  fields?: any[];

  vehicleCategories?: VehicleCategory[];
  services?: ServiceItem[];
  detailFields?: DetailField[];
}

interface PriceTable {
  prices: {
    [categoryId: string]: {
      [size: string]: {
        [serviceId: string]: number;
      };
    };
  };
}

/* -------------------------------------------------------------------
    COMPONENTA CREATE BILL
------------------------------------------------------------------- */

export default function CreateBillPage() {
  const { companyId } = useParams();
  const router = useRouter();

  const [schema, setSchema] = useState<Section[]>([]);
  const [prices, setPrices] = useState<PriceTable>({ prices: {} });
  const [loading, setLoading] = useState(true);

  /* --- FORM STATE --- */
  const [client, setClient] = useState({
    name: "",
    carBrand: "",
    number: "",
    km: "",
    phone: "",
  });

  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [serviceInputs, setServiceInputs] = useState<any>({});
  const [detailInputs, setDetailInputs] = useState<any>({});

  /* -------------------------------------------------------------------
      LOAD SCHEMA + PRICES
  ------------------------------------------------------------------- */
  useEffect(() => {
    const loadData = async () => {
      const schemaSnap = await getDoc(
        doc(db, "companyBillSchemas", companyId)
      );

      if (!schemaSnap.exists()) {
        alert("Schema nu există!");
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

    loadData();
  }, [companyId]);

  if (loading) return <p className="text-center mt-10">Se încarcă...</p>;

  /* -------------------------------------------------------------------
      EXTRAGEM SECTIUNILE NECESARE
  ------------------------------------------------------------------- */

  const categorySection = schema.find((s) => s.type === "vehicle_categories");
  const servicesSection = schema.find((s) => s.type === "services");
  const detailsSection = schema.find((s) => s.type === "details_values");

  if (!categorySection || !servicesSection) {
    return (
      <p className="text-red-600 text-center mt-10">
        Schema incompletă!
      </p>
    );
  }

  /* -------------------------------------------------------------------
      CALCUL TOTAL
  ------------------------------------------------------------------- */
  const calculateTotal = () => {
    if (!selectedCategory || !selectedSize) return 0;

    let total = 0;

    servicesSection.services?.forEach((srv) => {
      const count = serviceInputs[srv.id] || 0;

      if (count > 0) {
        const price =
          prices.prices?.[selectedCategory]?.[selectedSize]?.[srv.id] || 0;

        total += price * count;
      }
    });

    return total;
  };

  const totalPrice = calculateTotal();

  /* -------------------------------------------------------------------
      SAVE BILL
  ------------------------------------------------------------------- */
  const createBill = async () => {
    if (!selectedCategory || !selectedSize) {
      alert("Selectează tip auto și mărime!");
      return;
    }

    const billData = {
      companyId,
      client,
      car: {
        category: selectedCategory,
        size: selectedSize,
      },
      services: serviceInputs,
      details: detailInputs,
      total: totalPrice,
      createdAt: Timestamp.now(),
    };

    const ref = await addDoc(
      collection(db, "companyBills", companyId as string, "bills"),
      billData
    );

    window.open(`/print/${companyId}/${ref.id}`, "_blank");
  };

  /* -------------------------------------------------------------------
      UI RENDER
  ------------------------------------------------------------------- */

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-6">Creare Factură</h1>

      {/* ------------------ DATE CLIENT ------------------ */}
      <div className="border p-4 rounded mb-6">
        <h2 className="text-lg font-semibold mb-3">Date Client</h2>

        <div className="grid grid-cols-2 gap-4">
          {Object.keys(client).map((key) => (
            <input
              key={key}
              className="border p-2 rounded"
              placeholder={key}
              value={(client as any)[key]}
              onChange={(e) =>
                setClient({ ...client, [key]: e.target.value })
              }
            />
          ))}
        </div>
      </div>

      {/* ------------------ TIP AUTO ------------------ */}
      <div className="border p-4 rounded mb-6">
        <h2 className="text-lg font-semibold mb-3">Tip Auto</h2>

        <select
          className="border p-2 rounded w-full mb-3"
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setSelectedSize("");
          }}
        >
          <option value="">Selectează categoria</option>
          {categorySection.vehicleCategories?.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        {selectedCategory && (
          <select
            className="border p-2 rounded w-full"
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
          >
            <option value="">Selectează mărime</option>
            {categorySection.vehicleCategories
              ?.find((c) => c.id === selectedCategory)
              ?.sizes.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
          </select>
        )}
      </div>

      {/* ------------------ SERVICII ------------------ */}
      <div className="border p-4 rounded mb-6">
        <h2 className="text-lg font-semibold mb-3">Servicii</h2>

        {servicesSection.services?.map((srv) => (
          <div
            key={srv.id}
            className="flex items-center gap-4 mb-3 border p-3 rounded"
          >
            <span className="flex-1">{srv.name}</span>

            <input
              type="number"
              className="border p-2 w-24 rounded"
              value={serviceInputs[srv.id] || ""}
              onChange={(e) =>
                setServiceInputs({
                  ...serviceInputs,
                  [srv.id]: Number(e.target.value),
                })
              }
            />
          </div>
        ))}
      </div>

      {/* ------------------ DETALII TEHNICE ------------------ */}
      {detailsSection && (
        <div className="border p-4 rounded mb-6">
          <h2 className="text-lg font-semibold mb-3">Detalii</h2>

          {detailsSection.detailFields?.map((df) => (
            <div
              key={df.id}
              className="flex items-center gap-4 mb-3 border p-3 rounded"
            >
              <span className="flex-1">{df.name}</span>

              <input
                type="number"
                className="border p-2 w-24 rounded"
                value={detailInputs[df.id] || ""}
                onChange={(e) =>
                  setDetailInputs({
                    ...detailInputs,
                    [df.id]: Number(e.target.value),
                  })
                }
              />
            </div>
          ))}
        </div>
      )}

      {/* ------------------ TOTAL ------------------ */}
      <div className="text-right text-xl font-bold mb-4">
        Total: {totalPrice} lei
      </div>

      {/* ------------------ BUTTON ------------------ */}
      <button
        onClick={createBill}
        className="bg-green-600 text-white px-5 py-3 rounded-lg text-lg"
      >
        Creare Factură
      </button>
    </div>
  );
}
