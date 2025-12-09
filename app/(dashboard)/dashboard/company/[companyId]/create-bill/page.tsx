"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { getAuth } from "firebase/auth";
import { getUserRole } from "@/lib/auth";
import { doc, getDoc, addDoc, collection, Timestamp } from "firebase/firestore";

/* -------------------------------------------------------
   INTERFEȚE COMPLETE – pentru TOATE tipurile de secțiune
-------------------------------------------------------- */
type SectionType =
  | "custom"
  | "list"
  | "richtext"
  | "images"
  | "youtube"
  | "files"
  | "vehicle_categories"
  | "services"
  | "details_values";

interface Field {
  id: string;
  name: string;
  type: string;
}

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
  type: SectionType;
  fields?: Field[];

  vehicleCategories?: VehicleCategory[];
  services?: ServiceItem[];
  detailFields?: DetailField[];

  images?: any[];
  items?: string[];
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

/* -------------------------------------------------------
   COMPONENTA PRINCIPALĂ
-------------------------------------------------------- */
export default function CreateBillPage() {
  const { companyId } = useParams();
  const user = getAuth().currentUser;
  const [schema, setSchema] = useState<Section[]>([]);
  const [prices, setPrices] = useState<PriceTable>({ prices: {} });
  const [loading, setLoading] = useState(true);

  /* FORM STATE */
  const [form, setForm] = useState<any>({});

  /* -------------------------------------------------------
        LOAD SCHEMA + PRICES DIN FIREBASE
  -------------------------------------------------------- */
  useEffect(() => {
    const load = async () => {
      const schemaSnap = await getDoc(doc(db, "companyBillSchemas", companyId));

      if (!schemaSnap.exists()) {
        alert("Schema nu există!");
        setLoading(false);
        return;
      }

      setSchema(schemaSnap.data().sections || []);

      const priceSnap = await getDoc(doc(db, "companyBillPrices", companyId));

      if (priceSnap.exists()) {
        setPrices(priceSnap.data() as PriceTable);
      }

      setLoading(false);
    };

    load();
  }, [companyId]);

  if (loading) return <p className="text-center mt-10">Loading…</p>;

  /* -------------------------------------------------------
        SALVARE FACTURĂ
  -------------------------------------------------------- */
  const [saving, setSaving] = useState(false);

const saveBill = async () => {
  if (saving) return; // PREVINE DUBLA EXECUȚIE
  setSaving(true);

  const total = calculateTotal();
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) return alert("Nu ești autentificat.");

  const role = await getUserRole();

  const ref = await addDoc(
    collection(db, "companyBills", companyId as string, "bills"),
    {
      companyId,
      form: {
        ...form,
        calculatedTotal: total,
      },
      createdAt: Timestamp.now(),
      createdBy: user.email || user.uid,
      createdById: user.uid,
      createdByRole: role,
    }
  );

  window.open(`/print/${companyId}/${ref.id}`, "_blank");
  setSaving(false);
};



  /* -------------------------------------------------------
        HANDLER INPUT GENERIC
  -------------------------------------------------------- */
  const updateField = (sectionId: string, fieldId: string, value: any) => {
    setForm({
      ...form,
      [sectionId]: {
        ...(form[sectionId] || {}),
        [fieldId]: value,
      },
    });
  };

  const calculateTotal = () => {
    let total = 0;

    const priceTable = prices.prices;

    // găsim secțiunea Tip Auto
    const secTipAuto = schema.find((s) => s.type === "vehicle_categories");
    const tipAuto = form[secTipAuto?.id || ""] || {};

    const categoryId = tipAuto.category;
    const size = tipAuto.size;

    if (!categoryId || !size) return 0; // nu avem tot ce trebuie

    // Secțiunea Servicii
    const secServicii = schema.find((s) => s.type === "services");
    const serviceValues = form[secServicii?.id || ""] || {};

    // pentru fiecare serviciu completat
    Object.entries(serviceValues).forEach(([serviceId, count]) => {
      if (!count) return;

      const price = priceTable?.[categoryId]?.[size]?.[serviceId] ?? 0;

      total += price * count;
    });

    return total;
  };

  /* -------------------------------------------------------
        RENDER DINAMIC – TOATE TIPURILE
  -------------------------------------------------------- */
  const renderSection = (section: Section) => {
    const sid = section.id as string;

    switch (section.type) {
      /* -------------------------------------------
            CUSTOM FIELDS (text, number etc)
      -------------------------------------------- */
      case "custom":
        return (
          <div className="border p-4 rounded mb-6">
            <h2 className="font-semibold mb-3">{section.title}</h2>

            {section.fields?.map((f) => (
              <div key={f.id} className="mb-3">
                <label className="block mb-1">{f.name}</label>
                <input
                  className="border p-2 rounded w-full"
                  type={f.type === "number" ? "number" : "text"}
                  value={form[sid]?.[f.id] || ""}
                  onChange={(e) => updateField(sid, f.id, e.target.value)}
                />
              </div>
            ))}
          </div>
        );

      /* -------------------------------------------
            VEHICLE CATEGORIES
      -------------------------------------------- */
      case "vehicle_categories":
        return (
          <div className="border p-4 rounded mb-6">
            <h2 className="font-semibold mb-3">{section.title}</h2>

            {/* Categoria */}
            <select
              className="border p-2 rounded w-full mb-3"
              value={form[sid]?.category || ""}
              onChange={(e) => updateField(sid, "category", e.target.value)}
            >
              <option value="">Selectează categoria</option>

              {section.vehicleCategories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Mărimi */}
            {form[sid]?.category && (
              <select
                className="border p-2 rounded w-full"
                value={form[sid]?.size || ""}
                onChange={(e) => updateField(sid, "size", e.target.value)}
              >
                <option value="">Selectează mărime</option>

                {section.vehicleCategories
                  ?.find((c) => c.id === form[sid].category)
                  ?.sizes.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
              </select>
            )}
          </div>
        );

      /* -------------------------------------------
      SERVICES
-------------------------------------------- */
      case "services":
        const secTipAuto = schema.find((s) => s.type === "vehicle_categories");
        const tipAuto = form[secTipAuto?.id || ""] || {};
        const categoryId = tipAuto.category;
        const size = tipAuto.size;

        return (
          <div className="border p-4 rounded mb-6">
            <h2 className="font-semibold mb-3">{section.title}</h2>

            {/* HEADER — col 1 auto, celelalte fixe */}
            <div className="grid grid-cols-[auto_120px_100px_120px] text-sm font-semibold mb-2">
              <div>Serviciu</div>
              <div className="text-left">Preț / roată</div>
              <div className="text-left">Nr. roți</div>
              <div className="text-center">Total</div>
            </div>

            {/* ROWS */}
            {section.services?.map((srv) => {
              const price = prices.prices?.[categoryId]?.[size]?.[srv.id] ?? 0;
              const count = form[sid]?.[srv.id] || 0;

              return (
                <div
                  key={srv.id}
                  className="grid grid-cols-[auto_120px_90px_120px] gap-3 items-center border p-3 rounded mb-2"
                >
                  {/* Serviciu */}
                  <span>{srv.name}</span>

                  {/* Preț centrat */}
                  <span className="text-center">{price} lei</span>

                  {/* Nr. roți centrat 100% */}
                  <input
                    type="number"
                    min="0"
                    className="border p-2 rounded w-full text-center"
                    value={count}
                    onChange={(e) =>
                      updateField(sid, srv.id, Number(e.target.value))
                    }
                  />

                  {/* Total align right */}
                  <span className="font-bold text-right pr-2">
                    {(price * count).toFixed(2)} lei
                  </span>
                </div>
              );
            })}
          </div>
        );

      /* -------------------------------------------
            DETAILS
      -------------------------------------------- */
      case "details_values":
        return (
          <div className="border p-4 rounded mb-6">
            <h2 className="font-semibold mb-3">{section.title}</h2>

            {section.detailFields?.map((df) => (
              <div
                key={df.id}
                className="flex items-center gap-4 mb-3 border p-3 rounded"
              >
                <span className="flex-1">{df.name}</span>

                <input
                  type="number"
                  className="border p-2 w-24 rounded"
                  value={form[sid]?.[df.id] || ""}
                  onChange={(e) =>
                    updateField(sid, df.id, Number(e.target.value))
                  }
                />
              </div>
            ))}
          </div>
        );

      /* -------------------------------------------
            LIST
      -------------------------------------------- */
      case "list":
        return (
          <div className="border p-4 rounded mb-6">
            <h2 className="font-semibold mb-4">{section.title}</h2>

            <ul className="list-disc ml-6 text-gray-700">
              {section.items?.map((item: string, idx: number) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        );

      /* -------------------------------------------
            RICH TEXT
      -------------------------------------------- */
      case "richtext":
        return (
          <div
            className="border p-4 rounded mb-6 prose"
            dangerouslySetInnerHTML={{
              __html: section.fields?.[0]?.value || "",
            }}
          />
        );

      /* -------------------------------------------
            IMAGES
      -------------------------------------------- */
      case "images":
        return (
          <div className="border p-4 rounded mb-6">
            <h2 className="font-semibold mb-2">{section.title}</h2>
            <div className="flex flex-wrap gap-3">
              {section.images?.map((img) => (
                <img
                  key={img.id}
                  src={img.src}
                  className="w-32 h-32 object-cover rounded"
                />
              ))}
            </div>
          </div>
        );

      /* -------------------------------------------
            YOUTUBE
      -------------------------------------------- */
      case "youtube":
        return (
          <div className="border p-4 rounded mb-6">
            <h2 className="font-semibold mb-2">{section.title}</h2>

            {section.items?.map((url, i) => (
              <iframe
                key={i}
                className="w-full h-64 mb-3 rounded"
                src={url.replace("watch?v=", "embed/")}
              ></iframe>
            ))}
          </div>
        );

      /* -------------------------------------------
            FILES
      -------------------------------------------- */
      case "files":
        return (
          <div className="border p-4 rounded mb-6">
            <h2 className="font-semibold mb-2">{section.title}</h2>

            {section.items?.map((fileUrl, i) => (
              <a
                key={i}
                className="block text-blue-600 underline mb-2"
                href={fileUrl}
                target="_blank"
              >
                {fileUrl}
              </a>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  /* -------------------------------------------------------
        UI PAGE
  -------------------------------------------------------- */
  return (
    <div className="w-full max-w-[1800px] mx-auto px-4">
      <h1 className="text-3xl font-bold mb-12 text-center">Creare Factură</h1>

      {/* --- GRID 2 COLUMNS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-10">
        {/* --- LEFT COLUMN (SERVICES ONLY) --- */}
        <div className="flex flex-col gap-8">
          {schema
            .filter((s) => s.type === "services")
            .map((section) => (
              <div key={section.id} className="bg-white p-6 rounded-xl shadow">
                {renderSection(section)}
              </div>
            ))}
        </div>

        {/* --- RIGHT COLUMN (ALL OTHER SECTIONS) --- */}
        <div className="flex flex-col gap-8">
          {schema
            .filter((s) => s.type !== "services")
            .map((section) => (
              <div key={section.id} className="bg-white p-6 rounded-xl shadow">
                {renderSection(section)}
              </div>
            ))}

          {/* TOTAL */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="font-semibold text-lg mb-2">Total estimat</h2>
            <p className="text-xl font-bold">{calculateTotal()} lei</p>
          </div>
        </div>
        {/* BUTTON */}
        <div className="flex justify-end">
          <button
            onClick={saveBill}
            className="bg-green-600 text-white px-6 py-3 rounded-lg text-lg"
          >
            Creare Factură
          </button>
        </div>
      </div>
    </div>
  );
}
