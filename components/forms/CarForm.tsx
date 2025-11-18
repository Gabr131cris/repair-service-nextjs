"use client"; // 🔹 trebuie să fie PRIMA linie

import { useEffect, useState } from "react";
import { getFirebaseAuth, getDb } from "@/lib/firebase";
import { getDocs, collection, query, where } from "firebase/firestore";
import { addCar } from "@/lib/firestore";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

interface Field {
  name: string;
  type: "text" | "number" | "list" | "icon-value" | "richtext";
  icon?: string;
  placeholder?: string;
}

interface Section {
  title: string;
  type: "custom" | "list" | "richtext" | "images" | "youtube"; // 🔹 adăugăm youtube
  fields?: Field[];
}

interface Props {
  initialData?: any;
  onSubmit?: (data: any) => Promise<void> | void;
}

export default function DynamicCarForm({ initialData = {}, onSubmit }: Props) {
  const [schema, setSchema] = useState<Section[]>([]);
  const [formData, setFormData] = useState<any>(initialData || {});
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState<any>(null);
  const [db, setDb] = useState<any>(null);
  const router = useRouter();

  // 🟢 Inițializează Firebase (auth + db) doar în browser
  useEffect(() => {
    (async () => {
      const authInstance = await getFirebaseAuth();
      const dbInstance = getDb();
      setAuth(authInstance);
      setDb(dbInstance);
    })();
  }, []);

  // ✅ Încarcă schema din Firestore (doar după ce db este inițializat)
  useEffect(() => {
    if (!db) return;

    const fetchSchema = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "car_schemas"));
        const sections = querySnapshot.docs.map((doc) =>
          doc.data()
        ) as Section[];
        const sorted = sections.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setSchema(sorted);
      } catch (error) {
        console.error("Eroare la fetch schema:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchema();
  }, [db]);

  // ✅ Setează date inițiale în mod editare
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData(initialData);
    }
  }, [initialData]);

  // 🔹 Gestionare inputuri dinamice
  const handleChange = (
    sectionTitle: string,
    fieldName: string,
    value: any
  ) => {
    setFormData((prev: any) => ({
      ...prev,
      [sectionTitle]: {
        ...(prev[sectionTitle] || {}),
        [fieldName]: value,
      },
    }));
  };
  useEffect(() => {
    console.log("SCHEMA:", schema);
  }, [schema]);

  // 🔹 Generează stock automat la formular NOU
  useEffect(() => {
    // Așteaptă încărcarea reală a schemei
    if (loading) return;

    // Dacă edităm o mașină existentă, nu generăm un cod nou
    if (initialData && Object.keys(initialData).length > 0) return;

    if (!schema || schema.length === 0) return;

    // Găsim secțiunea care conține câmpul "stock"
    const stockSection = schema.find((s) =>
      s.fields?.some((f) => f.name === "stock")
    );

    if (!stockSection) {
      console.warn("Nu am găsit câmpul stock în schema!");
      return;
    }

    const newStock = generateStockCode();

    setFormData((prev: any) => ({
      ...prev,
      [stockSection.title]: {
        ...(prev[stockSection.title] || {}),
        stock: newStock,
      },
    }));
  }, [loading, schema]);

  // 🔹 Upload imagini
  // 🔹 Upload imagini (păstrează ordinea numerică/alfabetică a numelui fișierului)
  const handleImageUpload = async (
    sectionTitle: string,
    files: FileList | null
  ) => {
    if (!files) return;

    // 🔸 Convertim în array și sortăm alfabetic (1.jpg, 2.jpg, 10.jpg etc)
    const sortedFiles = Array.from(files).sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();

      // Dacă numele sunt numerice, sortează numeric (1,2,10)
      const aNum = parseInt(aName);
      const bNum = parseInt(bName);

      if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;

      // Altfel sortare alfabetică normală
      return aName.localeCompare(bName, undefined, { numeric: true });
    });

    const uploaded: any[] = [];

    const carId = formData.tempId || Date.now().toString();

    if (!formData.tempId) {
      setFormData((prev: any) => ({
        ...prev,
        tempId: carId,
      }));
    }

    // 🔹 Urcăm fișierele în ordinea sortată
    for (const file of sortedFiles) {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      formDataUpload.append("carId", carId);
      formDataUpload.append("section", sectionTitle);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });
      const data = await res.json();

      if (data.url)
        uploaded.push({
          name: file.name,
          src: data.url,
        });
    }

    // 🔹 Le adăugăm la formData în ordinea corectă
    setFormData((prev: any) => ({
      ...prev,
      [sectionTitle]: {
        ...(prev[sectionTitle] || {}),
        images: [...((prev[sectionTitle]?.images as any[]) || []), ...uploaded],
      },
    }));

    console.log(
      "✅ Upload complete:",
      uploaded.map((f) => f.name)
    );
  };

  // 🔹 Șterge imagine locală
  const removeImage = (sectionTitle: string, index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      [sectionTitle]: {
        ...prev[sectionTitle],
        images: prev[sectionTitle].images.filter(
          (_: any, i: number) => i !== index
        ),
      },
    }));
  };

  // 🔹 Submit — adaugă sau actualizează
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return alert("Trebuie să fii autentificat.");

    if (onSubmit) {
      // 🟢 Editare
      await onSubmit(formData);
      return;
    }

    // 🟢 Creare nouă
    /*await addCar({
      schemaData: formData,
      ownerId: user.uid,
      status: "pending",
      createdAt: new Date().toISOString(),
      tempId: formData.tempId || null,
    });*/

    // 🟦 GENERARE STOCK AUTOMAT - DOAR LA CREAREA ANUNȚULUI NOU

    // Gasim numele real al sectiunii Stock din schema builder
    const stockSectionName = findStockSectionName(schema);

    const stockCode = await generateUniqueStock(db, stockSectionName);

    // Injectăm în schemaData secțiunea corectă
    const updatedSchemaData = {
      ...formData,
      [stockSectionName]: {
        ...(formData[stockSectionName] || {}),
        stock: stockCode,
      },
    };

    await addCar({
      schemaData: updatedSchemaData,
      ownerId: user.uid,
      status: "pending",
      createdAt: new Date().toISOString(),
      tempId: formData.tempId || null,
    });

    alert("✅ Anunț adăugat cu succes!");
    router.push("/dashboard/cars");
  };

  if (loading)
    return <p className="text-center mt-6">Se încarcă formularul...</p>;

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md space-y-8"
    >
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        {onSubmit ? "Editează anunț" : "Adaugă anunț nou"}
      </h2>

      {schema.map((section, sIndex) => (
        <div key={sIndex} className="border-t pt-4">
          <h3 className="text-xl font-semibold mb-3">{section.title}</h3>

          {/* 🔹 Câmpuri custom */}
          {section.type === "custom" && (
            <div className="grid grid-cols-2 gap-4">
              {section.fields?.map((field, fIndex) => (
                <div key={fIndex}>
                  <label className="block text-sm font-medium mb-1">
                    {field.name}
                  </label>
                  <input
                    type={field.type === "number" ? "number" : "text"}
                    placeholder={field.placeholder || ""}
                    className="w-full border rounded-lg p-2"
                    //defaultValue={formData[section.title]?.[field.name] || ""}

                    value={formData[section.title]?.[field.name] || ""}
                    onChange={(e) =>
                      handleChange(section.title, field.name, e.target.value)
                    }
                  />
                </div>
              ))}
            </div>
          )}

          {/* 🔹 List Section */}
          {section.type === "list" && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <label className="block text-sm font-medium mb-2">
                Adaugă lista (un element pe linie)
              </label>

              <textarea
  className="w-full border rounded-lg p-3 h-40 font-mono text-sm"
  placeholder="Rear Wheel Drive&#10;Aluminum Wheels&#10;MP3 Capability&#10;..."
  value={formData[section.title]?.join("\n") || ""}
  onChange={(e) => {
    // când scrii sau dai Enter normal, las React să facă treaba
    const lines = e.target.value.split("\n");
    setFormData((prev: any) => ({
      ...prev,
      [section.title]: lines,
    }));
  }}
/>

            </div>
          )}

          {/* 🔹 Rich Text */}
          {section.type === "richtext" && (
            <div>
              <textarea
                className="w-full border rounded-lg p-2"
                rows={6}
                placeholder="Introduceți descrierea..."
                defaultValue={formData[section.title]?.content || ""}
                onChange={(e) =>
                  handleChange(section.title, "content", e.target.value)
                }
              ></textarea>
            </div>
          )}

          {/* 🔹 Image Section */}
          {section.type === "images" && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <label className="block text-sm font-medium mb-2">
                Imagini pentru <b>{section.title}</b>
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) =>
                  handleImageUpload(section.title, e.target.files)
                }
                className="mb-4"
              />

              <div className="flex flex-wrap gap-3">
                {(formData[section.title]?.images || []).map(
                  (img: any, i: number) => (
                    <div
                      key={i}
                      className="relative w-24 h-24 border rounded overflow-hidden"
                    >
                      <img
                        src={img.src}
                        alt="preview"
                        className="object-cover w-full h-full"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(section.title, i)}
                        className="absolute top-1 right-1 bg-white rounded-full p-1 text-red-500 shadow hover:bg-red-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* 🔹 YouTube Section */}
          {section.type === "youtube" && (
            <YouTubeLinksSection
              section={section}
              initialLinks={
                Array.isArray(formData[section.title])
                  ? formData[section.title]
                  : []
              }
              onChange={(links) =>
                setFormData((prev: any) => ({
                  ...prev,
                  [section.title]: links, // ✅ salvează direct array, fără "links"
                }))
              }
            />
          )}
        </div>
      ))}

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition"
      >
        {onSubmit ? "Salvează modificările" : "Salvează anunțul"}
      </button>
    </form>
  );
}

