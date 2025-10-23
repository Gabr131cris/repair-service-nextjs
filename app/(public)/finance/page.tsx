"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { getUserRole } from "@/lib/auth";

interface FinanceItem {
  image: string;
  link: string;
}

interface FinanceRow {
  items: FinanceItem[];
}

interface FinanceData {
  title: string;
  description: string;
  rows: FinanceRow[];
}

export default function FinancePage() {
  const [content, setContent] = useState<FinanceData>({
    title: "FINANCE",
    description:
      "A classic car isn’t just a dream purchase or impulse buy; it’s an investment. That’s why we’ve partnered with the industry’s most trusted lenders to offer our customers a one-on-one experience and simple, secure financing options.",
    rows: [
      {
        items: [
          { image: "/images/finance1.jpg", link: "#" },
          { image: "/images/finance2.jpg", link: "#" },
          { image: "/images/finance3.jpg", link: "#" },
        ],
      },
    ],
  });

  const [isEditing, setIsEditing] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  // 🔹 Load from Firestore
  useEffect(() => {
    const fetchData = async () => {
      const role = await getUserRole();
      setRole(role);

      const docRef = doc(db, "pages", "finance");
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        setContent(snap.data() as FinanceData);
      } else {
        await setDoc(docRef, content);
      }
    };
    fetchData();
  }, []);

  // 🔹 Save
  const handleSave = async () => {
    const docRef = doc(db, "pages", "finance");
    try {
      await updateDoc(docRef, content);
    } catch (err: any) {
      if (err.message.includes("No document to update")) {
        await setDoc(docRef, content);
      } else throw err;
    }
    setIsEditing(false);
    setStatus("✅ Finance page updated!");
    setTimeout(() => setStatus(""), 3000);
  };

  // 🔹 Upload image
  const handleImageUpload = async (
    rowIndex: number,
    colIndex: number,
    file: File | null
  ) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload-page", { method: "POST", body: formData });
    const data = await res.json();
    if (!data.url) return;

    setContent((prev) => {
      const updated = [...prev.rows];
      updated[rowIndex].items[colIndex].image = data.url;
      return { ...prev, rows: updated };
    });
  };

  // 🔹 Add new row (3 items)
  const addRow = () => {
    setContent((prev) => ({
      ...prev,
      rows: [
        ...prev.rows,
        {
          items: [
            { image: "/images/placeholder.jpg", link: "#" },
            { image: "/images/placeholder.jpg", link: "#" },
            { image: "/images/placeholder.jpg", link: "#" },
          ],
        },
      ],
    }));
  };

  // 🔹 Delete row
  const removeRow = (rowIndex: number) => {
    setContent((prev) => ({
      ...prev,
      rows: prev.rows.filter((_, i) => i !== rowIndex),
    }));
  };

  return (
    <section className="bg-white text-gray-900 py-12 px-6 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center">
          {isEditing ? (
            <input
              type="text"
              value={content.title}
              onChange={(e) => setContent({ ...content, title: e.target.value })}
              className="text-4xl font-bold border-b-2 border-blue-400 focus:outline-none text-center"
            />
          ) : (
            <h1 className="text-4xl font-bold mb-4">{content.title}</h1>
          )}

          {isEditing ? (
            <textarea
              value={content.description}
              onChange={(e) =>
                setContent({ ...content, description: e.target.value })
              }
              className="w-full border rounded-lg p-3 text-gray-700 text-center"
            />
          ) : (
            <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {content.description}
            </p>
          )}
        </div>

        <hr className="my-8 border-gray-300" />

        {/* Rows */}
        <div className="space-y-12">
          {content.rows.map((row, rowIndex) => (
            <div key={rowIndex} className="relative">
              {isEditing && (
                <button
                  onClick={() => removeRow(rowIndex)}
                  className="absolute -top-6 right-0 text-sm bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  🗑️ Delete Row
                </button>
              )}

              <div className="grid md:grid-cols-3 gap-8">
                {row.items.map((item, colIndex) => (
                  <div
                    key={colIndex}
                    className="flex flex-col items-center text-center border rounded-xl shadow-md p-4 hover:shadow-lg transition"
                  >
                    <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={item.image}
                        alt={`Finance ${colIndex}`}
                        fill
                        className="object-contain"
                      />
                      {isEditing && (
                        <input
                          type="file"
                          onChange={(e) =>
                            handleImageUpload(rowIndex, colIndex, e.target.files?.[0] || null)
                          }
                          className="absolute bottom-2 left-2 text-xs bg-white/80"
                        />
                      )}
                    </div>

                    {isEditing ? (
                      <input
                        type="text"
                        value={item.link}
                        onChange={(e) => {
                          const updated = [...content.rows];
                          updated[rowIndex].items[colIndex].link = e.target.value;
                          setContent({ ...content, rows: updated });
                        }}
                        placeholder="Enter link"
                        className="mt-3 w-full border p-2 rounded text-sm"
                      />
                    ) : (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline mt-3 text-sm"
                      >
                        Visit Partner →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Add Row */}
        {isEditing && (
          <div className="text-center">
            <button
              onClick={addRow}
              className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg font-medium"
            >
              + Add Row
            </button>
          </div>
        )}

        {/* Controls */}
        {role === "superadmin" && (
          <div className="text-center mt-8">
            <button
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className={`px-6 py-2 rounded-lg text-sm font-semibold ${
                isEditing
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-gray-700 hover:bg-gray-600 text-white"
              }`}
            >
              {isEditing ? "💾 Save Changes" : "✏️ Edit Page"}
            </button>
            {status && (
              <p className="mt-3 text-green-600 text-sm font-medium">{status}</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
