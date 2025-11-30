"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  Timestamp
} from "firebase/firestore";

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

    load();
  }, [companyId]);

  if (loading) return <p className="text-center mt-10">Loading…</p>;

  /* -------------------------------------------------------
        SALVARE FACTURĂ
  -------------------------------------------------------- */
  const saveBill = async () => {
    const ref = await addDoc(
      collection(db, "companyBills", companyId as string, "bills"),
      {
        companyId,
        form,
        createdAt: Timestamp.now()
      }
    );

    window.open(`/print/${companyId}/${ref.id}`, "_blank");
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
                  onChange={(e) =>
                    updateField(sid, f.id, e.target.value)
                  }
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
        return (
          <div className="border p-4 rounded mb-6">
            <h2 className="font-semibold mb-3">{section.title}</h2>

            {section.services?.map((srv) => (
              <div
                key={srv.id}
                className="flex items-center gap-4 mb-3 border p-3 rounded"
              >
                <span className="flex-1">{srv.name}</span>

                <input
                  type="number"
                  className="border p-2 w-24 rounded"
                  value={form[sid]?.[srv.id] || ""}
                  onChange={(e) =>
                    updateField(sid, srv.id, Number(e.target.value))
                  }
                />
              </div>
            ))}
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
              __html: section.fields?.[0]?.value || ""
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
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-6">Creare Factură</h1>

      {/* RENDER DINAMIC */}
      {schema.map((section) => (
        <div key={section.id}>{renderSection(section)}</div>
      ))}

      {/* BUTTON SAVE */}
      <button
        onClick={saveBill}
        className="bg-green-600 text-white px-5 py-3 rounded-lg text-lg"
      >
        Creare Factură
      </button>
    </div>
  );
}