function findStockSectionName(schema: Section[]) {
  return (
    schema.find((s) => s.title.trim().toLowerCase() === "stock")?.title ||
    "Stock"
  );
}

function generateStockCode() {
  const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A-Z
  const number = Math.floor(100000 + Math.random() * 900000); // 6 digits
  return `${letter}${number}`;
}

// 🔥 Generează cod stock unic — nu se repetă în baza de date
async function generateUniqueStock(db: any, stockSectionName: string) {
  let stock = generateStockCode();
  let exists = true;

  while (exists) {
    const q = query(
      collection(db, "cars"),
      where(`schemaData.${stockSectionName}.stock`, "==", stock)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      exists = false; // Codul este liber
    } else {
      stock = generateStockCode(); // Codul exista -> generează altul
    }
  }

  return stock;
}
/*
// 🧩 List Section (Highlights)
function ListSection({
  section,
  onChange,
  initialItems = [],
}: {
  section: Section;
  onChange: (list: string[]) => void;
  initialItems?: string[];
}) {
  const [items, setItems] = useState<string[]>(
    Array.isArray(initialItems) ? initialItems : []
  );

  const addItem = () => setItems([...items, ""]);
  const removeItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    onChange(updated);
  };
  const updateItem = (index: number, value: string) => {
    const updated = [...items];
    updated[index] = value;
    setItems(updated);
    onChange(updated);
  };

  return (
    <div>
      <p className="text-sm text-gray-600 mb-2">
        Adaugă specificații sau avantaje:
      </p>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2 mb-2">
          <input
            value={item}
            onChange={(e) => updateItem(i, e.target.value)}
            placeholder={`Element ${i + 1}`}
            className="flex-1 border rounded-lg p-2"
          />
          <button
            type="button"
            onClick={() => removeItem(i)}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
      >
        <Plus size={16} /> Adaugă element
      </button>
    </div>
  );
}*/

// 🧩 YouTube Links Section
function YouTubeLinksSection({
  section,
  onChange,
  initialLinks = [],
}: {
  section: Section;
  onChange: (links: string[]) => void;
  initialLinks?: string[];
}) {
  const [links, setLinks] = useState<string[]>(
    Array.isArray(initialLinks) ? initialLinks : []
  );

  const addLink = () => setLinks([...links, ""]);
  const removeLink = (index: number) => {
    const updated = links.filter((_, i) => i !== index);
    setLinks(updated);
    onChange(updated);
  };
  const updateLink = (index: number, value: string) => {
    const updated = [...links];
    updated[index] = value;
    setLinks(updated);
    onChange(updated);
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <p className="text-sm text-gray-600 mb-2">
        Adaugă linkuri YouTube pentru <b>{section.title}</b>:
      </p>
      {links.map((link, i) => (
        <div key={i} className="flex items-center gap-2 mb-2">
          <input
            value={link}
            onChange={(e) => updateLink(i, e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="flex-1 border rounded-lg p-2"
          />
          <button
            type="button"
            onClick={() => removeLink(i)}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addLink}
        className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
      >
        <Plus size={16} /> Adaugă link
      </button>
    </div>
  );
}
