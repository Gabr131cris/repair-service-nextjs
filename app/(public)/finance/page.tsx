"use client";
export const dynamic = "force-dynamic";
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
  heroImage: string;
  title: string;
  description: string;
  rows: FinanceRow[];
}

export default function FinancePage() {
  const [content, setContent] = useState<FinanceData>({
    heroImage: "/images/hero-finance.jpg",
    title: "Finance Options",
    description:
      "A classic car isn’t just a dream purchase — it’s an investment. That’s why we’ve partnered with the industry’s most trusted lenders to offer our customers a one-on-one experience and simple, secure financing options.",
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

  /* ---------- Firestore load ---------- */
  useEffect(() => {
    const fetchData = async () => {
      const userRole = await getUserRole();
      setRole(userRole);

      const docRef = doc(db, "pages", "finance");
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        const data = snap.data() as FinanceData;
        // fallback pentru imagini lipsă
        setContent({
          ...data,
          heroImage: data.heroImage || "/images/placeholder-hero.jpg",
          rows:
            data.rows?.map((r) => ({
              items: r.items.map((i) => ({
                image: i.image || "/images/placeholder.jpg",
                link: i.link || "#",
              })),
            })) || [],
        });
      } else {
        await setDoc(docRef, content);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- Save to Firestore ---------- */
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

  /* ---------- Upload hero ---------- */
  const handleHeroUpload = async (file: File | null) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload-page", { method: "POST", body: formData });
    const data = await res.json();
    if (data.url) {
      setContent((prev) => ({ ...prev, heroImage: data.url }));
    }
  };

  /* ---------- Upload partner ---------- */
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
    if (data.url) {
      setContent((prev) => {
        const updated = [...prev.rows];
        updated[rowIndex].items[colIndex].image = data.url;
        return { ...prev, rows: updated };
      });
    }
  };

  /* ---------- Add Row ---------- */
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

  /* ---------- Remove Row ---------- */
  const removeRow = (rowIndex: number) => {
    setContent((prev) => ({
      ...prev,
      rows: prev.rows.filter((_, i) => i !== rowIndex),
    }));
  };

  return (
    <section className="bg-white text-gray-900 min-h-screen">
      {/* 🏁 Hero Section */}
      <div className="relative w-full h-[45vh] min-h-[420px] mb-12">
        <Image
          src={content.heroImage || "/images/placeholder-hero.jpg"}
          alt="Finance Hero"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/60 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          {isEditing ? (
            <>
              <input
                type="file"
                onChange={(e) => handleHeroUpload(e.target.files?.[0] || null)}
                className="text-xs bg-white/80 p-1 rounded mb-2"
              />
              <input
                type="text"
                value={content.title}
                onChange={(e) =>
                  setContent({ ...content, title: e.target.value })
                }
                className="text-4xl font-bold text-center border-b border-blue-400 focus:outline-none bg-transparent text-gray-900"
              />
            </>
          ) : (
            <>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 drop-shadow-md">
                {content.title}
              </h1>
              <p className="mt-3 text-gray-700 max-w-2xl mx-auto leading-relaxed">
                {content.description}
              </p>
            </>
          )}
        </div>
      </div>

      {/* 🧾 Main Content */}
      <div className="max-w-6xl mx-auto px-6 pb-16 space-y-12">
        {isEditing && (
          <textarea
            value={content.description}
            onChange={(e) =>
              setContent({ ...content, description: e.target.value })
            }
            className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 text-center mb-10"
          />
        )}

        {/* 💰 Partner Rows */}
        <div className="space-y-16">
          {content.rows.map((row, rowIndex) => (
            <div key={rowIndex} className="relative">
              {isEditing && (
                <button
                  onClick={() => removeRow(rowIndex)}
                  className="absolute -top-8 right-0 text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                >
                  🗑️ Remove Row
                </button>
              )}

              <div className="grid md:grid-cols-3 gap-8">
                {row.items.map((item, colIndex) => {
                  const imgSrc = item.image?.trim()
                    ? item.image
                    : "/images/placeholder.jpg";
                  return (
                    <div
                      key={colIndex}
                      className="flex flex-col items-center bg-gray-50 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition overflow-hidden"
                    >
                      <div className="relative w-full h-48 bg-white">
                        <Image
                          src={imgSrc}
                          alt={`Finance Partner ${colIndex}`}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-contain p-4"
                        />
                        {isEditing && (
                          <input
                            type="file"
                            onChange={(e) =>
                              handleImageUpload(
                                rowIndex,
                                colIndex,
                                e.target.files?.[0] || null
                              )
                            }
                            className="absolute bottom-2 left-2 text-xs bg-white/80 p-1 rounded"
                          />
                        )}
                      </div>

                      {isEditing ? (
                        <input
                          type="text"
                          value={item.link}
                          onChange={(e) => {
                            const updated = [...content.rows];
                            updated[rowIndex].items[colIndex].link =
                              e.target.value;
                            setContent({ ...content, rows: updated });
                          }}
                          placeholder="Enter partner link"
                          className="w-full border-t border-gray-300 p-2 text-sm text-center"
                        />
                      ) : (
                        <a
                          href={item.link || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline py-3 text-sm font-medium"
                        >
                          Visit Partner →
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* ➕ Add Row */}
        {isEditing && (
          <div className="text-center">
            <button
              onClick={addRow}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium"
            >
              + Add Row
            </button>
          </div>
        )}

        {/* 🧭 Admin Controls */}
        {role === "superadmin" && (
          <div className="text-center mt-12">
            <button
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition ${
                isEditing
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
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
